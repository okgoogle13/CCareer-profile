import React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../ui/SectionHeader";
import { Textarea } from "../ui/Textarea";
import { TextInput } from "../ui/TextInput";
import { PrimaryButton } from "../ui/PrimaryButton";

export function JobInputPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, rotate: 1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="p-10 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] shadow-[var(--sys-shadow-elevation2Placard)] relative overflow-hidden" 
      style={{ borderRadius: 'var(--sys-shape-placardTorn01)' }}
    >
      {/* Wheat-paste noise background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wall-4-light.png')]" />
      
      <div className="relative z-10">
        <SectionHeader 
          title="Target Role" 
          subtitle="Paste the job description. We will extract the exact criteria they are using to filter you out."
        />
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TextInput label="Target Role" placeholder="e.g. Senior Frontend Engineer" />
            <TextInput label="Company Name" placeholder="e.g. TechCorp Inc." />
          </div>
          <Textarea label="Job Description (Raw Text)" placeholder="Paste the full job description here..." />
          <div className="flex justify-end">
            <PrimaryButton label="Analyze Requirements" onClick={() => {}} variant="strike" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
