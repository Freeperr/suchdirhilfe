import { NextRequest } from "next/server";
import { getSystemPrompt } from "@/lib/tools";
import { Language, ToolId } from "@/lib/types";

export const runtime = "nodejs";

interface ChatRequest {
  tool: ToolId;
  language: Language;
  messages: { role: string; content: string }[];
}

const VALID_TOOLS: ToolId[] = ["excuse", "cooked", "apology", "decision"];

// Word-boundary anchored so substrings inside normal words (e.g. "Metall",
// "Metallwanne") never match. Includes German phrasings since most users
// write in German.
const BLOCKED_PATTERNS = [
  /ignore\s+(all\s+)?(previous|your|prior)\s+(instructions?|rules?|prompts?)/i,
  /ignorier(?:e|en)?\s+(alle\s+)?(vorherigen|deine|vorigen|bisherigen)\s+(anweisungen|regeln|instruktionen)/i,
  /\bsystem\s*prompt\b/i,
  /\bsystemanweisung(en)?\b/i,
  /you\s+are\s+(an?\s+)?(ai|language\s+model|chatbot|assistant)/i,
  /du\s+bist\s+(eine?\s+)?(ki|ai|sprachmodell|chatbot|assistent(in)?)\b/i,
  /what\s+(model|technology|api)\s+(are\s+you|do\s+you\s+use)/i,
  /welches\s+(modell|ki-?modell|sprachmodell)\s+(bist\s+du|nutzt\s+du|verwendest\s+du)/i,
  /\b(groq|openai|anthropic|llama)\b/i,
  /\bmeta\s*ai\b/i,
  /write\s+(a\s+|me\s+)?(code|program|script|html)/i,
  /schreib(e)?\s+(mir\s+)?(einen\s+|ein\s+)?(code|programm|skript|html)/i,
  /pretend\s+you\s+(are|were|have)/i,
  /tu\s+so\s+als\s+(ob\s+)?du/i,
  /act\s+as\s+if\s+you/i,
  /roleplay\s+as/i,
  /how\s+do\s+I\s+(hack|bypass|crack)/i,
  /wie\s+(kann\s+ich|hack(e|t)\s+ich).{0,20}(hacken|umgehen|knacken)/i,
];

function isPromptInjection(text: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(text));
}

function t(lang: Language, de: string, en: string): string {
  return lang === "en" ? en : de;
}

// Simple in-memory per-IP rate limit. This only protects a single running
// server process (resets per instance on serverless platforms), but it stops
// naive direct-to-API abuse of the paid Groq key since the daily limit in
// the UI is enforced client-side only and can be bypassed by calling this
// endpoint directly.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 40;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

  try {
    const body: ChatRequest = await req.json();
    const { tool, messages } = body;
    const language: Language = body.language === "en" ? "en" : "de";

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        t(language, "Zu viele Anfragen. Bitte warte kurz.", "Too many requests. Please wait a moment."),
        { status: 429 }
      );
    }

    if (!apiKey) {
      return new Response(
        t(language, "Serverkonfigurationsfehler.", "Server configuration error"),
        { status: 500 }
      );
    }

    if (!VALID_TOOLS.includes(tool)) {
      return new Response(t(language, "Ungültiges Tool", "Invalid tool"), { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(t(language, "Keine Nachrichten", "No messages"), { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg || typeof lastUserMsg.content !== "string") {
      return new Response(t(language, "Ungültige Nachricht", "Invalid message"), { status: 400 });
    }

    if (lastUserMsg.content.length > 2000) {
      return new Response(
        t(language, "Nachricht ist zu lang.", "Message is too long."),
        { status: 400 }
      );
    }

    if (isPromptInjection(lastUserMsg.content)) {
      return new Response(
        t(
          language,
          "Das gehört nicht zu diesem Tool. Frag mich zu deiner eigentlichen Situation.",
          "That's outside what this tool does. Ask me about your actual situation instead."
        ),
        { status: 400 }
      );
    }

    const sanitizedMessages = messages.map((m) => ({
      role: m.role === "user" || m.role === "assistant" ? m.role : "user",
      content: typeof m.content === "string" ? m.content.slice(0, 2000) : "",
    }));

    const systemPrompt = getSystemPrompt(tool, language);

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...sanitizedMessages,
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        stream: true,
        temperature: 0.9,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("Groq API error:", response.status, errBody);
      return new Response(
        t(
          language,
          "Der KI-Dienst ist gerade nicht erreichbar. Versuch es in ein paar Sekunden nochmal.",
          "The AI service is temporarily unavailable. Please try again in a few seconds."
        ),
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  controller.enqueue(encoder.encode(token));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream reading error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response("Something went wrong", { status: 500 });
  }
}
