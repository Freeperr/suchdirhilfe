"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface CookedScoreProps {
  score: number;
  language: "de" | "en";
  onRetreat: () => void;
}

export default function CookedScore({ score, language, onRetreat }: CookedScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="my-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center"
    >
      <div className="text-6xl font-bold tracking-tight text-[#111] sm:text-7xl">
        {displayScore}%
      </div>
      <div className="mt-2 text-sm font-medium uppercase tracking-widest text-neutral-400">
        COOKED
      </div>
      <div className="mt-4 text-sm text-neutral-500">
        {language === "de" ? "Rettungschance" : "Recovery chance"}: {100 - score}%
      </div>
      <button
        onClick={onRetreat}
        className="mt-6 rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-[#111] transition-all hover:border-neutral-900 hover:shadow-sm active:scale-[0.98]"
      >
        {language === "de" ? "Wie kann ich mich retten?" : "How can I save myself?"}
      </button>
    </motion.div>
  );
}
