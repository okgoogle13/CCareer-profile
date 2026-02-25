import React, { useState } from 'react';
import { CareerDatabase, JobOpportunity, MatchAnalysis } from '../types';
import { generateMatchAnalysis } from '../services/geminiService';

interface MatchDashboardProps {
  careerData: CareerDatabase;
  job: JobOpportunity;
}

export const MatchDashboard: React.FC<MatchDashboardProps> = ({ careerData, job }) => {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Gaps */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-gray-700 pb-2">Skill Gap Analysis</h3>
          <div className="space-y-4">
            {analysis.Skill_Gaps.map((gap, i) => (
              <div key={i} className="bg-gray-900/50 p-3 rounded border border-gray-700/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-200">{gap.Skill}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                    gap.Match_Level === 'Strong' ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
                    gap.Match_Level === 'Partial' ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50' :
                    'bg-red-900/30 text-red-400 border border-red-800/50'
                  }`}>
                    {gap.Match_Level}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{gap.Evidence}</p>
              </div>
            ))}
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

      {/* Cover Letter */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-gray-700 pb-2">Drafted Cover Letter</h3>
        <textarea 
          className="w-full h-96 bg-gray-900 text-gray-300 p-6 rounded border border-gray-700 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
          defaultValue={analysis.Cover_Letter_Draft}
        />
      </div>
    </div>
  );
};
