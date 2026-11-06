import { CareerDatabase, CareerEntry, MasterSkill, StructuredAchievement, PersonalInformation, JobPreferences } from '../types';

export interface DataQualityIssue {
  id: string; // Unique string for React rendering and tracking
  field: string;
  section: 'Personal_Information' | 'Career_Profile' | 'Master_Skills_Inventory' | 'Career_Entries' | 'Structured_Achievements';
  itemId?: string; // Links to career entry ID, skill name, etc.
  severity: 'error' | 'warning' | 'info';
  message: string;
  currentValue: any;
  suggestedValue?: any;
  issueType: 'missing' | 'format' | 'datatype';
}

// Utility function to capitalize words (Title Case)
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ') // remove double spaces
    .split(' ')
    .map(word => {
      if (!word) return '';
      // Keep some lowercase words unless they are the first word
      const lowerWords = ['and', 'or', 'for', 'of', 'in', 'at', 'with', 'the', 'a', 'to', 'by', 'as', 'on'];
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      if (lowerWords.includes(cleanWord.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/^\w/, c => c.toUpperCase()); // Ensure first letter is capitalized
}

// Standardize email
export function cleanEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// Standardize phone number (removes redundant characters / spaces, leaves nice readable layout)
export function cleanPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    // Standard format for US: (123) 456-7890 or AU: 0412 345 678
    if (phone.startsWith('+61') || phone.startsWith('04')) {
      return `04${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

// Normalize Date format to standard readable month or YYYY-MM-DD
export function cleanDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  
  // If "present" or "current"
  if (/^present$|^current$/i.test(trimmed)) {
    return 'Present';
  }

  // Attempt to parse standard formats
  const dateObj = new Date(trimmed);
  if (!isNaN(dateObj.getTime())) {
    // If it was just a year
    if (/^\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    // Return standard YYYY-MM-DD
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${dateObj.getFullYear()}-${month}-${day}`;
  }
  return trimmed;
}

/**
 * Audit and analyze a CareerDatabase object, highlighting all bugs, missing fields, 
 * format inconsistency and data type errors.
 */
export function analyzeCareerDatabase(db: CareerDatabase): { issues: DataQualityIssue[]; healthScore: number } {
  const issues: DataQualityIssue[] = [];

  if (!db) {
    return { issues: [{
      id: 'missing-database',
      field: 'All',
      section: 'Personal_Information',
      severity: 'error',
      message: 'Database is empty. Please paste your profile details or upload documents.',
      currentValue: null,
      issueType: 'missing'
    }], healthScore: 0 };
  }

  // ============================================
  // 1. PERSONAL INFORMATION AUDITING
  // ============================================
  const pi = db.Personal_Information;
  if (!pi) {
    issues.push({
      id: 'missing-pi',
      field: 'Personal_Information',
      section: 'Personal_Information',
      severity: 'error',
      message: 'Personal Information block is entirely missing.',
      currentValue: null,
      issueType: 'missing'
    });
  } else {
    // FullName Validation
    if (!pi.FullName || !pi.FullName.trim()) {
      issues.push({
        id: 'missing-pi-fullname',
        field: 'FullName',
        section: 'Personal_Information',
        severity: 'error',
        message: 'Full Name is required and cannot be empty.',
        currentValue: pi.FullName,
        issueType: 'missing'
      });
    } else {
      const trimmedName = pi.FullName.trim();
      const hasDoubleSpace = /\s{2,}/.test(pi.FullName);
      const isIncorrectCaps = pi.FullName !== toTitleCase(pi.FullName);
      if (hasDoubleSpace || isIncorrectCaps) {
        issues.push({
          id: 'format-pi-fullname',
          field: 'FullName',
          section: 'Personal_Information',
          severity: 'warning',
          message: 'Full Name has typography anomalies (e.g. inconsistent case, double spaces).',
          currentValue: pi.FullName,
          suggestedValue: toTitleCase(trimmedName),
          issueType: 'format'
        });
      }
    }

    // Email Validation
    if (!pi.Email || !pi.Email.trim()) {
      issues.push({
        id: 'missing-pi-email',
        field: 'Email',
        section: 'Personal_Information',
        severity: 'error',
        message: 'Email address is required and cannot be empty.',
        currentValue: pi.Email,
        issueType: 'missing'
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEm = cleanEmail(pi.Email);
      if (!emailRegex.test(cleanEm)) {
        issues.push({
          id: 'invalid-pi-email',
          field: 'Email',
          section: 'Personal_Information',
          severity: 'error',
          message: 'Email is structurally invalid. Follow user@domain.com layout.',
          currentValue: pi.Email,
          issueType: 'datatype'
        });
      } else if (pi.Email !== cleanEm) {
        issues.push({
          id: 'format-pi-email',
          field: 'Email',
          section: 'Personal_Information',
          severity: 'info',
          message: 'Email is not fully sanitized (e.g. contains trailing spaces or uppercase characters).',
          currentValue: pi.Email,
          suggestedValue: cleanEm,
          issueType: 'format'
        });
      }
    }

    // Phone Validation
    if (!pi.Phone || !pi.Phone.trim()) {
      issues.push({
        id: 'missing-pi-phone',
        field: 'Phone',
        section: 'Personal_Information',
        severity: 'warning',
        message: 'Phone number is missing. It is highly recommended to include a phone number in your resume.',
        currentValue: pi.Phone,
        issueType: 'missing'
      });
    } else {
      const cleanedPh = cleanPhone(pi.Phone);
      if (pi.Phone.trim() !== cleanedPh) {
        issues.push({
          id: 'format-pi-phone',
          field: 'Phone',
          section: 'Personal_Information',
          severity: 'info',
          message: 'Phone number layout styling is unstandardized.',
          currentValue: pi.Phone,
          suggestedValue: cleanedPh,
          issueType: 'format'
        });
      }
    }

    // Location Validation
    if (!pi.Location || !pi.Location.trim()) {
      issues.push({
        id: 'missing-pi-location',
        field: 'Location',
        section: 'Personal_Information',
        severity: 'warning',
        message: 'Contact Location (City/Country) is missing.',
        currentValue: pi.Location,
        issueType: 'missing'
      });
    } else if (pi.Location !== toTitleCase(pi.Location)) {
      issues.push({
        id: 'format-pi-location',
        field: 'Location',
        section: 'Personal_Information',
        severity: 'info',
        message: 'Location layout is uncapitalized.',
        currentValue: pi.Location,
        suggestedValue: toTitleCase(pi.Location),
        issueType: 'format'
      });
    }
  }

  // ============================================
  // 2. CAREER PROFILE & JOB PREFERENCES AUDITING
  // ============================================
  const cp = db.Career_Profile;
  if (!cp) {
    issues.push({
      id: 'missing-cp',
      field: 'Career_Profile',
      section: 'Career_Profile',
      severity: 'warning',
      message: 'Career profile overview tags are missing.',
      currentValue: null,
      issueType: 'missing'
    });
  } else {
    if (!cp.Target_Titles || cp.Target_Titles.length === 0) {
      issues.push({
        id: 'missing-titles',
        field: 'Target_Titles',
        section: 'Career_Profile',
        severity: 'warning',
        message: 'No specific Target job titles registered under career targets.',
        currentValue: cp.Target_Titles,
        issueType: 'missing'
      });
    }

    if (!cp.Master_Summary_Points || cp.Master_Summary_Points.length === 0) {
      issues.push({
        id: 'missing-summary',
        field: 'Master_Summary_Points',
        section: 'Career_Profile',
        severity: 'warning',
        message: 'No Master Summary Points supplied to define your professional bio.',
        currentValue: cp.Master_Summary_Points,
        issueType: 'missing'
      });
    }

    // Salary Data Type Validation
    const pref = cp.Job_Preferences;
    if (pref) {
      if (pref.Min_Salary !== undefined && pref.Min_Salary !== null) {
        const salaryNum = Number(pref.Min_Salary);
        if (isNaN(salaryNum) || salaryNum < 0) {
          issues.push({
            id: 'datatype-pref-minsalary',
            field: 'Job_Preferences.Min_Salary',
            section: 'Career_Profile',
            severity: 'error',
            message: `Minimum Salary constraint must be a valid positive number. Detected: "${pref.Min_Salary}"`,
            currentValue: pref.Min_Salary,
            suggestedValue: isNaN(salaryNum) ? 0 : Math.abs(salaryNum),
            issueType: 'datatype'
          });
        }
      }
    }
  }

  // ============================================
  // 3. MASTER SKILLS INVENTORY AUDITING
  // ============================================
  const skills = db.Master_Skills_Inventory || [];
  skills.forEach((skill, index) => {
    const itemID = `skill-${index}`;
    if (!skill.Skill_Name || !skill.Skill_Name.trim()) {
      issues.push({
        id: `missing-skill-${index}-name`,
        field: 'Skill_Name',
        section: 'Master_Skills_Inventory',
        itemId: itemID,
        severity: 'error',
        message: `Master skill entry at index [${index}] is missing a name.`,
        currentValue: skill.Skill_Name,
        issueType: 'missing'
      });
    } else if (skill.Skill_Name !== toTitleCase(skill.Skill_Name)) {
      issues.push({
        id: `format-skill-${index}-name`,
        field: 'Skill_Name',
        section: 'Master_Skills_Inventory',
        itemId: skill.Skill_Name,
        severity: 'info',
        message: `Skill name "${skill.Skill_Name}" layout is poorly formatted.`,
        currentValue: skill.Skill_Name,
        suggestedValue: toTitleCase(skill.Skill_Name),
        issueType: 'format'
      });
    }

    // Capital Case for categories
    if (skill.Category && skill.Category !== toTitleCase(skill.Category)) {
      issues.push({
        id: `format-skill-${index}-category`,
        field: 'Category',
        section: 'Master_Skills_Inventory',
        itemId: skill.Skill_Name || itemID,
        severity: 'info',
        message: `Category "${skill.Category}" for skill "${skill.Skill_Name || index}" would benefit from standard capitalizations.`,
        currentValue: skill.Category,
        suggestedValue: toTitleCase(skill.Category),
        issueType: 'format'
      });
    }

    // Validation of numeric experience range
    if (skill.Years_Experience !== undefined && skill.Years_Experience !== null) {
      const val = Number(skill.Years_Experience);
      if (isNaN(val) || val < 0 || val > 70) {
        issues.push({
          id: `datatype-skill-${index}-years`,
          field: 'Years_Experience',
          section: 'Master_Skills_Inventory',
          itemId: skill.Skill_Name || itemID,
          severity: 'error',
          message: `Years of experience must be a numeric value between 0 and 70 (years). Detected: "${skill.Years_Experience}"`,
          currentValue: skill.Years_Experience,
          suggestedValue: isNaN(val) ? 0 : Math.max(0, Math.min(val, 70)),
          issueType: 'datatype'
        });
      }
    }
  });

  // ============================================
  // 4. CAREER ENTRIES AUDITING
  // ============================================
  const entries = db.Career_Entries || [];
  if (entries.length === 0) {
    issues.push({
      id: 'missing-career-entries',
      field: 'Career_Entries',
      section: 'Career_Entries',
      severity: 'error',
      message: 'Your profile has zero work history or educational career entries listed.',
      currentValue: entries,
      issueType: 'missing'
    });
  }

  entries.forEach((entry, idx) => {
    const entryId = entry.Entry_ID || `entry-${idx}`;

    // Role Formats
    if (!entry.Role || !entry.Role.trim()) {
      issues.push({
        id: `missing-entry-${entryId}-role`,
        field: 'Role',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'error',
        message: `Career history entry is missing standard role title or course degree at index [${idx}].`,
        currentValue: entry.Role,
        issueType: 'missing'
      });
    } else if (entry.Role !== toTitleCase(entry.Role)) {
      issues.push({
        id: `format-entry-${entryId}-role`,
        field: 'Role',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'warning',
        message: `Inconsistent capitalization formatted inside job title: "${entry.Role}"`,
        currentValue: entry.Role,
        suggestedValue: toTitleCase(entry.Role),
        issueType: 'format'
      });
    }

    // Company/Org Formatting
    if (!entry.Organization || !entry.Organization.trim()) {
      issues.push({
        id: `missing-entry-${entryId}-org`,
        field: 'Organization',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'error',
        message: `Career entry "${entry.Role || idx}" is missing its governing Organization/Company name.`,
        currentValue: entry.Organization,
        issueType: 'missing'
      });
    } else if (entry.Organization !== toTitleCase(entry.Organization) && !/^[A-Z\s]+$/.test(entry.Organization)) {
      // Allow full acronym uppercase org names like AWS, IBM
      issues.push({
        id: `format-entry-${entryId}-org`,
        field: 'Organization',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'info',
        message: `Company / School name capitalization is unstandardized: "${entry.Organization}"`,
        currentValue: entry.Organization,
        suggestedValue: toTitleCase(entry.Organization),
        issueType: 'format'
      });
    }

    // Date validations & formatting checks
    const cleanedStart = cleanDate(entry.StartDate);
    const cleanedEnd = cleanDate(entry.EndDate);

    if (!entry.StartDate || !entry.StartDate.trim()) {
      issues.push({
        id: `missing-entry-${entryId}-startdate`,
        field: 'StartDate',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'error',
        message: `Missing Start Date on career entry for "${entry.Role || idx}".`,
        currentValue: entry.StartDate,
        issueType: 'missing'
      });
    } else if (entry.StartDate.trim() !== cleanedStart) {
      issues.push({
        id: `format-entry-${entryId}-startdate`,
        field: 'StartDate',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'info',
        message: `Start date format "${entry.StartDate}" is unstandardized.`,
        currentValue: entry.StartDate,
        suggestedValue: cleanedStart,
        issueType: 'format'
      });
    }

    if (!entry.EndDate || !entry.EndDate.trim()) {
      issues.push({
        id: `missing-entry-${entryId}-enddate`,
        field: 'EndDate',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'warning',
        message: `End Date is blank for "${entry.Role || idx}". Defaulting to "Present" is recommended if currently employed.`,
        currentValue: entry.EndDate,
        suggestedValue: 'Present',
        issueType: 'missing'
      });
    } else if (entry.EndDate.trim() !== cleanedEnd) {
      issues.push({
        id: `format-entry-${entryId}-enddate`,
        field: 'EndDate',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'info',
        message: `End date format "${entry.EndDate}" is unstandardized.`,
        currentValue: entry.EndDate,
        suggestedValue: cleanedEnd,
        issueType: 'format'
      });
    }

    // Validate logic of timelines: EndDate earlier than StartDate
    if (entry.StartDate && entry.EndDate) {
      const sDate = new Date(entry.StartDate);
      const eDate = entry.EndDate.toLowerCase() === 'present' ? new Date() : new Date(entry.EndDate);
      if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime()) && eDate < sDate) {
        issues.push({
          id: `datatype-entry-${entryId}-dateoverlap`,
          field: 'EndDate',
          section: 'Career_Entries',
          itemId: entryId,
          severity: 'error',
          message: `Logical Timeline Conflict: End date "${entry.EndDate}" cannot be earlier than its Start date "${entry.StartDate}".`,
          currentValue: entry.EndDate,
          issueType: 'datatype'
        });
      }
    }

    // Role Responsibilities
    if (!entry.Core_Responsibilities_Scope || !entry.Core_Responsibilities_Scope.trim()) {
      issues.push({
        id: `missing-entry-${entryId}-scope`,
        field: 'Core_Responsibilities_Scope',
        section: 'Career_Entries',
        itemId: entryId,
        severity: 'warning',
        message: `No context narrative or governing responsibilities detailed for role "${entry.Role || idx}".`,
        currentValue: entry.Core_Responsibilities_Scope,
        issueType: 'missing'
      });
    }
  });

  // ============================================
  // 5. STRUCTURED ACHIEVEMENTS AUDITING
  // ============================================
  const achievements = db.Structured_Achievements || [];
  achievements.forEach((ach, index) => {
    const achId = ach.Achievement_ID || `ach-${index}`;
    
    // Check metric placeholders / missing numeric metrics
    if (!ach.Metric || !ach.Metric.trim() || ach.Metric.toLowerCase() === 'x' || /placeholder|unknown/i.test(ach.Metric)) {
      issues.push({
        id: `missing-achievement-${achId}-metric`,
        field: 'Metric',
        section: 'Structured_Achievements',
        itemId: achId,
        severity: 'warning',
        message: `Achievement in role index [${index}] lacks a quantified metric to boost ATS score.`,
        currentValue: ach.Metric,
        issueType: 'missing'
      });
    }

    // Formating checking for empty action verbs, outcomes etc.
    if (!ach.Action_Verb || !ach.Action_Verb.trim()) {
      issues.push({
        id: `missing-achievement-${achId}-verb`,
        field: 'Action_Verb',
        section: 'Structured_Achievements',
        itemId: achId,
        severity: 'info',
        message: `Achievement is missing a high-impact Action Verb descriptor.`,
        currentValue: ach.Action_Verb,
        issueType: 'missing'
      });
    }
  });

  // ============================================
  // 6. HEALTH SCORE CALCULATION (Cleanliness Rank)
  // ============================================
  // Base 100 points, subtract based on issue severities
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'error') score -= 8;
    if (issue.severity === 'warning') score -= 3;
    if (issue.severity === 'info') score -= 1;
  });

  const healthScore = Math.max(0, Math.min(100, score));

  return {
    issues,
    healthScore
  };
}

