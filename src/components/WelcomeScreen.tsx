"use client";

import { Language } from "@/lib/types";

interface WelcomeScreenProps {
  onSelect: (lang: Language) => void;
}

export default function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div className="flex h-full items-center justify-center bg-white animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#111] sm:text-5xl">
          suchdirhilfe.de
        </h1>

        <p className="text-lg text-neutral-500">
          Welche Sprache möchtest du verwenden?
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => onSelect("de")}
            className="rounded-xl border border-neutral-200 px-10 py-4 text-lg font-medium text-[#111] transition-all hover:border-neutral-900 hover:shadow-sm active:scale-[0.98]"
          >
            Deutsch
          </button>
          <button
            onClick={() => onSelect("en")}
            className="rounded-xl border border-neutral-200 px-10 py-4 text-lg font-medium text-[#111] transition-all hover:border-neutral-900 hover:shadow-sm active:scale-[0.98]"
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
}
