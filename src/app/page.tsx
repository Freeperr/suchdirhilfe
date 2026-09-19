"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Language, ToolId } from "@/lib/types";
import { getLanguage, setLanguage, clearChat, resetDailyLimit } from "@/lib/storage";
import { tools } from "@/lib/tools";
import WelcomeScreen from "@/components/WelcomeScreen";
import Sidebar from "@/components/Sidebar";
import ChatUI from "@/components/ChatUI";
import SettingsPanel from "@/components/SettingsPanel";

export default function Home() {
  const [language, setLang] = useState<Language | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>("excuse");
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = getLanguage();
    if (saved !== null) {
      setLang(saved);
    }
    setIsReady(true);
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).resetLimit = () => {
        resetDailyLimit();
        console.log("Limit reset. Reload the page.");
      };
    }
  }, []);

  const handleLanguageSelect = useCallback((lang: Language) => {
    setLang(lang);
    setLanguage(lang);
  }, []);

  const handleSelectTool = useCallback((newTool: ToolId) => {
    if (newTool !== activeTool) {
      clearChat(activeTool);
    }
    setActiveTool(newTool);
  }, [activeTool]);

  const handleNewChat = useCallback(() => {
    clearChat(activeTool);
    window.location.reload();
  }, [activeTool]);

  const handleClearChat = useCallback(() => {
    clearChat(activeTool);
    window.location.reload();
  }, [activeTool]);

  if (!isReady) return null;

  if (!language) {
    return <WelcomeScreen onSelect={handleLanguageSelect} />;
  }

  const currentTool = tools.find((t) => t.id === activeTool)!;

  return (
    <div className="flex h-full bg-white">
      <Sidebar
        activeTool={activeTool}
        language={language}
        onSelectTool={handleSelectTool}
        onOpenSettings={() => setShowSettings(true)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex shrink-0 items-center border-b border-neutral-200 bg-white px-4 py-3 lg:px-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mr-3 rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            <motion.h1
              key={activeTool}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold text-[#111]"
            >
              {currentTool.name[language]}
            </motion.h1>
          </AnimatePresence>
        </header>

        {/* Chat area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ChatUI toolId={activeTool} language={language} onNewChat={handleNewChat} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            language={language}
            onLanguageChange={(lang) => {
              setLang(lang);
              setLanguage(lang);
            }}
            onClearChat={handleClearChat}
            onNewChat={handleNewChat}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
