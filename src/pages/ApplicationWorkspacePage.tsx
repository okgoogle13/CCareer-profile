import React from "react";
import { motion } from "motion/react";
import { WorkspaceLayout } from "../components/layout/WorkspaceLayout";
import { JobInputPanel } from "../components/feature/JobInputPanel";
import { AiOutputsTabs } from "../components/feature/AiOutputsTabs";
import { SaveApplicationBar } from "../components/feature/SaveApplicationBar";

export function ApplicationWorkspacePage() {
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
            Application <br/><span className="text-[var(--sys-color-solidarityRed-base)]">Workspace</span>
          </h1>
          <p className="text-xl type-laborExploitationPressure text-[var(--sys-color-stencilYellow-base)] uppercase tracking-widest">
            NO NEUTRAL CANVAS. TAILOR YOUR RESPONSE.
          </p>
        </motion.div>
        
        <div className="space-y-12">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <JobInputPanel />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <AiOutputsTabs />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <SaveApplicationBar />
          </motion.div>
        </div>
      </motion.div>
    </WorkspaceLayout>
  );
}
