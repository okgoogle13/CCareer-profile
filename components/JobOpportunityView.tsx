import React from 'react';
import { JobOpportunity } from '../types';

interface JobOpportunityViewProps {
  job: JobOpportunity;
  onReset: () => void;
}

export const JobOpportunityView: React.FC<JobOpportunityViewProps> = ({ job, onReset }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">{job.Job_Title}</h2>
          <p className="text-xl text-cyan-400 font-semibold">{job.Company_Name}</p>
        </div>
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-white transition-colors text-sm underline"
        >
          Extract Another
        </button>
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

        <div>
          <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.Required_Skills.map((skill, i) => (
              <span key={i} className="bg-cyan-900/40 text-cyan-300 border border-cyan-700/30 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
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

        {job.Company_Culture_Keywords.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Company Culture</h3>
            <div className="flex flex-wrap gap-2">
              {job.Company_Culture_Keywords.map((keyword, i) => (
                <span key={i} className="bg-amber-900/30 text-amber-400 border border-amber-700/30 px-3 py-1 rounded-full text-sm">
                  {keyword}
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
