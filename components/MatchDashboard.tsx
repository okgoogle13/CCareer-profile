import React, { useState } from 'react';
import { CareerDatabase, JobOpportunity, MatchAnalysis } from '../types';
import { generateMatchAnalysis } from '../services/geminiService';
import { TailoredResumeView } from './TailoredResumeView';

interface MatchDashboardProps {
  careerData: CareerDatabase;
  job: JobOpportunity;
}

export const MatchDashboard: React.FC<MatchDashboardProps> = ({ careerData, job }) => {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'coverLetter'>('analysis');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMatchAnalysis(careerData, job);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-3xl font-bold text-white mb-4">Match & Tailor</h2>
        <p className="text-gray-400 mb-8">
          Compare your Master Career Database against the <strong>{job.Job_Title}</strong> role at <strong>{job.Company_Name}</strong>.
          We will generate a gap analysis, select your best achievements, and draft a tailored cover letter.
        </p>
        <button
          onClick={handleAnalyze}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
        >
          Generate Match Analysis
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-white">Analyzing Fit...</h2>
        <p className="text-gray-400 mt-2">Comparing your skills and achievements against the job requirements.</p>
      </div>
    );
  }

  if (!analysis) return null;

  // Map recommended achievements
  const recommendedAchievements = analysis.Recommended_Achievement_IDs.map(id => 
    careerData.Structured_Achievements.find(a => a.Achievement_ID === id)
  ).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Score Header */}
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex items-center gap-8">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="10" />
            <circle 
              cx="50" cy="50" r="45" fill="none" 
              stroke={analysis.Overall_Fit_Score >= 80 ? '#10B981' : analysis.Overall_Fit_Score >= 60 ? '#F59E0B' : '#EF4444'} 
              strokeWidth="10" 
              strokeDasharray={`${analysis.Overall_Fit_Score * 2.827} 282.7`} 
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{analysis.Overall_Fit_Score}%</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Fit Score</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Match Analysis Complete</h2>
          <p className="text-gray-400 text-lg">
            Your profile is a <strong>{analysis.Overall_Fit_Score >= 80 ? 'strong' : analysis.Overall_Fit_Score >= 60 ? 'moderate' : 'weak'} match</strong> for the {job.Job_Title} role at {job.Company_Name}.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${
            activeTab === 'analysis' ? 'bg-gray-800 text-cyan-400 border-t border-l border-r border-gray-700' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Gap Analysis
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${
            activeTab === 'resume' ? 'bg-gray-800 text-cyan-400 border-t border-l border-r border-gray-700' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Tailored Resume
        </button>
        <button
          onClick={() => setActiveTab('coverLetter')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${
            activeTab === 'coverLetter' ? 'bg-gray-800 text-cyan-400 border-t border-l border-r border-gray-700' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Cover Letter
        </button>
      </div>

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Gaps */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-gray-700 pb-2">Skill Gap Analysis</h3>
            <div className="space-y-3">
              {analysis.Skill_Gaps.map((gap, i) => {
                const levelStyles = {
                  Strong: {
                    bg: 'bg-green-900/40',
                    border: 'border-green-500/30',
                    text: 'text-green-300',
                    dot: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]',
                  },
                  Partial: {
                    bg: 'bg-amber-900/40',
                    border: 'border-amber-500/30',
                    text: 'text-amber-300',
                    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
                  },
                  Missing: {
                    bg: 'bg-red-900/40',
                    border: 'border-red-500/30',
                    text: 'text-red-300',
                    dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]',
                  },
                }[gap.Match_Level];

                return (
                  <div key={i} className={`p-4 rounded-lg border ${levelStyles.bg} ${levelStyles.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${levelStyles.dot}`} />
                        <span className={`font-bold ${levelStyles.text}`}>{gap.Skill}</span>
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${levelStyles.bg} ${levelStyles.border}`}>
                        {gap.Match_Level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 pl-5 border-l-2 border-gray-700 ml-1.5 py-1">
                      {gap.Evidence || 'No direct evidence found in the provided documents.'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-8">
            {/* Tailored Summary */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-gray-700 pb-2">Tailored Resume Summary</h3>
              <p className="text-gray-300 leading-relaxed bg-gray-900/50 p-4 rounded border border-gray-700/50">
                {analysis.Tailored_Summary}
              </p>
            </div>

            {/* Recommended Achievements */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-gray-700 pb-2">Top Achievements to Include</h3>
              <ul className="space-y-3">
                {recommendedAchievements.map((ach, i) => ach && (
                  <li key={i} className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded border border-gray-700/50 flex gap-3">
                    <span className="text-cyan-500 font-bold">•</span>
                    <span>{ach.Action_Verb} {ach.Noun_Task} {ach.Strategy} resulting in {ach.Outcome}.</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resume' && (
        <TailoredResumeView careerData={careerData} analysis={analysis} />
      )}

      {activeTab === 'coverLetter' && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-gray-700 pb-2">Drafted Cover Letter</h3>
          <textarea 
            className="w-full h-96 bg-gray-900 text-gray-300 p-6 rounded border border-gray-700 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
            defaultValue={analysis.Cover_Letter_Draft}
          />
        </div>
      )}
    </div>
  );
};
