import React from "react";
import { motion } from "motion/react";

type Props = {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function Textarea({ label, placeholder, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest">
        {label}
      </label>
      <motion.textarea
        whileFocus={{ scale: 1.01, rotate: -0.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-6 bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-lg type-melancholyLonging min-h-[160px] focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] focus:shadow-[var(--sys-shadow-elevation2Placard)] text-[var(--sys-color-paperWhite-base)] transition-colors resize-y"
        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
      />
    </div>
  );
}
