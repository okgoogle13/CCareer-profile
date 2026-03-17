import React from "react";
import { motion } from "motion/react";
import { WorkspaceLayout } from "../components/layout/WorkspaceLayout";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Textarea } from "../components/ui/Textarea";
import { TextInput } from "../components/ui/TextInput";
import { PrimaryButton } from "../components/ui/PrimaryButton";

export function ProfileEditorPage() {
  return (
    <WorkspaceLayout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15
            }
          }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-12">
          <h1 className="text-7xl type-extremeVariableContrast text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter leading-none mb-4">
            Base <br/><span className="text-[var(--sys-color-solidarityRed-base)]">Profile</span>
          </h1>
          <p className="text-xl type-laborExploitationPressure text-[var(--sys-color-stencilYellow-base)] uppercase tracking-widest">
            YOUR FOUNDATION. THE RAW MATERIAL.
          </p>
        </motion.div>
        
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="p-10 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] shadow-[var(--sys-shadow-elevation2Placard)] relative overflow-hidden" 
          style={{ borderRadius: 'var(--sys-shape-placardTorn01)' }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wall-4-light.png')]" />
          
          <div className="relative z-10">
            <SectionHeader 
              title="Resume / CV" 
              subtitle="Paste your master resume here. We will use this to tailor your applications."
            />
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TextInput label="Full Name" placeholder="e.g. Jane Doe" />
                <TextInput label="Email Address" placeholder="e.g. jane@example.com" type="email" />
              </div>
              <Textarea label="Master Resume (Raw Text)" placeholder="Paste your full resume here..." />
              <div className="flex justify-end">
                <PrimaryButton label="Save Profile" onClick={() => {}} variant="strike" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </WorkspaceLayout>
  );
}
