import React from 'react';
import { CareerDatabase, MatchAnalysis } from '../types';

interface TailoredResumeViewProps {
  careerData: CareerDatabase;
  analysis: MatchAnalysis;
}

export const TailoredResumeView: React.FC<TailoredResumeViewProps> = ({ careerData, analysis }) => {
  const { Personal_Information, Career_Entries, Structured_Achievements, Master_Skills_Inventory } = careerData;

  // Filter and sort achievements: recommended ones first, then others, grouped by Entry_ID
  const getAchievementsForEntry = (entryId: string) => {
    const entryAchievements = Structured_Achievements.filter(a => a.Entry_ID === entryId);
    
    // Sort so recommended achievements appear first
    return entryAchievements.sort((a, b) => {
      const aIsRecommended = analysis.Recommended_Achievement_IDs.includes(a.Achievement_ID);
      const bIsRecommended = analysis.Recommended_Achievement_IDs.includes(b.Achievement_ID);
      if (aIsRecommended && !bIsRecommended) return -1;
      if (!aIsRecommended && bIsRecommended) return 1;
      return 0;
    });
  };

  // Filter entries to only those that have at least one recommended achievement, or just show all work experience
  // Let's show all Work Experience entries, but highlight recommended achievements.
  const workEntries = Career_Entries.filter(e => e.Entry_Type === "Work Experience")
    .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());

  const educationEntries = Career_Entries.filter(e => e.Entry_Type === "Education");

  return (
    <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 mb-2">
          {Personal_Information.FullName}
        </h1>
        <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-4">
          <span>{Personal_Information.Email}</span>
          <span>•</span>
          <span>{Personal_Information.Phone}</span>
          <span>•</span>
          <span>{Personal_Information.Location}</span>
        </div>
        {Personal_Information.Portfolio_Website_URLs?.length > 0 && (
          <div className="text-sm text-cyan-700 mt-2">
            {Personal_Information.Portfolio_Website_URLs.join(' | ')}
          </div>
        )}
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-3 pb-1">
          Professional Summary
        </h2>
        <p className="text-sm leading-relaxed text-gray-700">
          {analysis.Tailored_Summary}
        </p>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-3 pb-1">
          Core Competencies
        </h2>
        <div className="flex flex-wrap gap-2">
          {Master_Skills_Inventory.filter(s => s.Proficiency === 'Expert' || s.Proficiency === 'Master' || s.Proficiency === 'Proficient')
            .slice(0, 15)
            .map((skill, i) => {
              // Highlight skills that match the job gaps (Strong match)
              const isMatched = analysis.Skill_Gaps.some(g => g.Skill.toLowerCase() === skill.Skill_Name.toLowerCase() && g.Match_Level === 'Strong');
              return (
                <span 
                  key={i} 
                  className={`text-xs px-2 py-1 rounded-md border ${isMatched ? 'bg-cyan-50 border-cyan-200 text-cyan-800 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  {skill.Skill_Name}
                </span>
              );
          })}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-3 pb-1">
          Professional Experience
        </h2>
        <div className="space-y-6">
          {workEntries.map((entry, i) => {
            const achievements = getAchievementsForEntry(entry.Entry_ID);
            if (achievements.length === 0) return null;

            return (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-md font-bold text-gray-900">{entry.Role}</h3>
                  <span className="text-sm font-semibold text-gray-600">{entry.StartDate} – {entry.EndDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-semibold text-gray-700">{entry.Organization}</span>
                  <span className="text-sm text-gray-500 italic">{entry.Location}</span>
                </div>
                
                <ul className="list-disc list-outside ml-5 space-y-1.5">
                  {achievements.map((ach, j) => {
                    const isRecommended = analysis.Recommended_Achievement_IDs.includes(ach.Achievement_ID);
                    return (
                      <li 
                        key={j} 
                        className={`text-sm leading-relaxed pl-1 ${isRecommended ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                      >
                        {ach.Action_Verb} {ach.Noun_Task} {ach.Strategy} resulting in {ach.Outcome}.
                        {isRecommended && (
                          <span className="inline-block ml-2 w-2 h-2 rounded-full bg-cyan-500" title="Highly relevant to this job"></span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Education */}
      {educationEntries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-3 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {educationEntries.map((entry, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{entry.Role}</h3>
                  <span className="text-sm text-gray-700">{entry.Organization}</span>
                </div>
                <span className="text-sm text-gray-600">{entry.EndDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
