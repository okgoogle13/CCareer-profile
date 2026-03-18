import React from 'react';
import { CareerDatabase } from '../types';

interface QuickFormatProps {
  careerData: CareerDatabase;
}

export const QuickFormat: React.FC<QuickFormatProps> = ({ careerData }) => {
  return (
    <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-6 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)]">
      <h3 className="text-xl font-bold text-white mb-4">Quick Format</h3>
      <p className="text-[var(--sys-color-worker-ash-base)] mb-6">
        Select a visual theme to apply to your base profile.
      </p>
      {/* TODO: Implement theme selection and preview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-[var(--sys-color-charcoalBackground-steps-2)] rounded-lg border border-[var(--sys-color-concreteGrey-steps-0)] flex items-center justify-center text-[var(--sys-color-worker-ash-base)]">Theme 1</div>
        <div className="h-32 bg-[var(--sys-color-charcoalBackground-steps-2)] rounded-lg border border-[var(--sys-color-concreteGrey-steps-0)] flex items-center justify-center text-[var(--sys-color-worker-ash-base)]">Theme 2</div>
        <div className="h-32 bg-[var(--sys-color-charcoalBackground-steps-2)] rounded-lg border border-[var(--sys-color-concreteGrey-steps-0)] flex items-center justify-center text-[var(--sys-color-worker-ash-base)]">Theme 3</div>
      </div>
    </div>
  );
};
