import React from 'react';
import { ATSScoreResult, DocumentType } from '../types';

interface SuggestionsPanelProps {
  score: ATSScoreResult | null;
  documentType: DocumentType;
}

export function SuggestionsPanel({ score, documentType }: SuggestionsPanelProps) {
  if (!score || score.suggestions.length === 0) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl space-y-4">
      <h4 className="font-bold text-sm text-cyan-400 uppercase tracking-widest">Optimization Suggestions</h4>
      <ul className="space-y-3">
        {score.suggestions.map((suggestion, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700/50">
            <span className="text-amber-500 font-bold shrink-0">!</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
      
      {documentType === 'resume' && score.missingKeywords.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Missing Keywords</h5>
          <div className="flex flex-wrap gap-2">
            {score.missingKeywords.slice(0, 10).map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-rose-900/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                {kw}
              </span>
            ))}
            {score.missingKeywords.length > 10 && (
              <span className="text-[10px] text-gray-500 self-center">+{score.missingKeywords.length - 10} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
