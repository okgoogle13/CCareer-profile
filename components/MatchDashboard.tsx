import React, { useState, useRef } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import { saveUserCareerData } from '../services/firebase';
import { CareerDatabase, JobOpportunity, MatchAnalysis, SavedDocument } from '../types';
import { generateMatchAnalysis } from '../services/geminiService';
import { TailoredResumeView } from './TailoredResumeView';
import { KSCResponsesView } from './KSCResponsesView';
import { AuditDisplay } from './AuditDisplay';
import { ATSScoreCard } from './ATSScoreCard';
import { CoverLetterSpecificMetrics } from './CoverLetterSpecificMetrics';
import { SuggestionsPanel } from './SuggestionsPanel';
import { useATSScoring } from '../hooks/useATSScoring';
import { RESUME_TEMPLATES, TemplateStyle } from '../constants';
import { CoverLetterScoreResult } from '../types';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ColumnBreak } from 'docx';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';

interface MatchDashboardProps {
  careerData: CareerDatabase;
  job: JobOpportunity;
  onUpdate?: (data: CareerDatabase) => void;
  userId?: string;
}

export const MatchDashboard: React.FC<MatchDashboardProps> = ({ careerData, job, onUpdate, userId }) => {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'coverLetter' | 'ksc'>('analysis');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>(RESUME_TEMPLATES[0]);
  const [showAudit, setShowAudit] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locale, setLocale] = useState<'US' | 'UK/AU'>('US');
  const resumeRef = useRef<HTMLDivElement>(null);
  const kscRef = useRef<HTMLDivElement>(null);

  // Helper to get resume text for scoring
  const getResumeText = () => {
    if (!analysis) return '';
    let text = `${careerData.Personal_Information.FullName}\n${analysis.Tailored_Summary}\n`;
    
    const workEntries = careerData.Career_Entries.filter(e => e.Entry_Type === "Work Experience")
      .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());

    workEntries.forEach(entry => {
      const entryAchievements = careerData.Structured_Achievements.filter(a => a.Entry_ID === entry.Entry_ID);
      if (entryAchievements.length > 0) {
        text += `${entry.Role} at ${entry.Organization}\n`;
        entryAchievements.forEach(ach => {
          text += `- ${ach.Action_Verb} ${ach.Noun_Task} ${ach.Strategy} resulting in ${ach.Outcome}.\n`;
        });
      }
    });
    
    text += `Skills: ${careerData.Master_Skills_Inventory.map(s => s.Skill_Name).join(', ')}`;
    return text;
  };

  const jobDescriptionText = `${job.Job_Title} at ${job.Company_Name}\n${job.Key_Responsibilities.join('\n')}\n${job.Required_Hard_Skills.join('\n')}\n${job.Required_Soft_Skills.join('\n')}`;

  const resumeScoring = useATSScoring(getResumeText(), jobDescriptionText, 'resume');
  const coverLetterScoring = useATSScoring(coverLetterContent, jobDescriptionText, 'coverLetter');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result = await generateMatchAnalysis(careerData, job);
      
      // Self-Correction API Step: Check if the score is below a threshold and try to improve it once
      if (result.Overall_Fit_Score < 70) {
          console.log("Initial score below 70, attempting self-correction...");
          // In a real scenario, you might pass the previous result back to the AI to ask for improvements
          // For now, we'll just re-run it to see if it generates a better fit with a different seed/temperature
          const retryResult = await generateMatchAnalysis(careerData, job);
          if (retryResult.Overall_Fit_Score > result.Overall_Fit_Score) {
              console.log("Self-correction improved score.");
              result = retryResult;
          }
      }

      setAnalysis(result);
      setCoverLetterContent(result.Cover_Letter_Draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = async (content: string) => {
    if (!userId || !analysis || !onUpdate) return;
    const newDoc: SavedDocument = {
      id: crypto.randomUUID(),
      jobTitle: job.Job_Title,
      companyName: job.Company_Name,
      dateSaved: new Date().toISOString(),
      coverLetter: content,
      tailoredSummary: analysis.Tailored_Summary
    };

    const updatedData = {
      ...careerData,
      Saved_Documents: [...(careerData.Saved_Documents || []), newDoc]
    };

    await saveUserCareerData(userId, updatedData);
    onUpdate(updatedData);
  };

  const { isSaving: isAutoSaving, lastSaved, save } = useAutoSave(userId, coverLetterContent, saveDocument);

  const handleSaveToProfile = async () => {
    setIsSaving(true);
    try {
      await save(coverLetterContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save document:", err);
    } finally {
      setIsSaving(false);
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
      const isTwoColumn = selectedTemplate.layout === 'two-column';
      
      const leftColumnContent = [
        new Paragraph({
          text: careerData.Personal_Information.FullName,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun(`${careerData.Personal_Information.Email} | ${careerData.Personal_Information.Phone} | ${careerData.Personal_Information.Location}`),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "Professional Summary",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: analysis.Tailored_Summary,
        }),
        new Paragraph({ text: "" }),
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
              })),
              new Paragraph({ text: "" })
            ];
          })
      ];

      const rightColumnContent = [
        new Paragraph({
          text: "Skills",
          heading: HeadingLevel.HEADING_2,
        }),
        ...careerData.Master_Skills_Inventory
          .filter(s => s.Proficiency === 'Expert' || s.Proficiency === 'Master' || s.Proficiency === 'Proficient')
          .slice(0, 15)
          .map(skill => new Paragraph({
            text: skill.Skill_Name,
            bullet: { level: 0 }
          })),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "Education",
          heading: HeadingLevel.HEADING_2,
        }),
        ...careerData.Career_Entries.filter(e => e.Entry_Type === "Education")
          .map(entry => new Paragraph({
            children: [
              new TextRun({ text: entry.Role, bold: true }),
              new TextRun(`\n${entry.Organization}`),
              new TextRun(`\n${entry.EndDate}`),
            ]
          }))
      ];

      const doc = new Document({
        sections: [{
          properties: isTwoColumn ? {
            column: {
              count: 2,
              space: 720, // 0.5 inch
            }
          } : {},
          children: isTwoColumn 
            ? [...leftColumnContent, new Paragraph({ children: [new ColumnBreak()] }), ...rightColumnContent] 
            : [...leftColumnContent, ...rightColumnContent],
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
        <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-10 rounded-2xl border border-[var(--sys-color-concreteGrey-steps-0)] shadow-2xl">
          <div className="w-20 h-20 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Job Extracted Successfully</h2>
          <p className="text-[var(--sys-color-worker-ash-base)] mb-8 max-w-lg mx-auto">
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
        <p className="text-[var(--sys-color-worker-ash-base)] animate-pulse">Gemini is researching the company and tailoring your profile.</p>
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
      <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-8 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)] flex items-center gap-8">
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
            <span className="text-xs text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider">Fit Score</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Match Analysis Complete</h2>
          <p className="text-[var(--sys-color-worker-ash-base)] text-lg">
            Your profile is a <strong>{analysis.Overall_Fit_Score >= 80 ? 'strong' : analysis.Overall_Fit_Score >= 60 ? 'moderate' : 'weak'} match</strong> for the {job.Job_Title} role at {job.Company_Name}.
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-6 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-cyan-500 uppercase tracking-widest">Select Document Template</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider">Locale:</span>
            <div className="flex bg-[var(--sys-color-charcoalBackground-base)] rounded-lg p-1 border border-[var(--sys-color-concreteGrey-steps-0)]">
              <button
                onClick={() => setLocale('US')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${locale === 'US' ? 'bg-cyan-600 text-white' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'}`}
              >
                US
              </button>
              <button
                onClick={() => setLocale('UK/AU')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${locale === 'UK/AU' ? 'bg-cyan-600 text-white' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'}`}
              >
                UK/AU
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RESUME_TEMPLATES.slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`group flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                selectedTemplate.id === t.id ? 'bg-cyan-900/20 border-cyan-500' : 'bg-[var(--sys-color-charcoalBackground-base)] border-[var(--sys-color-concreteGrey-steps-0)] hover:border-[var(--sys-color-concreteGrey-steps-0)]'
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
              <span className={`text-[10px] font-bold truncate w-full text-center ${selectedTemplate.id === t.id ? 'text-cyan-400' : 'text-[var(--sys-color-worker-ash-base)] group-hover:text-[var(--sys-color-paperWhite-base)]'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs and Export */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-[var(--sys-color-concreteGrey-steps-0)] pb-2 sticky top-0 bg-[var(--sys-color-charcoalBackground-base)] z-40 pt-4">
        <div className="flex gap-2 md:gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 md:px-4 py-2 font-bold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'analysis' ? 'bg-[var(--sys-color-charcoalBackground-steps-1)] text-cyan-400 border-t border-l border-r border-[var(--sys-color-concreteGrey-steps-0)]' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'
            }`}
          >
            Gap Analysis
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 md:px-4 py-2 font-bold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'resume' ? 'bg-[var(--sys-color-charcoalBackground-steps-1)] text-cyan-400 border-t border-l border-r border-[var(--sys-color-concreteGrey-steps-0)]' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'
            }`}
          >
            Tailored Resume
          </button>
          <button
            onClick={() => setActiveTab('coverLetter')}
            className={`px-3 md:px-4 py-2 font-bold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'coverLetter' ? 'bg-[var(--sys-color-charcoalBackground-steps-1)] text-cyan-400 border-t border-l border-r border-[var(--sys-color-concreteGrey-steps-0)]' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'
            }`}
          >
            Cover Letter
          </button>
          {analysis?.KSC_Responses_Drafts && analysis.KSC_Responses_Drafts.length > 0 && (
            <button
              onClick={() => setActiveTab('ksc')}
              className={`px-3 md:px-4 py-2 font-bold rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'ksc' ? 'bg-[var(--sys-color-charcoalBackground-steps-1)] text-cyan-400 border-t border-l border-r border-[var(--sys-color-concreteGrey-steps-0)]' : 'text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-paperWhite-base)]'
              }`}
            >
              KSC Responses
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0 w-full md:w-auto justify-end">
          <button
            onClick={handleAnalyze}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-colors text-sm md:text-base"
          >
            Rescore
          </button>
          
          {(activeTab === 'resume' || activeTab === 'coverLetter' || activeTab === 'ksc') && (
            <div className="flex flex-wrap gap-2 items-center">
              {(activeTab === 'resume' || activeTab === 'coverLetter') && (
                <button 
                  onClick={() => setShowAudit(!showAudit)}
                  className={`flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm font-bold transition-colors ${
                    showAudit ? 'bg-cyan-600 text-white' : 'bg-[var(--sys-color-charcoalBackground-steps-2)] text-cyan-400 hover:bg-[var(--sys-color-charcoalBackground-steps-3)]'
                  }`}
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">{showAudit ? 'Hide Audit' : 'Show Audit'}</span>
                  <span className="sm:hidden">Audit</span>
                </button>
              )}
              {activeTab === 'coverLetter' && userId && (
                <button
                  onClick={handleSaveToProfile}
                  disabled={isSaving || saveSuccess}
                  className={`flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm font-bold transition-colors ${
                    saveSuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] hover:bg-[var(--sys-color-kr-activistSmokeGreen-steps-1)] text-[var(--sys-color-kr-activistSmokeGreen-base)] border border-[var(--sys-color-kr-activistSmokeGreen-base)]'
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3 md:h-4 md:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Saving...</span>
                    </span>
                  ) : saveSuccess ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Saved!</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span className="hidden sm:inline">Save</span>
                    </span>
                  )}
                </button>
              )}
              <span className="text-[var(--sys-color-worker-ash-base)] text-xs md:text-sm hidden md:inline">Export:</span>
              <button 
                onClick={() => {
                  const text = activeTab === 'resume' ? getResumeText() : activeTab === 'coverLetter' ? coverLetterContent : analysis?.KSC_Responses_Drafts?.map(k => `${k.KSC_Prompt}\n${k.Response}`).join('\n\n') || '';
                  navigator.clipboard.writeText(text);
                  alert('Copied to clipboard for ATS parsing!');
                }}
                className="bg-[var(--sys-color-kr-activistSmokeGreen-steps-0)] hover:bg-[var(--sys-color-kr-activistSmokeGreen-steps-1)] text-[var(--sys-color-kr-activistSmokeGreen-base)] border border-[var(--sys-color-kr-activistSmokeGreen-base)] px-2 py-1 md:px-3 rounded text-xs md:text-sm font-bold transition-colors"
                title="Copy Text"
              >
                Copy
              </button>
              <button onClick={exportToPDF} className="bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-500/30 px-2 py-1 md:px-3 rounded text-xs md:text-sm font-bold transition-colors">
                PDF
              </button>
              <button onClick={exportToDOCX} className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-500/30 px-2 py-1 md:px-3 rounded text-xs md:text-sm font-bold transition-colors">
                DOCX
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Gaps */}
          <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-6 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)]">
            <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-[var(--sys-color-concreteGrey-steps-0)] pb-2">Skill Gap Analysis</h3>
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
                    <p className="text-sm text-[var(--sys-color-worker-ash-base)] pl-5 border-l-2 border-[var(--sys-color-concreteGrey-steps-0)] ml-1.5 py-1">
                      {gap.Evidence || 'No direct evidence found in the provided documents.'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-8">
            {/* Tailored Summary */}
            <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-6 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)]">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-[var(--sys-color-concreteGrey-steps-0)] pb-2">Tailored Resume Summary</h3>
              <p className="text-[var(--sys-color-paperWhite-base)] leading-relaxed bg-[var(--sys-color-charcoalBackground-base)] p-4 rounded border border-[var(--sys-color-concreteGrey-steps-0)] mb-4">
                {analysis.Tailored_Summary}
              </p>
              <button 
                onClick={() => setActiveTab('coverLetter')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Generate/Edit Cover Letter
              </button>
            </div>

            {/* Recommended Achievements */}
            <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] p-6 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)]">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 border-b border-[var(--sys-color-concreteGrey-steps-0)] pb-2">Top Achievements to Include</h3>
              <ul className="space-y-3">
                {recommendedAchievements.map((ach, i) => ach && (
                  <li key={i} className="text-[var(--sys-color-paperWhite-base)] text-sm bg-[var(--sys-color-charcoalBackground-base)] p-3 rounded border border-[var(--sys-color-concreteGrey-steps-0)] flex gap-3">
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2" ref={resumeRef}>
            <TailoredResumeView careerData={careerData} analysis={analysis} template={selectedTemplate} locale={locale} />
          </div>
          <div className="xl:col-span-1 space-y-6 sticky top-8">
            <ATSScoreCard 
              score={resumeScoring.score} 
              isCalculating={resumeScoring.isCalculating} 
              documentType="resume" 
            />
            {resumeRef.current && resumeRef.current.clientHeight > 1122 && ( // A4 is ~1122px at 96dpi
              <div className="bg-amber-900/40 border border-amber-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h4 className="font-bold text-amber-300">Page Length Warning</h4>
                </div>
                <p className="text-sm text-amber-200/80">
                  Your resume appears to be longer than one page. Consider trimming older experience or less relevant skills to improve ATS readability.
                </p>
              </div>
            )}
            {showAudit && analysis.Resume_Audit && (
              <AuditDisplay audit={analysis.Resume_Audit} title="Resume" />
            )}
            <SuggestionsPanel score={resumeScoring.score} documentType="resume" />
          </div>
        </div>
      )}

      {activeTab === 'coverLetter' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 bg-white p-10 shadow-lg" style={{ fontFamily: selectedTemplate.fontSans, color: selectedTemplate.textColor }}>
            <h1 className="text-3xl font-bold uppercase mb-8 border-b-2 pb-4" style={{ color: selectedTemplate.primaryColor, borderColor: selectedTemplate.primaryColor }}>Cover Letter</h1>
            <textarea 
              className="w-full h-[600px] bg-transparent text-[var(--sys-color-charcoalBackground-base)] p-0 border-none focus:outline-none leading-relaxed resize-none"
              value={coverLetterContent}
              onChange={(e) => setCoverLetterContent(e.target.value)}
            />
          </div>
          <div className="xl:col-span-1 space-y-6 sticky top-8">
            <ATSScoreCard 
              score={coverLetterScoring.score} 
              isCalculating={coverLetterScoring.isCalculating} 
              documentType="coverLetter" 
            />
            {coverLetterScoring.score && (
              <CoverLetterSpecificMetrics 
                score={coverLetterScoring.score as CoverLetterScoreResult} 
                wordCount={coverLetterContent.split(/\s+/).length} 
              />
            )}
            {showAudit && analysis.Cover_Letter_Audit && (
              <AuditDisplay audit={analysis.Cover_Letter_Audit} title="Cover Letter" />
            )}
            <SuggestionsPanel score={coverLetterScoring.score} documentType="coverLetter" />
          </div>
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
