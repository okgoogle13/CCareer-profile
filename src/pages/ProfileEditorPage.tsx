import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WorkspaceLayout } from "../components/layout/WorkspaceLayout";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Textarea } from "../components/ui/Textarea";
import { TextInput } from "../components/ui/TextInput";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { User } from "firebase/auth";
import { getUserCareerData, saveUserCareerData } from "../../services/firebase";
import { CareerDatabase, CareerEntry, MasterSkill, PersonalInformation, EntryType, JobPreferences, StructuredAchievement } from "../../types";
import { analyzeCareerDatabase, cleanCareerDatabase, DataQualityIssue, toTitleCase } from "../../services/dataSanitizer";

interface ProfileEditorPageProps {
  user: User;
}

const DEFAULT_BLANK_PROFILE: CareerDatabase = {
  Personal_Information: {
    FullName: "",
    Email: "",
    Phone: "",
    Location: "",
    Portfolio_Website_URLs: []
  },
  Career_Profile: {
    Target_Titles: [],
    Master_Summary_Points: [],
    Job_Preferences: {
      Target_Roles: [],
      Min_Salary: 0,
      Preferred_Locations: [],
      Work_Type: "Any",
      Relocation_Open: false,
      Notice_Period: ""
    }
  },
  Master_Skills_Inventory: [],
  Career_Entries: [],
  Structured_Achievements: [],
  KSC_Responses: []
};

const DEMO_DIRTY_PROFILE: CareerDatabase = {
  Personal_Information: {
    FullName: "  jaNE   dOe  ", // formatting: casing, multiple spaces
    Email: "JANE.DOE@GMAIL.COM  ", // formatting: uppercase, trailing space
    Phone: "1234567890", // formatting: unformatted digits
    Location: "san francisco, ca", // formatting: lowercase cities
    Portfolio_Website_URLs: ["https://janedoe.me"]
  },
  Career_Profile: {
    Target_Titles: ["senior software engineer", "Tech Lead"],
    Master_Summary_Points: [
      "Accomplished tech leader with 8+ years experience building highly scalable React applications.",
      "proven experience leading cross-functional developer teams."
    ],
    Job_Preferences: {
      Target_Roles: ["Senior software engineer"],
      Min_Salary: -120000, // datatype: negative number
      Preferred_Locations: ["Remote"],
      Work_Type: "Remote",
      Relocation_Open: false,
      Notice_Period: "2 weeks"
    }
  },
  Master_Skills_Inventory: [
    {
      Skill_Name: "react.js", // formatting: casing and dots
      Category: "FRONTEND development", // formatting: mixed case
      Subtype: ["Frameworks"],
      Proficiency: "Expert",
      Years_Experience: -5 // datatype: negative years
    },
    {
      Skill_Name: "TypeScript",
      Category: "frontend",
      Subtype: ["Languages"],
      Proficiency: "Expert",
      Years_Experience: 15.42
    },
    {
      Skill_Name: "node.js",
      Category: "backend",
      Subtype: ["Runtime"],
      Proficiency: "Proficient",
      Years_Experience: NaN // datatype: invalid number
    }
  ],
  Career_Entries: [
    {
      Entry_ID: "entry-1",
      Entry_Type: EntryType.WORK_EXPERIENCE,
      Organization: "google inc.", // formatting: lowercase
      Role: "software engineer III", // formatting: lowercase
      StartDate: "2022-05-15",
      EndDate: "2018-02-10", // logical chronology breach (End earlier than Start)
      Location: "Mountain View, CA",
      Core_Responsibilities_Scope: "Built highly distributed microservices.",
      Subtype_Tags: ["Backend"]
    },
    {
      Entry_ID: "entry-2",
      Entry_Type: EntryType.WORK_EXPERIENCE,
      Organization: "SUPERCOOL STARTUP", // cases
      Role: "Lead FRONTEND Developer", // cases
      StartDate: "10/12/2018", // unstandardized date string
      EndDate: "Present",
      Location: "San Francisco",
      Core_Responsibilities_Scope: "Led development of core SaaS dashboard from scratch.",
      Subtype_Tags: ["Frontend"]
    }
  ],
  Structured_Achievements: [
    {
      Achievement_ID: "ach-1",
      Entry_ID: "entry-1",
      Original_Text: "Boosted database performance substantially.",
      Action_Verb: "Boosted",
      Noun_Task: "database performance",
      Metric: "X", // missing metric value
      Strategy: "query optimization",
      Outcome: "substantially",
      Needs_Review_Flag: true,
      Subtype_Tags: ["Database"],
      Skills_Used: [],
      Tools_Used: []
    }
  ],
  KSC_Responses: []
};

