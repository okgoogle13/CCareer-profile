
import React from 'react';
import { User } from '@supabase/supabase-js';
import { CareerDatabase, EntryType } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface UserProfileProps {
  user: User;
  data: CareerDatabase | null;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, data, onClose }) => {
  const displayName = user.user_metadata?.full_name || user.email;
  const photoURL = user.user_metadata?.avatar_url;
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

  const stats = {
    entries: data?.Career_Entries.length || 0,
    achievements: data?.Structured_Achievements.length || 0,
    kscs: data?.KSC_Responses.length || 0,
    skills: data?.Master_Skills_Inventory.length || 0
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-down">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-cyan-400" />
            User Profile & Master Data
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
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
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 border-4 border-cyan-500/20 shadow-lg">
                 <span className="text-3xl font-bold text-cyan-400">{displayName?.charAt(0) || user.email?.charAt(0)}</span>
              </div>
            )}
            <h4 className="text-2xl font-bold text-white">{displayName || 'Anonymous User'}</h4>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 text-center">
              <p className="text-2xl font-bold text-cyan-400">{stats.entries}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Entries</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.achievements}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Achievements</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.kscs}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">STAR Responses</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.skills}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Skills</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={downloadMasterResume}
              disabled={!data}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg group transform hover:scale-[1.02]"
            >
              <DocumentTextIcon className="w-6 h-6" />
              <span className="text-lg">Download Master Resume</span>
            </button>
            <button 
              onClick={downloadJSON}
              disabled={!data}
              className="w-full py-3 bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-600/50 hover:border-gray-500"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Export Raw JSON Database</span>
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
