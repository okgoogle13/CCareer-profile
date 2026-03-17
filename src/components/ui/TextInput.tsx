import React from "react";
import { motion } from "motion/react";

type Props = {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

export function TextInput({ label, placeholder, value, onChange, type = "text" }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-widest">
        {label}
      </label>
      <motion.input
        type={type}
        whileFocus={{ scale: 1.01, x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-0)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-lg type-melancholyLonging focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] focus:shadow-[var(--sys-shadow-elevation2Placard)] text-[var(--sys-color-paperWhite-base)] transition-colors"
        style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
      />
    </div>
  );
}
