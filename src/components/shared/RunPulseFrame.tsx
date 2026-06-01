"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function RunPulseFrame({ children, pulseKey, order = 0 }: { children: React.ReactNode; pulseKey: string | null; order?: number }) {
  const reduceMotion = useReducedMotion();
  if (!pulseKey || reduceMotion) return <>{children}</>;

  return (
    <motion.div
      key={`${pulseKey}-${order}`}
      initial={{ boxShadow: "0 0 0 rgba(99,102,241,0)", scale: 1 }}
      animate={{
        boxShadow: [
          "0 0 0 rgba(99,102,241,0)",
          "0 0 28px rgba(99,102,241,0.32)",
          "0 0 0 rgba(99,102,241,0)"
        ],
        scale: [1, 1.006, 1]
      }}
      transition={{ delay: order * 0.14, duration: 0.72, ease: "easeOut" }}
      className="rounded-lg"
    >
      {children}
    </motion.div>
  );
}
