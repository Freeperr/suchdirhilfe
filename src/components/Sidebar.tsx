"use client";

import { motion } from "framer-motion";
import { ToolId, Language } from "@/lib/types";
import { tools } from "@/lib/tools";

interface SidebarProps {
  activeTool: ToolId;
  language: Language;
  onSelectTool: (id: ToolId) => void;
  onOpenSettings: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const toolIcons: Record<ToolId, string> = {
  excuse: "🎭",
  cooked: "🔥",
  apology: "💌",
  decision: "⚖️",
};

export default function Sidebar({
  activeTool,
  language,
  onSelectTool,
  onOpenSettings,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col justify-between py-6">
      <div className="flex flex-col gap-1 px-3">
        <div className="mb-6 px-3">
          <span className="text-lg font-semibold tracking-tight text-[#111]">
            suchdirhilfe.de
          </span>
        </div>

        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              onSelectTool(tool.id);
              onCloseMobile();
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
              activeTool === tool.id
                ? "bg-neutral-100 text-[#111]"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <span className="text-base">{toolIcons[tool.id]}</span>
            <span>{tool.name[language]}</span>
          </button>
        ))}
      </div>

      <div className="px-3">
        <button
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          <span>{language === "de" ? "Einstellungen" : "Settings"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:block">
        {content}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={onCloseMobile}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 bg-white lg:hidden"
          >
            {content}
          </motion.aside>
        </>
      )}
    </>
  );
}