/**
 * Automap and fix formatting/capitalization anomalies instantly.
 * Standardizes email characters, capitalizing names/job roles, date structures,
 * and standardizing numeric inputs.
 */
export function cleanCareerDatabase(db: CareerDatabase): { cleanedDb: CareerDatabase; fixedCount: number } {
  let fixedCount = 0;
  if (!db) return { cleanedDb: db, fixedCount };

  // Clone database to keep clean mutations
  const cleaned: CareerDatabase = JSON.parse(JSON.stringify(db));

  // 1. Personal Information Cleaning
  if (cleaned.Personal_Information) {
    const pi = cleaned.Personal_Information;
    if (pi.FullName) {
      const suggest = toTitleCase(pi.FullName);
      if (pi.FullName !== suggest) {
        pi.FullName = suggest;
        fixedCount++;
      }
    }
    if (pi.Email) {
      const suggest = cleanEmail(pi.Email);
      if (pi.Email !== suggest) {
        pi.Email = suggest;
        fixedCount++;
      }
    }
    if (pi.Phone) {
      const suggest = cleanPhone(pi.Phone);
      if (pi.Phone !== suggest) {
        pi.Phone = suggest;
        fixedCount++;
      }
    }
    if (pi.Location) {
      const suggest = toTitleCase(pi.Location);
      if (pi.Location !== suggest) {
        pi.Location = suggest;
        fixedCount++;
      }
    }
  }

  // 2. Job Preferences min-salary rounding
  if (cleaned.Career_Profile?.Job_Preferences) {
    const jp = cleaned.Career_Profile.Job_Preferences;
    if (jp.Min_Salary !== undefined && jp.Min_Salary !== null) {
      const num = Number(jp.Min_Salary);
      if (isNaN(num) || num < 0) {
        jp.Min_Salary = 0;
        fixedCount++;
      } else {
        const rounded = Math.round(num);
        if (jp.Min_Salary !== rounded) {
          jp.Min_Salary = rounded;
          fixedCount++;
        }
      }
    }
  }

  // 3. Master Skills Inventory
  if (cleaned.Master_Skills_Inventory) {
    cleaned.Master_Skills_Inventory = cleaned.Master_Skills_Inventory.map(skill => {
      if (skill.Skill_Name) {
        const cleanName = toTitleCase(skill.Skill_Name);
        if (skill.Skill_Name !== cleanName) {
          skill.Skill_Name = cleanName;
          fixedCount++;
        }
      }
      if (skill.Category) {
        const cleanCat = toTitleCase(skill.Category);
        if (skill.Category !== cleanCat) {
          skill.Category = cleanCat;
          fixedCount++;
        }
      }
      if (skill.Years_Experience !== undefined && skill.Years_Experience !== null) {
        const num = Number(skill.Years_Experience);
        if (isNaN(num) || num < 0) {
          skill.Years_Experience = 0;
          fixedCount++;
        } else if (num > 70) {
          skill.Years_Experience = 70;
          fixedCount++;
        } else {
          // Normalize to maximum 1 decimal place
          const rounded = Math.round(num * 10) / 10;
          if (skill.Years_Experience !== rounded) {
            skill.Years_Experience = rounded;
            fixedCount++;
          }
        }
      }
      return skill;
    });
  }

  // 4. Career Entries
  if (cleaned.Career_Entries) {
    cleaned.Career_Entries = cleaned.Career_Entries.map(entry => {
      if (entry.Role) {
        const suggest = toTitleCase(entry.Role);
        if (entry.Role !== suggest) {
          entry.Role = suggest;
          fixedCount++;
        }
      }
      if (entry.Organization && !/^[A-Z\s]+$/.test(entry.Organization)) {
        const suggest = toTitleCase(entry.Organization);
        if (entry.Organization !== suggest) {
          entry.Organization = suggest;
          fixedCount++;
        }
      }
      if (entry.StartDate) {
        const suggest = cleanDate(entry.StartDate);
        if (entry.StartDate !== suggest) {
          entry.StartDate = suggest;
          fixedCount++;
        }
      }
      if (entry.EndDate) {
        const suggest = cleanDate(entry.EndDate);
        if (entry.EndDate !== suggest) {
          entry.EndDate = suggest;
          fixedCount++;
        }
      }
      return entry;
    });
  }

  return {
    cleanedDb: cleaned,
    fixedCount
  };
}
