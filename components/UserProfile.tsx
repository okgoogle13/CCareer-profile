
import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { CareerDatabase, EntryType } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { deleteUserCareerData } from '../services/firebase';

interface UserProfileProps {
  user: User;
  data: CareerDatabase | null;
  onClose: () => void;
  onDataDeleted?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, data, onClose, onDataDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const displayName = user.displayName || user.email;
  const photoURL = user.photoURL;
  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.Personal_Information.FullName.replace(/\s+/g, '_')}_Master_Database.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMasterResume = () => {
    if (!data) return;

    let md = `# MASTER RESUME: ${data.Personal_Information.FullName.toUpperCase()}\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    md += `> **Note:** This Master Resume is a comprehensive repository of your entire career history. It contains every role, skill, project, and achievement without duplication. Use this document as your "Source of Truth" to copy-paste into targeted applications.\n\n`;
    
    // Contact Info
    md += `## CONTACT INFORMATION\n`;
    md += `**${data.Personal_Information.FullName}**\n`;
    md += `${data.Personal_Information.Email} | ${data.Personal_Information.Phone} | ${data.Personal_Information.Location}\n`;
    if (data.Personal_Information.Portfolio_Website_URLs.length > 0) {
      md += `**Links:** ${data.Personal_Information.Portfolio_Website_URLs.join(', ')}\n`;
    }
    md += `\n---\n\n`;

    // 1. Professional Summary
    md += `## PROFESSIONAL SUMMARY\n\n`;
    data.Career_Profile.Master_Summary_Points.forEach(p => md += `- ${p}\n`);
    md += `\n`;

    // 2. Comprehensive Skills Inventory
    if (data.Master_Skills_Inventory.length > 0) {
      md += `## SKILLS & COMPETENCIES\n\n`;
      const groupedSkills: Record<string, string[]> = {};
      data.Master_Skills_Inventory.forEach(s => {
        if (!groupedSkills[s.Category]) groupedSkills[s.Category] = [];
        groupedSkills[s.Category].push(s.Skill_Name);
      });

      for (const [category, skills] of Object.entries(groupedSkills)) {
        md += `### ${category}\n${skills.join(', ')}\n\n`;
      }
    }

    // Helper for sections
    const renderSection = (title: string, type: EntryType) => {
      const entries = data.Career_Entries.filter(e => e.Entry_Type === type);
      if (entries.length === 0) return '';

      let sectionMd = `## ${title}\n\n`;
      entries.forEach(entry => {
        sectionMd += `### ${entry.Role} | ${entry.Organization}\n`;
        sectionMd += `*${entry.StartDate} — ${entry.EndDate} | ${entry.Location}*\n\n`;
        
        if (entry.Core_Responsibilities_Scope) {
          sectionMd += `**Responsibilities:**\n${entry.Core_Responsibilities_Scope}\n\n`;
        }

        const achievements = data.Structured_Achievements.filter(a => a.Entry_ID === entry.Entry_ID);
        if (achievements.length > 0) {
          sectionMd += `**Key Accomplishments:**\n`;
          achievements.forEach(a => {
            const metricStr = a.Metric && a.Metric !== 'X' ? ` [${a.Metric}]` : '';
            sectionMd += `- ${a.Action_Verb} ${a.Noun_Task}${metricStr} by ${a.Strategy}, resulting in ${a.Outcome}.\n`;
          });
          sectionMd += `\n`;
        }
        
        // Include skills used in this specific role
        const entrySkills = new Set<string>();
        entry.Subtype_Tags.forEach(t => entrySkills.add(t));
        achievements.forEach(a => a.Skills_Used.forEach(s => entrySkills.add(s)));
        
        if (entrySkills.size > 0) {
             sectionMd += `*Skills Applied:* ${Array.from(entrySkills).join(', ')}\n\n`;
        }

        sectionMd += `---\n\n`;
      });
      return sectionMd;
    };

    // 3. Experience Sections (Full History)
    md += renderSection('PROFESSIONAL EXPERIENCE', EntryType.WORK_EXPERIENCE);
    md += renderSection('SPECIAL PROJECTS & ASSIGNMENTS', EntryType.PROJECT);
    md += renderSection('VOLUNTEER & COMMUNITY LEADERSHIP', EntryType.VOLUNTEER);
    
    // 4. Education & Certs
    md += renderSection('EDUCATION', EntryType.EDUCATION);
    md += renderSection('CERTIFICATIONS & LICENSES', EntryType.CERTIFICATION);

    // 5. Behavioral Library (KSC)
    if (data.KSC_Responses.length > 0) {
      md += `## BEHAVIORAL EXAMPLES (STAR LIBRARY)\n\n`;
      data.KSC_Responses.forEach(ksc => {
        md += `### ${ksc.KSC_Prompt}\n\n`;
        md += `**Situation:** ${ksc.Situation}\n`;
        md += `**Task:** ${ksc.Task}\n`;
        md += `**Action:** ${ksc.Action}\n`;
        md += `**Result:** ${ksc.Result}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.Personal_Information.FullName.replace(/\s+/g, '_')}_Master_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = async () => {
    if (window.confirm("Are you sure you want to delete ALL your career data? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteUserCareerData(user.uid);
        if (onDataDeleted) {
          onDataDeleted();
        }
        onClose();
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("Failed to delete data. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const stats = {
    entries: data?.Career_Entries.length || 0,
    achievements: data?.Structured_Achievements.length || 0,
    kscs: data?.KSC_Responses.length || 0,
    skills: data?.Master_Skills_Inventory.length || 0
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] border border-[var(--sys-color-concreteGrey-steps-0)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-down">
        <div className="p-6 border-b border-[var(--sys-color-concreteGrey-steps-0)] flex justify-between items-center bg-[var(--sys-color-charcoalBackground-base)]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-cyan-400" />
            User Profile & Master Data
          </h3>
          <button onClick={onClose} className="text-[var(--sys-color-worker-ash-base)] hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            {photoURL ? (
              <img 
                src={photoURL} 
                alt={displayName || 'User'} 
                className="w-24 h-24 rounded-full border-4 border-cyan-500/20 mb-4 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--sys-color-charcoalBackground-steps-2)] flex items-center justify-center mb-4 border-4 border-cyan-500/20 shadow-lg">
                 <span className="text-3xl font-bold text-cyan-400">{displayName?.charAt(0) || user.email?.charAt(0)}</span>
              </div>
            )}
            <h4 className="text-2xl font-bold text-white">{displayName || 'Anonymous User'}</h4>
            <p className="text-[var(--sys-color-worker-ash-base)]">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[var(--sys-color-charcoalBackground-base)] p-4 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)] text-center">
              <p className="text-2xl font-bold text-cyan-400">{stats.entries}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--sys-color-worker-ash-base)] font-bold">Entries</p>
            </div>
            <div className="bg-[var(--sys-color-charcoalBackground-base)] p-4 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)] text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.achievements}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--sys-color-worker-ash-base)] font-bold">Achievements</p>
            </div>
            <div className="bg-[var(--sys-color-charcoalBackground-base)] p-4 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)] text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.kscs}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--sys-color-worker-ash-base)] font-bold">STAR Responses</p>
            </div>
            <div className="bg-[var(--sys-color-charcoalBackground-base)] p-4 rounded-xl border border-[var(--sys-color-concreteGrey-steps-0)] text-center">
              <p className="text-2xl font-bold text-green-400">{stats.skills}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--sys-color-worker-ash-base)] font-bold">Skills</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={downloadMasterResume}
              disabled={!data}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-[var(--sys-color-worker-ash-base)] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg group transform hover:scale-[1.02]"
            >
              <DocumentTextIcon className="w-6 h-6" />
              <span className="text-lg">Download Master Resume</span>
            </button>
            <button 
              onClick={downloadJSON}
              disabled={!data}
              className="w-full py-3 bg-[var(--sys-color-charcoalBackground-steps-2)] hover:bg-[var(--sys-color-charcoalBackground-steps-2)] disabled:bg-[var(--sys-color-charcoalBackground-steps-1)] disabled:text-[var(--sys-color-worker-ash-base)] text-[var(--sys-color-paperWhite-base)] font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-[var(--sys-color-concreteGrey-steps-0)] hover:border-[var(--sys-color-concreteGrey-steps-0)]"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Export Raw JSON Database</span>
            </button>
            <button 
              onClick={handleDeleteData}
              disabled={isDeleting || !data}
              className="w-full py-3 bg-red-900/40 hover:bg-red-800/60 disabled:bg-[var(--sys-color-charcoalBackground-steps-1)] disabled:text-[var(--sys-color-worker-ash-base)] text-red-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500/50 mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? 'Deleting...' : 'Delete All Data'}</span>
            </button>
          </div>
          
          {!data && (
            <p className="mt-4 text-xs text-center text-amber-400 font-medium animate-pulse">
              * Process your career documents first to generate your master data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
