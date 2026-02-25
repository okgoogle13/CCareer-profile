
export interface PersonalInformation {
  FullName: string;
  Phone: string;
  Email: string;
  Location: string;
  Portfolio_Website_URLs: string[];
}

export interface JobPreferences {
  Target_Roles: string[];
  Min_Salary?: number;
  Preferred_Locations: string[];
  Work_Type: "Remote" | "Hybrid" | "On-site" | "Any";
  Relocation_Open: boolean;
  Notice_Period?: string;
}

export interface CareerProfile {
  Target_Titles: string[];
  Master_Summary_Points: string[];
  Job_Preferences?: JobPreferences;
}

export type SkillProficiency = "Novice" | "Competent" | "Proficient" | "Expert" | "Master";

export interface MasterSkill {
  Skill_Name: string;
  Category: string;
  Subtype: string[];
  Proficiency?: SkillProficiency; 
  Years_Experience?: number;
  Last_Used_Year?: string;
}

export enum EntryType {
  WORK_EXPERIENCE = "Work Experience",
  PROJECT = "Project",
  EDUCATION = "Education",
  CERTIFICATION = "Certification",
  VOLUNTEER = "Volunteer",
}

export interface CareerEntry {
  Entry_ID: string;
  Entry_Type: EntryType;
  Organization: string;
  Role: string;
  StartDate: string;
  EndDate: string;
  Location: string;
  Core_Responsibilities_Scope: string;
  Subtype_Tags: string[];
  Embedding?: number[]; // Vector embedding for RAG retrieval
}

export interface StructuredAchievement {
  Achievement_ID: string;
  Entry_ID: string;
  Original_Text: string;
  Action_Verb: string;
  Noun_Task: string;
  Metric: string;
  Strategy: string;
  Outcome: string;
  Skills_Used: string[];
  Tools_Used: string[];
  Subtype_Tags: string[];
  Needs_Review_Flag: boolean;
  Embedding?: number[]; // Vector embedding for RAG retrieval
  Improvement_Suggestions?: {
    Action_Verb?: string;
    Noun_Task?: string;
    Metric?: string;
    Strategy?: string;
    Outcome?: string;
  };
}

export interface KSCResponse {
  KSC_ID: string;
  KSC_Prompt: string;
  Situation: string;
  Task: string;
  Action: string;
  Result: string;
  Skills_Used: string[];
  Subtype_Tags: string[];
  Original_Text: string;
  Needs_Review_Flag: boolean;
  STAR_Feedback: string;
  Linked_Entry_ID?: string;
  Linked_Achievement_IDs?: string[];
  Embedding?: number[]; // Vector embedding for RAG retrieval
  Improvement_Suggestions: {
    Situation?: string;
    Task?: string;
    Action?: string;
    Result?: string;
  };
}

export interface CareerDatabase {
  Personal_Information: PersonalInformation;
  Career_Profile: CareerProfile;
  Master_Skills_Inventory: MasterSkill[];
  Career_Entries: CareerEntry[];
  Structured_Achievements: StructuredAchievement[];
  KSC_Responses: KSCResponse[];
}

export interface JobOpportunity {
  Job_Title: string;
  Company_Name: string;
  Location: string;
  Work_Type: "Remote" | "Hybrid" | "On-site" | "Unspecified";
  Salary_Range: string;
  Key_Responsibilities: string[];
  Required_Hard_Skills: string[];
  Required_Soft_Skills: string[];
  Preferred_Skills: string[];
  Required_Experience: string;
  Company_Culture_Keywords: string[];
  Red_Flags: string[];
  Application_Deadline: string;
  Source_URL: string;
}

export interface SkillMatch {
  Skill: string;
  Match_Level: "Strong" | "Partial" | "Missing";
  Evidence: string;
}

export interface MatchAnalysis {
  Overall_Fit_Score: number;
  Skill_Gaps: SkillMatch[];
  Tailored_Summary: string;
  Recommended_Achievement_IDs: string[];
  Cover_Letter_Draft: string;
}

export enum AppState {
  IDLE,
  PROCESSING,
  VALIDATING,
  JOB_EXTRACTION,
  ERROR,
}
