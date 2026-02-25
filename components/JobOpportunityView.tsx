import React from 'react';
import { JobOpportunity } from '../types';

interface JobOpportunityViewProps {
  job: JobOpportunity;
  onReset: () => void;
  onAnalyzeFit: () => void;
}

export const JobOpportunityView: React.FC<JobOpportunityViewProps> = ({ job, onReset, onAnalyzeFit }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">{job.Job_Title}</h2>
          <p className="text-xl text-cyan-400 font-semibold">{job.Company_Name}</p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white transition-colors text-sm underline"
          >
            Extract Another
          </button>
          <button
            onClick={onAnalyzeFit}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
          >
            Analyze Fit & Generate Drafts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Location</span>
          <p className="text-gray-200">{job.Location}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Work Type</span>
          <p className="text-gray-200">{job.Work_Type}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Salary Range</span>
          <p className="text-gray-200">{job.Salary_Range}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Required Experience</span>
          <p className="text-gray-200">{job.Required_Experience}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Key Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {job.Key_Responsibilities.map((resp, i) => (
              <li key={i}>{resp}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Required Hard Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.Required_Hard_Skills.map((skill, i) => (
                <span key={i} className="bg-cyan-900/40 text-cyan-300 border border-cyan-700/30 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Required Soft Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.Required_Soft_Skills.map((skill, i) => (
                <span key={i} className="bg-indigo-900/40 text-indigo-300 border border-indigo-700/30 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {job.Preferred_Skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Preferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.Preferred_Skills.map((skill, i) => (
                <span key={i} className="bg-gray-700/50 text-gray-300 border border-gray-600/30 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.Suggested_Skills && job.Suggested_Skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Suggested Skills (Based on Your Profile)</h3>
            <div className="flex flex-wrap gap-2">
              {job.Suggested_Skills.map((skill, i) => (
                <span key={i} className="bg-amber-900/40 text-amber-300 border border-amber-700/30 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.Company_Culture_Keywords.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Company Culture</h3>
            <div className="flex flex-wrap gap-2">
              {job.Company_Culture_Keywords.map((keyword, i) => (
                <span key={i} className="bg-emerald-900/30 text-emerald-400 border border-emerald-700/30 px-3 py-1 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.Red_Flags.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-3 border-b border-red-900/50 pb-2">Potential Red Flags</h3>
            <div className="flex flex-wrap gap-2">
              {job.Red_Flags.map((flag, i) => (
                <span key={i} className="bg-red-900/30 text-red-400 border border-red-700/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Deadline: <span className="text-gray-300">{job.Application_Deadline}</span>
        </div>
        <a
          href={job.Source_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          View Original Posting
        </a>
      </div>
    </div>
  );
};
