import React from "react";
import { motion } from "motion/react";

export function Loader({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <motion.div
        animate={{
          rotate: [0, 10, -10, 360],
          scale: [1, 1.1, 0.9, 1],
          borderRadius: [
            "var(--sys-shape-blockRiot01)",
            "var(--sys-shape-blockRiot02)",
            "var(--sys-shape-blockRiot03)",
            "var(--sys-shape-blockRiot01)",
          ],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 1],
          repeat: Infinity,
        }}
        className="w-16 h-16 border-4 border-[var(--sys-color-solidarityRed-base)] border-t-transparent mb-8"
      />
      <h2 className="text-3xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tight">
        {message}
      </h2>
      <p className="type-melancholyLonging text-[var(--sys-color-worker-ash-base)] text-lg mt-4 max-w-2xl">
        The system is analyzing the data. Do not interrupt the process.
      </p>
    </div>
  );
}
