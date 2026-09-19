"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-1 px-1 py-3"
    >
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400" />
    </motion.div>
  );
}