export function ProfileEditorPage({ user }: ProfileEditorPageProps) {
  const [profileData, setProfileData] = useState<CareerDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"editor" | "hygiene" | "raw">("editor");
  const [activeSection, setActiveSection] = useState<"personal" | "skills" | "history" | "preferences">("personal");
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [newSkill, setNewSkill] = useState<Partial<MasterSkill>>({ Skill_Name: "", Category: "", Years_Experience: 0 });

  // Load user data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUserCareerData(user.uid);
        if (data) {
          setProfileData(data);
        } else {
          // If no existing profile, initialize with a blank template
          setProfileData({ ...DEFAULT_BLANK_PROFILE });
        }
      } catch (err) {
        console.error("Failed to fetch user career database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user.uid]);

  // Run real-time data audit
  const auditReport = useMemo(() => {
    if (!profileData) return { issues: [], healthScore: 100 };
    return analyzeCareerDatabase(profileData);
  }, [profileData]);

  // Handle saving the state to firestore
  const handleSave = async (newData = profileData) => {
    if (!user || !newData) return;
    setSyncStatus("saving");
    try {
      await saveUserCareerData(user.uid, newData);
      setSyncStatus("saved");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSyncStatus("error");
    }
  };

  // Run global formatting auto-cleanup
  const handleAutoClean = () => {
    if (!profileData) return;
    const { cleanedDb, fixedCount } = cleanCareerDatabase(profileData);
    setProfileData(cleanedDb);
    handleSave(cleanedDb);
    alert(`Auto-Clean Complete! Instantly resolved and standardized ${fixedCount} historical visual formatting errors, capitalization anomalies, and data type issues.`);
  };

  // Apply single localized suggestion
  const handleApplySingleSuggestion = (issue: DataQualityIssue) => {
    if (!profileData) return;
    const updated = JSON.parse(JSON.stringify(profileData)) as CareerDatabase;

    if (issue.section === "Personal_Information") {
      const field = issue.field as keyof PersonalInformation;
      (updated.Personal_Information as any)[field] = issue.suggestedValue;
    } else if (issue.section === "Career_Profile" && issue.field === "Job_Preferences.Min_Salary") {
      if (updated.Career_Profile.Job_Preferences) {
        updated.Career_Profile.Job_Preferences.Min_Salary = issue.suggestedValue;
      }
    } else if (issue.section === "Master_Skills_Inventory" && issue.itemId) {
      updated.Master_Skills_Inventory = updated.Master_Skills_Inventory.map(skill => {
        const key = issue.itemId === skill.Skill_Name ? skill.Skill_Name : "skill";
        if (skill.Skill_Name === issue.itemId || key === "skill") {
          (skill as any)[issue.field] = issue.suggestedValue;
        }
        return skill;
      });
    } else if (issue.section === "Career_Entries" && issue.itemId) {
      updated.Career_Entries = updated.Career_Entries.map(entry => {
        if (entry.Entry_ID === issue.itemId) {
          (entry as any)[issue.field] = issue.suggestedValue;
        }
        return entry;
      });
    }

    setProfileData(updated);
    handleSave(updated);
  };

  // Inline correction support
  const handleInlineCorrectionInputChange = (issue: DataQualityIssue, newValue: any) => {
    if (!profileData) return;
    const updated = JSON.parse(JSON.stringify(profileData)) as CareerDatabase;

    if (issue.section === "Personal_Information") {
      const field = issue.field as keyof PersonalInformation;
      (updated.Personal_Information as any)[field] = newValue;
    } else if (issue.section === "Career_Profile" && issue.field === "Job_Preferences.Min_Salary") {
      if (updated.Career_Profile.Job_Preferences) {
        updated.Career_Profile.Job_Preferences.Min_Salary = Number(newValue);
      }
    } else if (issue.section === "Master_Skills_Inventory" && issue.itemId) {
      updated.Master_Skills_Inventory = updated.Master_Skills_Inventory.map(skill => {
        if (skill.Skill_Name === issue.itemId) {
          if (issue.field === "Years_Experience") {
            skill.Years_Experience = Number(newValue);
          } else {
            (skill as any)[issue.field] = newValue;
          }
        }
        return skill;
      });
    } else if (issue.section === "Career_Entries" && issue.itemId) {
      updated.Career_Entries = updated.Career_Entries.map(entry => {
        if (entry.Entry_ID === issue.itemId) {
          (entry as any)[issue.field] = newValue;
        }
        return entry;
      });
    }

    setProfileData(updated);
  };

  // Helper selectors for nested state mod
  const setPersonalField = (field: keyof PersonalInformation, value: any) => {
    if (!profileData) return;
    const updated = {
      ...profileData,
      Personal_Information: {
        ...profileData.Personal_Information,
        [field]: value
      }
    };
    setProfileData(updated);
  };

  const setPreferencesField = (field: keyof JobPreferences, value: any) => {
    if (!profileData) return;
    const updated = {
      ...profileData,
      Career_Profile: {
        ...profileData.Career_Profile,
        Job_Preferences: {
          ...profileData.Career_Profile.Job_Preferences,
          [field]: value
        } as JobPreferences
      }
    };
    setProfileData(updated);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData || !newSkill.Skill_Name) return;
    
    const skillItem: MasterSkill = {
      Skill_Name: newSkill.Skill_Name.trim(),
      Category: newSkill.Category?.trim() || "Uncategorized",
      Subtype: [],
      Proficiency: "Proficient",
      Years_Experience: Number(newSkill.Years_Experience) || 0
    };

    const updated = {
      ...profileData,
      Master_Skills_Inventory: [...profileData.Master_Skills_Inventory, skillItem]
    };
    setProfileData(updated);
    setNewSkill({ Skill_Name: "", Category: "", Years_Experience: 0 });
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!profileData) return;
    const updated = {
      ...profileData,
      Master_Skills_Inventory: profileData.Master_Skills_Inventory.filter(s => s.Skill_Name !== skillName)
    };
    setProfileData(updated);
  };

  const handleUpdateEntry = (id: string, field: keyof CareerEntry, value: any) => {
    if (!profileData) return;
    const updated = {
      ...profileData,
      Career_Entries: profileData.Career_Entries.map(entry => {
        if (entry.Entry_ID === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    };
    setProfileData(updated);
  };

  const handleAddEntry = () => {
    if (!profileData) return;
    const newEntry: CareerEntry = {
      Entry_ID: `entry-${Date.now()}`,
      Entry_Type: EntryType.WORK_EXPERIENCE,
      Organization: "",
      Role: "",
      StartDate: "",
      EndDate: "Present",
      Location: "",
      Core_Responsibilities_Scope: "",
      Subtype_Tags: []
    };
    setProfileData({
      ...profileData,
      Career_Entries: [newEntry, ...profileData.Career_Entries]
    });
  };

  const handleRemoveEntry = (id: string) => {
    if (!profileData) return;
    setProfileData({
      ...profileData,
      Career_Entries: profileData.Career_Entries.filter(e => e.Entry_ID !== id),
      Structured_Achievements: profileData.Structured_Achievements.filter(a => a.Entry_ID !== id)
    });
  };

  // Render loading ring
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--sys-color-charcoalBackground-base)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--sys-color-solidarityRed-base)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <WorkspaceLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        id="profile-editor-layout-container"
      >
        {/* Page Header */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-[var(--sys-color-concreteGrey-steps-0)] pb-8">
          <div>
            <h1 className="text-6xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter leading-none mb-4">
              Base <span className="text-[var(--sys-color-solidarityRed-base)]">Profile</span>
            </h1>
            <p className="text-sm type-laborExploitationPressure text-[var(--sys-color-stencilYellow-base)] uppercase tracking-widest">
              YOUR SOLID MASTER RECORD. ACCURACY IS POWER.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 z-10 w-full md:w-auto">
            <button
              onClick={() => {
                setProfileData({ ...DEMO_DIRTY_PROFILE });
                setActiveTab("hygiene");
              }}
              className="px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider border-2 border-[var(--sys-color-inkGold-base)] text-[var(--sys-color-inkGold-base)] hover:bg-[var(--sys-color-inkGold-steps-0)] transition-all"
              style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
            >
              ⚠️ Load Dirty Demo Data
            </button>
            <button
              onClick={() => setProfileData({ ...DEFAULT_BLANK_PROFILE })}
              className="px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-[var(--sys-color-worker-ash-base)] hover:text-white transition-all"
              style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
            >
              Reset Blank
            </button>
            <button
              onClick={() => handleSave(profileData!)}
              disabled={syncStatus === "saving"}
              className="px-6 py-3 font-bold text-sm uppercase tracking-wider bg-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)] hover:bg-[var(--sys-color-charcoalBackground-steps-1)] hover:text-[var(--sys-color-solidarityRed-base)] border-2 border-[var(--sys-color-solidarityRed-base)] transition-all flex items-center gap-2"
              style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
            >
              {syncStatus === "saving" ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : syncStatus === "saved" ? (
                "✓ Profile Saved"
              ) : (
                "Save Master Profile"
              )}
            </button>
          </div>
        </motion.div>

        {/* Real-time Sanitation Flag Strip */}
        {auditReport.issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 bg-[var(--sys-color-kr-charcoalRed-steps-0)] border-2 border-[var(--sys-color-solidarityRed-base)] flex flex-col md:flex-row justify-between items-center gap-4`}
            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-white text-sm uppercase tracking-wider">
                  Live Audit Scan: Identified {auditReport.issues.length} Profile Quality Issues
                </p>
                <p className="text-xs text-[var(--sys-color-worker-ash-base)]">
                  Including capitalization errors, missing metrics, and data type bugs. Standardized records yield up to 40% higher ATS compatibility!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("hygiene")}
                className="px-4 py-2 font-mono text-[10px] font-bold bg-transparent border-2 border-[var(--sys-color-solidarityRed-base)] hover:bg-[var(--sys-color-solidarityRed-base)] hover:text-white text-[var(--sys-color-solidarityRed-base)] uppercase transition-all"
              >
                Inspect Clinic
              </button>
              <button
                onClick={handleAutoClean}
                className="px-4 py-2 font-mono text-[10px] font-bold bg-[var(--sys-color-solidarityRed-base)] border-2 border-[var(--sys-color-solidarityRed-base)] text-white hover:bg-transparent hover:text-[var(--sys-color-solidarityRed-base)] uppercase transition-all"
              >
                🚀 Auto-Clean All Issues
              </button>
            </div>
          </motion.div>
        )}

        {/* Global Horizontal Tabs */}
        <div className="flex border-b-2 border-[var(--sys-color-concreteGrey-steps-0)] mb-10 gap-2">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-6 py-4 font-mono text-sm uppercase tracking-widest font-bold transition-all border-b-4 -mb-[2px] ${
              activeTab === "editor"
                ? "border-[var(--sys-color-solidarityRed-base)] text-white"
                : "border-transparent text-[var(--sys-color-worker-ash-base)] hover:text-white"
            }`}
          >
            📋 Master Profile Editor
          </button>
          <button
            onClick={() => setActiveTab("hygiene")}
            className={`px-6 py-4 font-mono text-sm uppercase tracking-widest font-bold transition-all border-b-4 -mb-[2px] relative ${
              activeTab === "hygiene"
                ? "border-[var(--sys-color-solidarityRed-base)] text-white"
                : "border-transparent text-[var(--sys-color-worker-ash-base)] hover:text-white"
            }`}
          >
            🧼 Sanitation Clinic
            {auditReport.issues.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-[var(--sys-color-solidarityRed-base)] text-white rounded-full">
                {auditReport.issues.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-6 py-4 font-mono text-sm uppercase tracking-widest font-bold transition-all border-b-4 -mb-[2px] ${
              activeTab === "raw"
                ? "border-[var(--sys-color-solidarityRed-base)] text-white"
                : "border-transparent text-[var(--sys-color-worker-ash-base)] hover:text-white"
            }`}
          >
            ⚙️ Raw DB Payload
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: MASTER EDITOR */}
          {activeTab === "editor" && (
            <motion.div
              key="editor-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
              id="master-profile-editor-grid"
            >
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1 space-y-2">
                {[
                  { id: "personal", label: "👤 Personal Information" },
                  { id: "preferences", label: "⚙️ Career Preferences" },
                  { id: "skills", label: "💎 Skills Inventory" },
                  { id: "history", label: "💼 Career Experience" }
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as any)}
                    className={`block w-full text-left p-4 font-mono text-xs uppercase tracking-widest font-bold border-2 transition-all ${
                      activeSection === sec.id
                        ? "bg-[var(--sys-color-charcoalBackground-steps-2)] border-[var(--sys-color-solidarityRed-base)] text-white shadow-md"
                        : "bg-transparent border-transparent text-[var(--sys-color-worker-ash-base)] hover:text-white hover:border-[var(--sys-color-concreteGrey-steps-0)]"
                    }`}
                    style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Main Editing Card */}
              <div
                className="lg:col-span-3 p-10 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] relative overflow-hidden"
                style={{ borderRadius: "var(--sys-shape-placardTorn01)" }}
              >
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wall-4-light.png')]" />

                <div className="relative z-10 space-y-8">
                  {/* Personal Information Forms */}
                  {activeSection === "personal" && (
                    <div className="space-y-6">
                      <SectionHeader title="Personal Information" subtitle="Your primary profile details that recruiters will see." />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileData?.Personal_Information?.FullName || ""}
                            onChange={e => setPersonalField("FullName", e.target.value)}
                            onBlur={() => handleSave()}
                            placeholder="e.g. Jane Doe"
                            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-white focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] font-mono text-sm"
                            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider mb-2">
                            Email address
                          </label>
                          <input
                            type="email"
                            value={profileData?.Personal_Information?.Email || ""}
                            onChange={e => setPersonalField("Email", e.target.value)}
                            onBlur={() => handleSave()}
                            placeholder="e.g. jane@example.com"
                            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-white focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] font-mono text-sm"
                            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider mb-2">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={profileData?.Personal_Information?.Phone || ""}
                            onChange={e => setPersonalField("Phone", e.target.value)}
                            onBlur={() => handleSave()}
                            placeholder="e.g. (123) 456-7890"
                            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-white focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] font-mono text-sm"
                            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider mb-2">
                            Location (City, State)
                          </label>
                          <input
                            type="text"
                            value={profileData?.Personal_Information?.Location || ""}
                            onChange={e => setPersonalField("Location", e.target.value)}
                            onBlur={() => handleSave()}
                            placeholder="e.g. San Francisco, CA"
                            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-white focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] font-mono text-sm"
                            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Career Preferences */}
                  {activeSection === "preferences" && (
                    <div className="space-y-6">
                      <SectionHeader title="Career Preferences" subtitle="Constraints that direct our tailoring agents." />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider mb-2">
                            Minimum Expected Salary (annual $)
                          </label>
                          <input
                            type="number"
                            value={profileData?.Career_Profile?.Job_Preferences?.Min_Salary ?? ""}
                            onChange={e => setPreferencesField("Min_Salary", e.target.value === "" ? 0 : Number(e.target.value))}
                            onBlur={() => handleSave()}
                            placeholder="e.g. 120000"
                            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-white focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] font-mono text-sm"
                            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider mb-2">
                            Work Model Style
                          </label>
                          <select
                            value={profileData?.Career_Profile?.Job_Preferences?.Work_Type || "Any"}
                            onChange={e => {
                              setPreferencesField("Work_Type", e.target.value as any);
                              setTimeout(() => handleSave(), 100);
                            }}
                            className="w-full p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] text-white focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)] font-mono text-sm"
                            style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                          >
                            <option value="Remote">Remote Only</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-site">On-site</option>
                            <option value="Any">No Preference (Any)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Inventory */}
                  {activeSection === "skills" && (
                    <div className="space-y-6">
                      <SectionHeader title="Skills Inventory & Credentials" subtitle="Your technology catalog of capabilities." />
                      
                      {/* Skill Add Form */}
                      <form onSubmit={handleAddSkill} className="p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border border-[var(--sys-color-concreteGrey-steps-0)] flex flex-wrap gap-4 items-end" style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}>
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[10px] font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Skill Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Java, React, Figma"
                            value={newSkill.Skill_Name}
                            onChange={e => setNewSkill({ ...newSkill, Skill_Name: e.target.value })}
                            className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs text-mono focus:outline-none focus:border-[var(--sys-color-solidarityRed-base)]"
                          />
                        </div>
                        <div className="w-1/4 min-w-[150px]">
                          <label className="block text-[10px] font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Category</label>
                          <input
                            type="text"
                            placeholder="e.g. Frontend, Design"
                            value={newSkill.Category}
                            onChange={e => setNewSkill({ ...newSkill, Category: e.target.value })}
                            className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs text-mono focus:outline-none"
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-[10px] font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Years (num)</label>
                          <input
                            type="text"
                            placeholder="e.g. 5"
                            value={newSkill.Years_Experience ?? ""}
                            onChange={e => setNewSkill({ ...newSkill, Years_Experience: Number(e.target.value) || 0 })}
                            className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs text-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[var(--sys-color-solidarityRed-base)] text-white text-xs uppercase tracking-wider font-bold hover:bg-white hover:text-black font-mono"
                        >
                          + Add
                        </button>
                      </form>

                      {/* Display grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {profileData?.Master_Skills_Inventory && profileData.Master_Skills_Inventory.length > 0 ? (
                          profileData.Master_Skills_Inventory.map(s => {
                            const isDirty = s.Skill_Name !== toTitleCase(s.Skill_Name) || (s.Years_Experience !== undefined && (isNaN(s.Years_Experience) || s.Years_Experience < 0));
                            return (
                              <div
                                key={s.Skill_Name}
                                className={`p-4 bg-[var(--sys-color-charcoalBackground-steps-2)] border-2 flex justify-between items-center ${
                                  isDirty ? "border-[var(--sys-color-stencilYellow-base)] shadow-sm" : "border-[var(--sys-color-concreteGrey-steps-0)]"
                                }`}
                                style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                              >
                                <div>
                                  <p className="font-bold text-white text-sm flex items-center gap-2">
                                    {s.Skill_Name}
                                    {isDirty && <span className="text-xs text-[var(--sys-color-stencilYellow-base)] font-mono">⚠️ Need Format Fix</span>}
                                  </p>
                                  <p className="text-xs text-[var(--sys-color-worker-ash-base)] font-mono uppercase">
                                    {s.Category} &bull; {s.Years_Experience !== undefined && !isNaN(s.Years_Experience) ? `${s.Years_Experience} Yrs` : "N/A"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRemoveSkill(s.Skill_Name);
                                    setTimeout(() => handleSave(), 100);
                                  }}
                                  className="text-red-500 hover:text-white transition-colors text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 text-center py-8 text-[var(--sys-color-worker-ash-base)] italic font-mono text-xs">
                            No skills registered. Add skills using the entry panel above.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Career Experience Timeline */}
                  {activeSection === "history" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <SectionHeader title="Work History Timeline" subtitle="Chronological inventory of your jobs, schools and roles." />
                        <button
                          onClick={handleAddEntry}
                          className="px-4 py-2 hover:bg-[var(--sys-color-solidarityRed-base)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] hover:border-[var(--sys-color-solidarityRed-base)] text-xs text-white uppercase tracking-widest font-mono font-bold transition-all"
                          style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                        >
                          + Add Experience Node
                        </button>
                      </div>

                      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                        {profileData?.Career_Entries && profileData.Career_Entries.length > 0 ? (
                          profileData.Career_Entries.map((e, index) => (
                            <div
                              key={e.Entry_ID}
                              className="p-6 bg-[var(--sys-color-charcoalBackground-steps-2)] border gap-4 border-[var(--sys-color-concreteGrey-steps-0)] relative"
                              style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}
                            >
                              <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                  onClick={() => handleRemoveEntry(e.Entry_ID)}
                                  className="text-xs text-red-500 font-bold uppercase tracking-wider hover:text-white transition-colors"
                                >
                                  ✕ Remove Node
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-[10px] font-mono text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Job title / Degree</label>
                                  <input
                                    type="text"
                                    value={e.Role}
                                    onChange={evt => handleUpdateEntry(e.Entry_ID, "Role", evt.target.value)}
                                    placeholder="e.g. Full Stack Developer"
                                    className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs font-mono focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Employer / Institution</label>
                                  <input
                                    type="text"
                                    value={e.Organization}
                                    onChange={evt => handleUpdateEntry(e.Entry_ID, "Organization", evt.target.value)}
                                    placeholder="e.g. Google"
                                    className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs font-mono focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Start Date</label>
                                  <input
                                    type="text"
                                    value={e.StartDate}
                                    onChange={evt => handleUpdateEntry(e.Entry_ID, "StartDate", evt.target.value)}
                                    placeholder="e.g. 2022-05"
                                    className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs font-mono focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono text-[var(--sys-color-worker-ash-base)] uppercase mb-1">End Date</label>
                                  <input
                                    type="text"
                                    value={e.EndDate}
                                    onChange={evt => handleUpdateEntry(e.Entry_ID, "EndDate", evt.target.value)}
                                    placeholder="e.g. 2024-03 or Present"
                                    className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs font-mono focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-[var(--sys-color-worker-ash-base)] uppercase mb-1">Governing Responsibilities</label>
                                <textarea
                                  value={e.Core_Responsibilities_Scope}
                                  onChange={evt => handleUpdateEntry(e.Entry_ID, "Core_Responsibilities_Scope", evt.target.value)}
                                  placeholder="Summarize context scope..."
                                  rows={2}
                                  className="w-full p-2 bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] text-white text-xs focus:border-[var(--sys-color-solidarityRed-base)] focus:outline-none"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-[var(--sys-color-worker-ash-base)] italic font-mono text-xs border border-dashed border-[var(--sys-color-concreteGrey-steps-0)]">
                            No history entries parsed. Click Add above to define your master timelines.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SANITATION HYGIENE CLINIC */}
          {activeTab === "hygiene" && (
            <motion.div
              key="hygiene-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
              id="hygiene-clinic-console"
            >
              {/* Score summary panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cleanliness Grade Box */}
                <div className="p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] flex flex-col justify-between" style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[var(--sys-color-worker-ash-base)] uppercase tracking-wider block mb-2">Profile Hygiene Rank</span>
                    <h2 className="text-6xl type-solidarityProtest text-white">
                      {auditReport.healthScore}%
                    </h2>
                  </div>
                  <div className="mt-4">
                    <div className="w-full h-3 bg-[var(--sys-color-charcoalBackground-steps-3)] overflow-hidden" style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          auditReport.healthScore > 85
                            ? "bg-[var(--sys-color-kr-activistSmokeGreen-base)]"
                            : auditReport.healthScore > 65
                            ? "bg-[var(--sys-color-stencilYellow-base)]"
                            : "bg-[var(--sys-color-solidarityRed-base)]"
                        }`}
                        style={{ width: `${auditReport.healthScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--sys-color-worker-ash-base)] font-mono block mt-1 uppercase">
                      Severity Deduction Matrix: -8% error | -3% warning | -1% info
                    </span>
                  </div>
                </div>

                {/* Issues Breakdown Grid */}
                <div className="p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] grid grid-cols-3 gap-4" style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}>
                  <div className="flex flex-col justify-center items-center p-2 bg-red-500/10 border border-red-500/20" style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}>
                    <span className="text-3xl">🛑</span>
                    <span className="text-xl font-black text-red-500 mt-1">
                      {auditReport.issues.filter(i => i.severity === "error").length}
                    </span>
                    <span className="text-[9px] font-bold text-red-400 uppercase font-mono mt-1">Errors</span>
                  </div>
                  <div className="flex flex-col justify-center items-center p-2 bg-yellow-500/10 border border-yellow-500/20" style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}>
                    <span className="text-3xl">⚠️</span>
                    <span className="text-xl font-black text-yellow-500 mt-1">
                      {auditReport.issues.filter(i => i.severity === "warning").length}
                    </span>
                    <span className="text-[9px] font-bold text-yellow-400 uppercase font-mono mt-1">Warnings</span>
                  </div>
                  <div className="flex flex-col justify-center items-center p-2 bg-blue-500/10 border border-blue-500/20" style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}>
                    <span className="text-3xl">ℹ️</span>
                    <span className="text-xl font-black text-blue-400 mt-1">
                      {auditReport.issues.filter(i => i.severity === "info").length}
                    </span>
                    <span className="text-[9px] font-bold text-blue-300 uppercase font-mono mt-1">Info</span>
                  </div>
                </div>

                {/* Operations & Fix Board */}
                <div className="p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] flex flex-col justify-center gap-4" style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}>
                  <h4 className="text-sm font-mono font-black text-white uppercase tracking-wider">Sanitation Station Operations</h4>
                  <p className="text-[11px] text-[var(--sys-color-worker-ash-base)]">
                    Direct formatted changes align structure fields cleanly. Run auto-cleaner to resolve strings instantly.
                  </p>
                  <button
                    onClick={handleAutoClean}
                    disabled={auditReport.issues.length === 0}
                    className="w-full py-3 bg-[var(--sys-color-solidarityRed-base)] hover:bg-white text-white hover:text-black font-semibold text-xs tracking-widest font-mono uppercase transition-all flex items-center justify-center gap-2"
                    style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                  >
                    🚀 Auto-Clean Quality Issues
                  </button>
                </div>
              </div>

              {/* Active Issues Auditor */}
              <div
                className="p-8 bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)]"
                style={{ borderRadius: "var(--sys-shape-placardTorn01)" }}
              >
                <SectionHeader title="Active Live Audit Report" subtitle="Fix layout formatting and data type bugs below to elevate performance profile." />

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {auditReport.issues.length > 0 ? (
                    auditReport.issues.map(issue => {
                      const bgClass =
                        issue.severity === "error"
                          ? "bg-red-500/10 border-red-500/40"
                          : issue.severity === "warning"
                          ? "bg-yellow-500/10 border-yellow-500/40"
                          : "bg-blue-500/5 border-blue-500/20";
                      
                      const icon = issue.severity === "error" ? "🛑" : issue.severity === "warning" ? "⚠️" : "ℹ️";

                      return (
                        <div
                          key={issue.id}
                          className={`p-5 border-2 ${bgClass} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}
                          style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span>{icon}</span>
                              <span className="text-[10px] font-mono font-bold bg-[var(--sys-color-charcoalBackground-steps-3)] px-2 py-0.5 text-white uppercase tracking-widest">
                                {issue.section.replace(/_/g, " ")} &bull; {issue.field}
                              </span>
                              <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                                issue.issueType === "datatype" ? "bg-purple-900/50 text-purple-200" :
                                issue.issueType === "format" ? "bg-amber-900/50 text-amber-200" : "bg-red-950 text-red-200"
                              }`}>
                                {issue.issueType}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white mt-1">
                              {issue.message}
                            </p>
                            <div className="text-xs font-mono text-[var(--sys-color-worker-ash-base)] mt-1 flex flex-wrap gap-4">
                              <span>
                                Current Value: <strong className="text-red-400 italic">"{JSON.stringify(issue.currentValue) || "undefined"}"</strong>
                              </span>
                              {issue.suggestedValue !== undefined && (
                                <span>
                                  Suggested: <strong className="text-green-400">"{JSON.stringify(issue.suggestedValue)}"</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto shrink-0 z-10">
                            {/* Inline Edit Correction Box */}
                            <div className="flex items-center bg-[var(--sys-color-charcoalBackground-steps-3)] border border-[var(--sys-color-concreteGrey-steps-0)] p-1 w-full md:w-48">
                              <input
                                type={issue.field.includes("Min_Salary") || issue.field.includes("Years_Experience") ? "number" : "text"}
                                value={
                                  issue.section === "Personal_Information" && profileData ? (profileData.Personal_Information as any)[issue.field] || "" :
                                  issue.field === "Job_Preferences.Min_Salary" && profileData ? profileData.Career_Profile.Job_Preferences?.Min_Salary ?? "" :
                                  issue.section === "Master_Skills_Inventory" && profileData ? profileData.Master_Skills_Inventory.find(s => s.Skill_Name === issue.itemId)?.Years_Experience ?? "" : ""
                                }
                                onChange={e => handleInlineCorrectionInputChange(issue, e.target.value)}
                                onBlur={() => handleSave()}
                                placeholder="Fix value here..."
                                className="bg-transparent border-none text-[11px] font-mono text-white focus:ring-0 w-full px-2"
                              />
                            </div>

                            {issue.suggestedValue !== undefined && (
                              <button
                                onClick={() => handleApplySingleSuggestion(issue)}
                                className="px-4 py-2 font-mono text-[10px] font-bold bg-[var(--sys-color-solidarityRed-base)] border border-[var(--sys-color-solidarityRed-base)] text-white hover:bg-white hover:text-black uppercase transition-all whitespace-nowrap"
                                style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}
                              >
                                🎛️ Fix Format
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 border border-dashed border-[var(--sys-color-concreteGrey-steps-0)]">
                      <span className="text-5xl block mb-4">🎉</span>
                      <p className="text-sm font-bold text-green-400 uppercase tracking-widest font-mono">
                        Pristine Database hygiene achieved!
                      </p>
                      <p className="text-xs text-[var(--sys-color-worker-ash-base)] mt-1">
                        We found no formatting defects, typing logic errors or missing values. Your master cv data is thoroughly validated.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RAW DATABASE PAYLOAD VIEW */}
          {activeTab === "raw" && (
            <motion.div
              key="raw-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
              id="raw-json-database-payload-viewer"
            >
              <div className="bg-[var(--sys-color-charcoalBackground-steps-1)] border-2 border-[var(--sys-color-concreteGrey-steps-0)] p-8" style={{ borderRadius: "var(--sys-shape-blockRiot02)" }}>
                <SectionHeader title="Database Payload JSON" subtitle="This standard payload forms the strict schema that seeds our tailoring agents." />
                <div className="bg-black p-6 h-96 overflow-auto border border-zinc-800" style={{ borderRadius: "var(--sys-shape-blockRiot01)" }}>
                  <pre className="text-xs text-[var(--sys-color-kr-activistSmokeGreen-base)] font-mono">{JSON.stringify(profileData, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </WorkspaceLayout>
  );
}
