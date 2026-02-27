import React, { useState, useRef } from 'react';
import { CareerDatabase, JobOpportunity, MatchAnalysis } from '../types';
import { generateMatchAnalysis } from '../services/geminiService';
import { TailoredResumeView } from './TailoredResumeView';
import { KSCResponsesView } from './KSCResponsesView';
import { RESUME_TEMPLATES, TemplateStyle } from '../constants';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';

interface MatchDashboardProps {
  careerData: CareerDatabase;
  job: JobOpportunity;
}

export const MatchDashboard: React.FC<MatchDashboardProps> = ({ careerData, job }) => {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'coverLetter' | 'ksc'>('analysis');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>(RESUME_TEMPLATES[0]);
  const resumeRef = useRef<HTMLDivElement>(null);
  const kscRef = useRef<HTMLDivElement>(null);

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

  const exportToPDF = () => {
    let element: HTMLElement | null = null;
    let filename = 'Document.pdf';

    if (activeTab === 'resume' && resumeRef.current) {
      element = resumeRef.current;
      filename = 'Tailored_Resume.pdf';
    } else if (activeTab === 'ksc' && kscRef.current) {
      element = kscRef.current;
      filename = 'KSC_Responses.pdf';
    } else if (activeTab === 'coverLetter' && analysis) {
      element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: ${selectedTemplate.fontSans}; padding: 40px; color: ${selectedTemplate.textColor}; max-width: 800px; margin: auto;">
          <h1 style="color: ${selectedTemplate.primaryColor}; border-bottom: 2px solid ${selectedTemplate.primaryColor}; padding-bottom: 10px; margin-bottom: 30px; text-transform: uppercase;">Cover Letter</h1>
          <div style="white-space: pre-wrap; line-height: 1.6;">${analysis.Cover_Letter_Draft}</div>
        </div>
      `;
      filename = 'Cover_Letter.pdf';
    }

    if (element) {
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const exportToMarkdown = () => {
    if (activeTab === 'resume' && analysis) {
      let md = `# ${careerData.Personal_Information.FullName}\n\n`;
      md += `**Email:** ${careerData.Personal_Information.Email} | **Phone:** ${careerData.Personal_Information.Phone} | **Location:** ${careerData.Personal_Information.Location}\n\n`;
      md += `## Professional Summary\n${analysis.Tailored_Summary}\n\n`;
      md += `## Professional Experience\n`;
      
      const workEntries = careerData.Career_Entries.filter(e => e.Entry_Type === "Work Experience")
        .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());

      workEntries.forEach(entry => {
        const entryAchievements = careerData.Structured_Achievements.filter(a => a.Entry_ID === entry.Entry_ID);
        if (entryAchievements.length > 0) {
          md += `### ${entry.Role}\n**${entry.Organization}** | ${entry.StartDate} - ${entry.EndDate}\n\n`;
          entryAchievements.forEach(ach => {
            md += `- ${ach.Action_Verb} ${ach.Noun_Task} ${ach.Strategy} resulting in ${ach.Outcome}.\n`;
          });
          md += '\n';
        }
      });

      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, 'Tailored_Resume.md');
    } else if (activeTab === 'coverLetter' && analysis) {
      const blob = new Blob([analysis.Cover_Letter_Draft], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, 'Cover_Letter.md');
    } else if (activeTab === 'ksc' && analysis.KSC_Responses_Drafts) {
      let md = `# Key Selection Criteria Responses\n\n`;
      analysis.KSC_Responses_Drafts.forEach((ksc, i) => {
        md += `## Criterion ${i + 1}: ${ksc.KSC_Prompt}\n\n${ksc.Response}\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, 'KSC_Responses.md');
    }
  };

  const exportToDOCX = async () => {
    if (activeTab === 'resume' && analysis) {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: careerData.Personal_Information.FullName,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun(`${careerData.Personal_Information.Email} | ${careerData.Personal_Information.Phone} | ${careerData.Personal_Information.Location}`),
              ],
            }),
            new Paragraph({
              text: "Professional Summary",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: analysis.Tailored_Summary,
            }),
            new Paragraph({
              text: "Professional Experience",
              heading: HeadingLevel.HEADING_2,
            }),
            ...careerData.Career_Entries.filter(e => e.Entry_Type === "Work Experience")
              .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime())
              .flatMap(entry => {
                const entryAchievements = careerData.Structured_Achievements.filter(a => a.Entry_ID === entry.Entry_ID);
                if (entryAchievements.length === 0) return [];
                return [
                  new Paragraph({
                    text: entry.Role,
                    heading: HeadingLevel.HEADING_3,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: entry.Organization, bold: true }),
                      new TextRun(` | ${entry.StartDate} - ${entry.EndDate}`),
                    ],
                  }),
                  ...entryAchievements.map(ach => new Paragraph({
                    text: `${ach.Action_Verb} ${ach.Noun_Task} ${ach.Strategy} resulting in ${ach.Outcome}.`,
                    bullet: { level: 0 }
                  }))
                ];
              })
          ],
        }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'Tailored_Resume.docx');
    } else if (activeTab === 'coverLetter' && analysis) {
      const doc = new Document({
        sections: [{
          properties: {},
          children: analysis.Cover_Letter_Draft.split('\n').map(line => new Paragraph({ text: line })),
        }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'Cover_Letter.docx');
    } else if (activeTab === 'ksc' && analysis.KSC_Responses_Drafts) {
      const doc = new Document({
        sections: [{
          properties: {},
          children: analysis.KSC_Responses_Drafts.flatMap((ksc, i) => [
            new Paragraph({ text: `Criterion ${i + 1}: ${ksc.KSC_Prompt}`, heading: HeadingLevel.HEADING_1 }),
            ...ksc.Response.split('\n').map(line => new Paragraph({ text: line })),
            new Paragraph({ text: "" })
          ]),
        }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'KSC_Responses.docx');
    }
  };

  if (!analysis && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-gray-800 p-10 rounded-2xl border border-gray-700 shadow-2xl">
          <div className="w-20 h-20 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Job Extracted Successfully</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            We've analyzed the job posting. Now, let's see how your career database matches up and generate your tailored application materials.
          </p>
          <button
            onClick={handleAnalyze}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-12 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-900/20"
          >
            Start Match Analysis
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Match...</h2>
        <p className="text-gray-400 animate-pulse">Gemini is researching the company and tailoring your profile.</p>
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

      {/* Template Selector */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-sm font-bold text-cyan-500 uppercase tracking-widest mb-4">Select Document Template</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {RESUME_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`group flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                selectedTemplate.id === t.id ? 'bg-cyan-900/20 border-cyan-500' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div 
                className="w-full aspect-[3/4] rounded shadow-sm border border-white/10 overflow-hidden relative"
                style={{ backgroundColor: t.bgLight }}
              >
                <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: t.primaryColor }} />
                <div className="p-1 space-y-1">
                  <div className="h-1 w-2/3 rounded-full mt-2" style={{ backgroundColor: t.headingColor, opacity: 0.3 }} />
                  <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: t.textColor, opacity: 0.1 }} />
                  <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: t.textColor, opacity: 0.1 }} />
                  <div className="h-0.5 w-4/5 rounded-full" style={{ backgroundColor: t.textColor, opacity: 0.1 }} />
                </div>
              </div>
              <span className={`text-[10px] font-bold truncate w-full text-center ${selectedTemplate.id === t.id ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs and Export */}
      <div className="flex justify-between items-end border-b border-gray-700 pb-2">
        <div className="flex gap-4">
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
          <button
            onClick={() => setActiveTab('ksc')}
            className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${
              activeTab === 'ksc' ? 'bg-gray-800 text-cyan-400 border-t border-l border-r border-gray-700' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            KSC Responses
          </button>
        </div>
        
        {(activeTab === 'resume' || activeTab === 'coverLetter' || activeTab === 'ksc') && (
          <div className="flex gap-2 mb-1">
            <span className="text-gray-400 text-sm mr-2 self-center">Export as:</span>
            <button onClick={exportToPDF} className="bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-500/30 px-3 py-1 rounded text-sm font-bold transition-colors">
              PDF
            </button>
            <button onClick={exportToDOCX} className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-500/30 px-3 py-1 rounded text-sm font-bold transition-colors">
              DOCX
            </button>
            <button onClick={exportToMarkdown} className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-300 border border-gray-500/30 px-3 py-1 rounded text-sm font-bold transition-colors">
              Markdown
            </button>
          </div>
        )}
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
        <div ref={resumeRef}>
          <TailoredResumeView careerData={careerData} analysis={analysis} template={selectedTemplate} />
        </div>
      )}

      {activeTab === 'coverLetter' && (
        <div className="bg-white p-10 shadow-lg max-w-4xl mx-auto" style={{ fontFamily: selectedTemplate.fontSans, color: selectedTemplate.textColor }}>
          <h1 className="text-3xl font-bold uppercase mb-8 border-b-2 pb-4" style={{ color: selectedTemplate.primaryColor, borderColor: selectedTemplate.primaryColor }}>Cover Letter</h1>
          <textarea 
            className="w-full h-[600px] bg-transparent text-gray-800 p-0 border-none focus:outline-none leading-relaxed resize-none"
            defaultValue={analysis.Cover_Letter_Draft}
          />
        </div>
      )}

      {activeTab === 'ksc' && (
        <div ref={kscRef}>
          <KSCResponsesView analysis={analysis} template={selectedTemplate} />
        </div>
      )}
    </div>
  );
};
