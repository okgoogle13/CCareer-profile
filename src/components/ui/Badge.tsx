import React from "react";
import { motion } from "motion/react";

type Props = {
  label: string;
  variant?: 'default' | 'warning' | 'success' | 'danger';
};

export function Badge({ label, variant = 'default' }: Props) {
  let colorClass = "text-[var(--sys-color-paperWhite-base)] bg-[var(--sys-color-charcoalBackground-steps-3)] border-[var(--sys-color-concreteGrey-steps-0)]";
  
  if (variant === 'warning') {
    colorClass = "text-[var(--sys-color-charcoalBackground-base)] bg-[var(--sys-color-stencilYellow-base)] border-[var(--sys-color-stencilYellow-base)]";
  } else if (variant === 'success') {
    colorClass = "text-[var(--sys-color-charcoalBackground-base)] bg-[var(--sys-color-signalGreen-base)] border-[var(--sys-color-signalGreen-base)]";
  } else if (variant === 'danger') {
    colorClass = "text-[var(--sys-color-paperWhite-base)] bg-[var(--sys-color-solidarityRed-base)] border-[var(--sys-color-solidarityRed-base)]";
  }

  return (
    <motion.span
      whileHover={{ scale: 1.05, rotate: (Math.random() - 0.5) * 5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={`inline-block px-3 py-1 font-mono text-xs uppercase tracking-widest border-2 ${colorClass}`}
      style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}
    >
      {label}
    </motion.span>
  );
}
