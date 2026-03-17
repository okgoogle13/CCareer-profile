import React from 'react';
import { CareerDatabase } from '../types';

interface DashboardProps {
  onCreateProfile: () => void;
  onUseExisting: () => void;
  onSkip: (tab: string) => void;
  onLoadDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateProfile, onUseExisting, onSkip, onLoadDemo }) => {
  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto">
      <h2 className="text-5xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter">
        Welcome <span className="text-[var(--sys-color-solidarityRed-base)]">Back!</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
          <h3 className="text-2xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] mb-6 uppercase tracking-tight">Master Profile</h3>
          <div className="space-y-4">
            <button 
              onClick={onCreateProfile} 
              className="block w-full text-left p-4 bg-[var(--sys-color-charcoalBackground-steps-3)] border-2 border-transparent hover:border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Create New Profile (Upload Docs)
            </button>
            <button 
              onClick={onUseExisting} 
              className="block w-full text-left p-4 bg-[var(--sys-color-charcoalBackground-steps-3)] border-2 border-transparent hover:border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Use Existing Profile
            </button>
            <button 
              onClick={onLoadDemo} 
              className="block w-full text-left p-4 bg-[var(--sys-color-inkGold-steps-0)] border-2 border-[var(--sys-color-inkGold-base)] text-[var(--sys-color-inkGold-base)] hover:bg-[var(--sys-color-inkGold-steps-1)] hover:text-[var(--sys-color-charcoalBackground-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Load Demo Profile
            </button>
          </div>
        </div>
        
        <div className="p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
          <h3 className="text-2xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] mb-6 uppercase tracking-tight">Quick Access</h3>
          <div className="space-y-4">
            <button 
              onClick={() => onSkip('job')} 
              className="block w-full text-left p-4 bg-[var(--sys-color-charcoalBackground-steps-3)] border-2 border-transparent hover:border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Opportunities
            </button>
            <button 
              onClick={() => onSkip('match')} 
              className="block w-full text-left p-4 bg-[var(--sys-color-charcoalBackground-steps-3)] border-2 border-transparent hover:border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Document Templating
            </button>
            <button 
              onClick={() => onSkip('format')} 
              className="block w-full text-left p-4 bg-[var(--sys-color-charcoalBackground-steps-3)] border-2 border-transparent hover:border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Quick Format
            </button>
            <button 
              onClick={() => onSkip('past')} 
              className="block w-full text-left p-4 bg-[var(--sys-color-charcoalBackground-steps-3)] border-2 border-transparent hover:border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-wider text-sm transition-all"
              style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
            >
              Past Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
