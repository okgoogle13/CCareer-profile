import React from 'react';
import { DocumentAudit } from '../types';

interface AuditDisplayProps {
  audit: DocumentAudit;
  title: string;
}

export const AuditDisplay: React.FC<AuditDisplayProps> = ({ audit, title }) => {
  const severityCounts = {
    error: audit.violations.filter(v => v.severity === 'error').length,
    warning: audit.violations.filter(v => v.severity === 'warning').length,
    info: audit.violations.filter(v => v.severity === 'info').length
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">{title} Audit</h3>
          <div className="flex gap-4 mt-1">
            <span className="text-xs font-bold text-red-400">{severityCounts.error} Errors</span>
            <span className="text-xs font-bold text-amber-400">{severityCounts.warning} Warnings</span>
            <span className="text-xs font-bold text-blue-400">{severityCounts.info} Suggestions</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${audit.overallScore >= 80 ? 'text-green-400' : audit.overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {audit.overallScore}/100
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">ATS Score</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Scan Simulation */}
        <div className="bg-cyan-900/10 border-l-4 border-cyan-500 p-4 rounded-r-lg">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">10-Second Recruiter Scan</h4>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "{audit.scanSimulation}"
          </p>
        </div>

        {/* Violations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rule Violations</h4>
          {audit.violations.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No violations found. Great job!</p>
          ) : (
            audit.violations.map((v, i) => {
              const styles = {
                error: 'border-red-500/30 bg-red-900/10 text-red-300',
                warning: 'border-amber-500/30 bg-amber-900/10 text-amber-300',
                info: 'border-blue-500/30 bg-blue-900/10 text-blue-300'
              }[v.severity];

              return (
                <div key={i} className={`p-3 rounded-lg border ${styles}`}>
                  <div className="flex justify-between items-start mb-1">
                    <code className="text-[10px] font-mono opacity-70">{v.ruleId}</code>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{v.severity}</span>
                  </div>
                  <p className="text-sm font-medium">{v.message}</p>
                  {v.location && <p className="text-[10px] mt-1 opacity-60 italic">Location: {v.location}</p>}
                </div>
              );
            })
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Actionable Recommendations</h4>
          <ul className="space-y-2">
            {audit.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-300">
                <span className="text-cyan-500 font-bold">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
