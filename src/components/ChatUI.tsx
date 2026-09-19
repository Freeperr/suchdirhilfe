"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { Message, ToolId, Language } from "@/lib/types";
import { tools } from "@/lib/tools";
import { createMessage, saveChat, loadChat, clearChat, canSendMessage, incrementDailyMessageCount, getRemainingMessages, getDailyMessageCount } from "@/lib/storage";
import TypingIndicator from "./TypingIndicator";
import CookedScore from "./CookedScore";

interface ChatUIProps {
  toolId: ToolId;
  language: Language;
  onNewChat?: () => void;
}

function extractScore(text: string): number | null {
  const match = text.match(/(\d{1,3})\s*%/);
  if (match) {
    const score = parseInt(match[1], 10);
    if (score >= 0 && score <= 100) return score;
  }
  return null;
}

function stripChatEnded(text: string): string {
  return text.replace(/\n?\[CHAT_ENDED\]\s*$/, "").trim();
}

// Renders **bold** and *italic* as real React nodes (never raw HTML), so
// stray markdown never leaks as literal asterisks and the model's text can
// never inject HTML/scripts into the page.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`}>{match[1]}</strong>);
    } else {
      nodes.push(<em key={`${keyPrefix}-${i++}`}>{match[2]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function MessageContent({ content, language }: { content: string; language: Language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content.split("\n");
  const formatted = lines.map((line, i) => {
    if (line.trim() === "") {
      return <br key={i} />;
    }
    // A line that is *entirely* wrapped in ** is a section label, whatever
    // it says (works for any tool/language, not a fixed keyword list).
    const headingMatch = line.trim().match(/^\*\*(.+)\*\*$/);
    if (headingMatch) {
      return (
        <p key={i} className="mt-4 font-semibold text-[#111] first:mt-0">
          {renderInline(headingMatch[1], `${i}`)}
        </p>
      );
    }
    return (
      <p key={i} className="leading-relaxed">
        {renderInline(line, `${i}`)}
      </p>
    );
  });

  return (
    <div>
      {formatted}
      <div className="mt-3">
        <button
          onClick={() => handleCopy(content)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:border-neutral-300 hover:text-neutral-700"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {language === "de" ? "Kopiert" : "Copied"}
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              {language === "de" ? "Kopieren" : "Copy"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ChatUI({ toolId, language, onNewChat }: ChatUIProps) {
  const CHAT_ENDED = "[CHAT_ENDED]";
  const tool = tools.find((t) => t.id === toolId)!;
  const DAILY_LIMIT = 50;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [cookedScore, setCookedScore] = useState<number | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [remainingMessages, setRemainingMessages] = useState(DAILY_LIMIT);
  const [chatEnded, setChatEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = loadChat(toolId);
    setMessages(saved.messages);
    setShowSuggestions(saved.messages.length === 0);
    setCookedScore(null);
    setStreamingText("");
    setRemainingMessages(getRemainingMessages());
    setChatEnded(false);
  }, [toolId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      if (!canSendMessage()) return;

      const userMsg = createMessage("user", text.trim());
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      setShowSuggestions(false);
      setCookedScore(null);

      // Only counts against the daily limit once we actually get a real
      // answer back — a rejected/failed request shouldn't burn the user's
      // quota.
      saveChat(toolId, { messages: newMessages }, getDailyMessageCount());

      const finishWithAssistant = (content: string, countsTowardLimit: boolean) => {
        const assistantMsg = createMessage("assistant", content);
        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);
        if (countsTowardLimit) {
          const newCount = incrementDailyMessageCount();
          setRemainingMessages(DAILY_LIMIT - newCount);
        }
        saveChat(toolId, { messages: finalMessages }, getDailyMessageCount());
        return finalMessages;
      };

      try {
        abortControllerRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: toolId,
            language,
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          // Show the server's real (already localized) reason instead of a
          // generic "something broke" message — most non-ok responses are
          // ordinary validation replies, not crashes.
          const reason = await res.text().catch(() => "");
          finishWithAssistant(
            reason ||
              (language === "de"
                ? "Irgendwas ist schiefgelaufen. Versuch es nochmal."
                : "Something went wrong. Please try again."),
            false
          );
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let fullText = "";
        setStreamingText("");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamingText(fullText);
          scrollToBottom();
        }

        setStreamingText("");
        finishWithAssistant(fullText, true);

        if (fullText.includes(CHAT_ENDED)) {
          setChatEnded(true);
        }

        if (toolId === "cooked") {
          const score = extractScore(fullText);
          if (score !== null) setCookedScore(score);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        finishWithAssistant(
          language === "de"
            ? "Irgendwas ist schiefgelaufen. Versuch es nochmal."
            : "Something went wrong. Please try again.",
          false
        );
      } finally {
        setIsLoading(false);
        setStreamingText("");
        scrollToBottom();
      }
    },
    [messages, toolId, language, isLoading, scrollToBottom]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRetreat = () => {
    const q = language === "de"
      ? "Wie kann ich mich retten?"
      : "How can I save myself?";
    sendMessage(q);
  };

  const isLimitReached = remainingMessages <= 0;

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* Greeting */}
          {messages.length === 0 && !streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-[#111] sm:text-3xl">
                {tool.greeting[language]}
              </h2>

              {tool.suggestions && showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mt-6 flex flex-wrap gap-2"
                >
                  {tool.suggestions[language].map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-all hover:border-neutral-400 hover:text-[#111] active:scale-[0.97]"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-6 ${msg.role === "user" ? "flex justify-end" : ""}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl bg-[#111] px-5 py-3 text-sm leading-relaxed text-white">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full text-sm text-neutral-800">
                  <MessageContent content={stripChatEnded(msg.content)} language={language} />
                </div>
              )}
            </motion.div>
          ))}

          {/* Streaming */}
          {streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-sm text-neutral-800"
            >
              <MessageContent content={stripChatEnded(streamingText)} language={language} />
            </motion.div>
          )}

          {/* Typing indicator */}
          {isLoading && !streamingText && <TypingIndicator />}

          {/* Cooked score */}
          {cookedScore !== null && !isLoading && toolId === "cooked" && (
            <CookedScore score={cookedScore} language={language} onRetreat={handleRetreat} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 bg-white">
        {isLimitReached && (
          <div className="mx-auto max-w-2xl px-4 pt-3">
            <p className="text-center text-xs text-neutral-400">
              {language === "de"
                ? "Tageslimit erreicht. Morgen geht's weiter."
                : "Daily limit reached. Come back tomorrow."}
            </p>
          </div>
        )}
        {chatEnded && !isLimitReached && (
          <div className="mx-auto max-w-2xl px-4 py-4 text-center">
            <p className="mb-3 text-xs text-neutral-400">
              {language === "de"
                ? "Chat beendet."
                : "Chat ended."}
            </p>
            <button
              onClick={() => {
                if (onNewChat) {
                  onNewChat();
                } else {
                  clearChat(toolId);
                  window.location.reload();
                }
              }}
              className="rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-[#111] transition-all hover:border-neutral-900 hover:shadow-sm active:scale-[0.98]"
            >
              {language === "de" ? "Neuer Chat" : "New Chat"}
            </button>
          </div>
        )}
        {!chatEnded && (
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="flex items-end gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:border-neutral-300 focus-within:shadow-md">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLimitReached
                  ? (language === "de" ? "Tageslimit erreicht…" : "Daily limit reached…")
                  : tool.placeholder[language]}
                rows={1}
                disabled={isLimitReached}
                className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-sm text-[#111] outline-none placeholder:text-neutral-400 disabled:opacity-40"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || isLimitReached}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111] text-white transition-all hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-[#111]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
            {!isLimitReached && remainingMessages <= 10 && (
              <p className="mt-1.5 text-center text-[10px] text-neutral-300">
                {remainingMessages} {language === "de" ? "Nachrichten heute übrig" : "messages left today"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
