import React from 'react';
import { motion } from 'framer-motion';
import { ATSScoreResult, DocumentType } from '../types';

interface ATSScoreCardProps {
  score: ATSScoreResult | null;
  isCalculating: boolean;
  documentType: DocumentType;
}

export function ATSScoreCard({ score, isCalculating, documentType }: ATSScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-emerald-500';
    if (value >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (value: number) => {
    if (value >= 80) return 'stroke-emerald-500';
    if (value >= 60) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">ATS Score ({documentType === 'resume' ? 'Resume' : 'Cover Letter'})</h3>
        {isCalculating && (
          <span className="text-xs text-cyan-400 animate-pulse">Calculating...</span>
        )}
      </div>

      {score && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                className={`transition-all duration-1000 ease-out ${getScoreBg(score.overallScore)}`}
                strokeWidth="8" 
                strokeDasharray={`${score.overallScore * 2.827} 282.7`} 
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center`}>
              <span className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
                {score.overallScore}
              </span>
            </div>
          </div>

          <p className="text-center mt-4 text-sm text-gray-400">
            {score.overallScore >= 80 && 'Excellent match! Your document is highly optimized.'}
            {score.overallScore >= 60 && score.overallScore < 80 && 'Good match, but some optimization could help.'}
            {score.overallScore < 60 && 'Needs significant optimization to pass ATS filters.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
