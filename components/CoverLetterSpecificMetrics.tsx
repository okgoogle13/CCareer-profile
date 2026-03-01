import React from 'react';
import { CoverLetterScoreResult } from '../types';

interface CoverLetterSpecificMetricsProps {
  score: CoverLetterScoreResult;
  wordCount: number;
}

export function CoverLetterSpecificMetrics({ score, wordCount }: CoverLetterSpecificMetricsProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-emerald-400';
    if (value >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBgColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const MetricBar = ({ label, value, tooltip }: { label: string, value: number, tooltip: string }) => (
    <div className="space-y-1" title={tooltip}>
      <div className="flex justify-between text-xs font-bold text-gray-400">
        <span>{label}</span>
        <span className={getScoreColor(value)}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${getBgColor(value)}`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl space-y-4">
      <h4 className="font-bold text-sm text-cyan-400 uppercase tracking-widest">Cover Letter Metrics</h4>
      
      <MetricBar
        label="Keyword Placement"
        value={score.keywordPlacement}
        tooltip="Keywords found in the opening paragraph"
      />
      
      <MetricBar
        label="Narrative Quality"
        value={score.narrativeQuality}
        tooltip="Story quality with specific examples and achievements"
      />
      
      <MetricBar
        label="Personalization"
        value={score.personalizationScore}
        tooltip="Company-specific research and customization"
      />
      
      <MetricBar
        label="Professional Tone"
        value={score.toneProfessionalism}
        tooltip="Professionalism in greeting, closing, and overall tone"
      />
      
      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700">
        <span className="text-gray-400">Call to Action</span>
        <span className={score.callToActionPresent ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
          {score.callToActionPresent ? '✓ Present' : '✗ Missing'}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Word Count</span>
        <span className={
          wordCount >= 300 && wordCount <= 400 
            ? 'text-emerald-400 font-bold' 
            : 'text-amber-400 font-bold'
        }>
          {wordCount} / 300-400
        </span>
      </div>
    </div>
  );
}
