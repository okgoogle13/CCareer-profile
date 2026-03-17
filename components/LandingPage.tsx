import React from 'react';
import { Briefcase } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sys-color-charcoalBackground-base)] p-6">
      <div className="max-w-2xl w-full p-12 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)]" style={{ borderRadius: 'var(--sys-shape-blockRiot02)' }}>
        
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[var(--sys-color-solidarityRed-base)] flex items-center justify-center" style={{ borderRadius: 'var(--sys-shape-blob01)' }}>
            <Briefcase className="w-10 h-10 text-[var(--sys-color-paperWhite-base)]" />
          </div>
        </div>

        <h1 className="text-center text-[var(--sys-color-paperWhite-base)] type-solidarityProtest text-5xl md:text-7xl mb-6 uppercase tracking-tighter leading-none">
          Career<br/><span className="text-[var(--sys-color-solidarityRed-base)]">Copilot</span>
        </h1>
        
        <p className="text-center type-melancholyLonging text-[var(--sys-color-worker-ash-base)] text-xl mb-12 max-w-lg mx-auto">
          Reclaim your time. Automate the ATS grind. Tailor your applications with precision and solidarity.
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={onLogin}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)] font-bold text-lg uppercase tracking-wider overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[var(--sys-shadow-elevation3HoverLift)]"
            style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
          >
            <span className="relative z-10">Sign in with Google</span>
            <div className="absolute inset-0 bg-[var(--sys-color-inkGold-base)] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-in-out z-0"></div>
            <span className="relative z-10 group-hover:text-[var(--sys-color-charcoalBackground-base)] transition-colors duration-300 delay-100">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
