import React from 'react';
import { CareerDatabase, MatchAnalysis } from '../types';
import { TemplateStyle } from '../constants';

interface TailoredResumeViewProps {
  careerData: CareerDatabase;
  analysis: MatchAnalysis;
  template: TemplateStyle;
}

export const TailoredResumeView: React.FC<TailoredResumeViewProps> = ({ careerData, analysis, template }) => {
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

  const workEntries = Career_Entries.filter(e => e.Entry_Type === "Work Experience")
    .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());

  const educationEntries = Career_Entries.filter(e => e.Entry_Type === "Education");

  return (
    <div 
      className="bg-white p-10 shadow-lg max-w-4xl mx-auto"
      style={{ 
        fontFamily: template.fontSans,
        color: template.textColor,
        lineHeight: '1.5'
      }}
    >
      {/* Header - ATS Friendly */}
      <div 
        className="text-center mb-8 border-b-2 pb-6"
        style={{ borderColor: template.primaryColor }}
      >
        <h1 
          className="text-4xl font-bold uppercase tracking-tight mb-2"
          style={{ color: template.primaryColor }}
        >
          {Personal_Information.FullName}
        </h1>
        {template.layout === 'single' && (
          <div className="text-sm flex flex-wrap justify-center gap-4 font-medium">
            <span>{Personal_Information.Email}</span>
            <span style={{ color: template.accentColor }}>•</span>
            <span>{Personal_Information.Phone}</span>
            <span style={{ color: template.accentColor }}>•</span>
            <span>{Personal_Information.Location}</span>
          </div>
        )}
        {template.layout === 'single' && Personal_Information.Portfolio_Website_URLs?.length > 0 && (
          <div 
            className="text-sm mt-2 font-semibold"
            style={{ color: template.secondaryColor }}
          >
            {Personal_Information.Portfolio_Website_URLs.join(' | ')}
          </div>
        )}
      </div>

      {template.layout === 'single' ? (
        <>
          {/* Professional Summary */}
          <div className="mb-8">
            <h2 
              className="text-xl font-bold uppercase border-b mb-3 pb-1 tracking-wide"
              style={{ 
                color: template.headingColor, 
                borderColor: template.borderColor,
                fontFamily: template.fontSerif 
              }}
            >
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed">
              {analysis.Tailored_Summary}
            </p>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h2 
              className="text-xl font-bold uppercase border-b mb-3 pb-1 tracking-wide"
              style={{ 
                color: template.headingColor, 
                borderColor: template.borderColor,
                fontFamily: template.fontSerif 
              }}
            >
              Core Competencies
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {Master_Skills_Inventory.filter(s => s.Proficiency === 'Expert' || s.Proficiency === 'Master' || s.Proficiency === 'Proficient')
                .slice(0, 20)
                .map((skill, i) => {
                  const isMatched = analysis.Skill_Gaps.some(g => g.Skill.toLowerCase() === skill.Skill_Name.toLowerCase() && g.Match_Level === 'Strong');
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isMatched ? template.accentColor : template.borderColor }} />
                      <span className={`text-sm ${isMatched ? 'font-bold' : ''}`}>
                        {skill.Skill_Name}
                      </span>
                    </div>
                  );
              })}
            </div>
          </div>

          {/* Professional Experience */}
          <div className="mb-8">
            <h2 
              className="text-xl font-bold uppercase border-b mb-4 pb-1 tracking-wide"
              style={{ 
                color: template.headingColor, 
                borderColor: template.borderColor,
                fontFamily: template.fontSerif 
              }}
            >
              Professional Experience
            </h2>
            <div className="space-y-8">
              {workEntries.map((entry, i) => {
                const achievements = getAchievementsForEntry(entry.Entry_ID);
                if (achievements.length === 0) return null;

                return (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-lg font-bold" style={{ color: template.primaryColor }}>{entry.Role}</h3>
                      <span className="text-sm font-bold opacity-80">{entry.StartDate} – {entry.EndDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-sm font-bold italic" style={{ color: template.secondaryColor }}>{entry.Organization}</span>
                      <span className="text-sm opacity-60 italic">{entry.Location}</span>
                    </div>
                    
                    <ul className="list-none ml-0 space-y-2">
                      {achievements.map((ach, j) => {
                        const isRecommended = analysis.Recommended_Achievement_IDs.includes(ach.Achievement_ID);
                        return (
                          <li 
                            key={j} 
                            className={`text-[11pt] leading-relaxed ${isRecommended ? 'font-medium' : 'opacity-90'}`}
                          >
                            - {ach.Action_Verb} {ach.Noun_Task} {ach.Strategy} resulting in {ach.Outcome}.
                            {isRecommended && (
                              <span 
                                className="inline-block ml-2 w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: template.accentColor }}
                                title="Highly relevant to this job"
                              />
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
            <div className="mb-8">
              <h2 
                className="text-xl font-bold uppercase border-b mb-3 pb-1 tracking-wide"
                style={{ 
                  color: template.headingColor, 
                  borderColor: template.borderColor,
                  fontFamily: template.fontSerif 
                }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {educationEntries.map((entry, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: template.primaryColor }}>{entry.Role}</h3>
                      <span className="text-sm opacity-80">{entry.Organization}</span>
                    </div>
                    <span className="text-sm font-bold opacity-60">{entry.EndDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (Primary) - 65% */}
          <div className="md:col-span-2 space-y-8">
            {/* Contact Info in Left Column for Two-Column */}
            <div className="space-y-1">
              <h2 
                className="text-sm font-bold uppercase tracking-widest mb-2"
                style={{ color: template.secondaryColor }}
              >
                Contact Information
              </h2>
              <div className="text-sm space-y-1">
                <p>{Personal_Information.Email}</p>
                <p>{Personal_Information.Phone}</p>
                <p>{Personal_Information.Location}</p>
                {Personal_Information.Portfolio_Website_URLs?.map((url, idx) => (
                  <p key={idx} className="truncate">{url}</p>
                ))}
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h2 
                className="text-lg font-bold uppercase border-b mb-3 pb-1 tracking-wide"
                style={{ 
                  color: template.headingColor, 
                  borderColor: template.borderColor,
                  fontFamily: template.fontSerif 
                }}
              >
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed">
                {analysis.Tailored_Summary}
              </p>
            </div>

            {/* Professional Experience */}
            <div>
              <h2 
                className="text-lg font-bold uppercase border-b mb-4 pb-1 tracking-wide"
                style={{ 
                  color: template.headingColor, 
                  borderColor: template.borderColor,
                  fontFamily: template.fontSerif 
                }}
              >
                Work Experience
              </h2>
              <div className="space-y-6">
                {workEntries.map((entry, i) => {
                  const achievements = getAchievementsForEntry(entry.Entry_ID);
                  if (achievements.length === 0) return null;

                  return (
                    <div key={i}>
                      <div className="mb-1">
                        <h3 className="text-md font-bold" style={{ color: template.primaryColor }}>{entry.Role}</h3>
                        <div className="flex justify-between text-xs font-bold opacity-70">
                          <span>{entry.Organization}</span>
                          <span>{entry.StartDate} – {entry.EndDate}</span>
                        </div>
                      </div>
                      
                      <ul className="list-none ml-0 space-y-1.5">
                        {achievements.map((ach, j) => {
                          const isRecommended = analysis.Recommended_Achievement_IDs.includes(ach.Achievement_ID);
                          return (
                            <li 
                              key={j} 
                              className={`text-[10pt] leading-relaxed ${isRecommended ? 'font-medium' : 'opacity-90'}`}
                            >
                              - {ach.Action_Verb} {ach.Noun_Task} {ach.Strategy} resulting in {ach.Outcome}.
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (Secondary) - 35% */}
          <div className="space-y-8">
            {/* Skills */}
            <div>
              <h2 
                className="text-lg font-bold uppercase border-b mb-3 pb-1 tracking-wide"
                style={{ 
                  color: template.headingColor, 
                  borderColor: template.borderColor,
                  fontFamily: template.fontSerif 
                }}
              >
                Skills
              </h2>
              <div className="space-y-2">
                {Master_Skills_Inventory.filter(s => s.Proficiency === 'Expert' || s.Proficiency === 'Master' || s.Proficiency === 'Proficient')
                  .slice(0, 15)
                  .map((skill, i) => {
                    const isMatched = analysis.Skill_Gaps.some(g => g.Skill.toLowerCase() === skill.Skill_Name.toLowerCase() && g.Match_Level === 'Strong');
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-xs ${isMatched ? 'font-bold' : ''}`}>
                          - {skill.Skill_Name}
                        </span>
                      </div>
                    );
                })}
              </div>
            </div>

            {/* Education */}
            {educationEntries.length > 0 && (
              <div>
                <h2 
                  className="text-lg font-bold uppercase border-b mb-3 pb-1 tracking-wide"
                  style={{ 
                    color: template.headingColor, 
                    borderColor: template.borderColor,
                    fontFamily: template.fontSerif 
                  }}
                >
                  Education
                </h2>
                <div className="space-y-4">
                  {educationEntries.map((entry, i) => (
                    <div key={i}>
                      <h3 className="text-xs font-bold" style={{ color: template.primaryColor }}>{entry.Role}</h3>
                      <p className="text-xs opacity-80">{entry.Organization}</p>
                      <p className="text-[10px] font-bold opacity-60">{entry.EndDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
