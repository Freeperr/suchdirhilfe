"use client";

import { motion } from "framer-motion";
import { Language } from "@/lib/types";

interface SettingsPanelProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onClearChat: () => void;
  onNewChat: () => void;
  onClose: () => void;
}

export default function SettingsPanel({
  language,
  onLanguageChange,
  onClearChat,
  onNewChat,
  onClose,
}: SettingsPanelProps) {
  const t = (de: string, en: string) => (language === "de" ? de : en);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111]">
            {t("Einstellungen", "Settings")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Language */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-400">
              {t("Sprache", "Language")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onLanguageChange("de")}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  language === "de"
                    ? "border-neutral-900 bg-[#111] text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                Deutsch
              </button>
              <button
                onClick={() => onLanguageChange("en")}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  language === "en"
                    ? "border-neutral-900 bg-[#111] text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Actions */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-[#111] transition-all hover:border-neutral-300 hover:bg-neutral-50"
          >
            {t("Neuer Chat", "New Chat")}
          </button>

          <button
            onClick={() => {
              onClearChat();
              onClose();
            }}
            className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50"
          >
            {t("Chat löschen", "Clear Chat")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
