# ATS Optimization & Resume Tailoring Platform Guidelines

## 1. User Workflow
1. **Onboarding & Profile Creation:** User inputs their foundational Career Database (Personal Info, Master Skills Inventory, Career Entries, Structured Achievements).
2. **Job Discovery & Input:** User finds a target job and inputs the Job Description (text or URL) into the system.
3. **Job Parsing:** The system parses the job description (via `parseJobFlow`) to extract Job Title, Company, Key Responsibilities, and Required/Preferred Skills.
4. **Match Analysis:** The system compares the user's Career Database against the parsed Job Opportunity (via `matchAnalysisFlow` / `generateMatchAnalysis`).
5. **Review Analysis:** User reviews the Match Analysis dashboard, which includes:
   - Overall Fit Score (0-100)
   - Skill Gaps (Strong, Partial, Missing) with evidence
   - Resume & Cover Letter Audits (violations, recommendations)
6. **Resume Tailoring:** User views the tailored resume (`TailoredResumeView`), which now includes:
   - A highly targeted `Headline_Suggestion`
   - A `Tailored_Summary`
   - Dynamically sorted `Recommended_Achievement_IDs`
7. **Iterative Polishing:** User can click to polish specific achievements using AI (`refineAchievementField`).
8. **Export:** User exports the finalized, ATS-optimized resume and cover letter.

## 2. Frontend Specs
- **Framework:** React 18+ with TypeScript, built via Vite.
- **Styling:** Tailwind CSS for utility-first, responsive design.
- **Typography & Layout:** Supports multiple templates (e.g., single-column, two-column) with customizable fonts (Sans/Serif) and color themes (Primary, Secondary, Accent).
- **State Management:** React hooks (`useState`, `useEffect`) for managing Career Data, Job Data, and Analysis Results.
- **Icons:** `lucide-react` for crisp, consistent UI iconography.
- **Animations:** `framer-motion` (if applicable) for smooth transitions between analysis states.

## 3. Routes, Pages, Screens, and Wireframes
*Mapped directly to the User Workflow.*

### Route: `/` (Dashboard)
- **Workflow Step:** Overview
- **Wireframe:**
  - **Header:** App Logo, User Profile Menu.
  - **Main Content:** Summary of Career Database completeness, list of recently analyzed jobs with their Fit Scores.
  - **FAB/Primary Action:** "New Job Match" button.

### Route: `/profile` (Career Database Editor)
- **Workflow Step:** Onboarding & Profile Creation (Step 1)
- **Wireframe:**
  - **Tabs:** Personal Info | Experience | Education | Skills | Achievements.
  - **Forms:** Structured inputs for each section.
  - **Action:** "Save Profile" button.

### Route: `/job-match` (Job Input & Parsing)
- **Workflow Step:** Job Discovery & Input, Job Parsing (Steps 2 & 3)
- **Wireframe:**
  - **Input Area:** Large text area for pasting Job Description or a URL input field.
  - **Action:** "Analyze Match" button (triggers `parseJobFlow` and `matchAnalysisFlow`).
  - **Loading State:** Skeleton loaders or progress indicators showing AI analysis steps.

### Route: `/analysis/:jobId` (Match Analysis Dashboard)
- **Workflow Step:** Review Analysis (Step 5)
- **Wireframe:**
  - **Top Banner:** Job Title, Company, and large circular gauge for **Overall Fit Score**.
  - **Section 1: Skill Gaps:** Grid or list showing Required Skills mapped to Match Levels (Green/Strong, Yellow/Partial, Red/Missing) with expandable evidence.
  - **Section 2: Audits:** Cards showing Resume Audit and Cover Letter Audit scores, violations, and recommendations.
  - **Action:** "View Tailored Resume" button.

### Route: `/resume-builder/:jobId` (Tailored Resume View)
- **Workflow Step:** Resume Tailoring & Iterative Polishing (Steps 6 & 7)
- **Wireframe:**
  - **Sidebar:** Template selector (Single vs. Two-Column), Color/Font pickers.
  - **Main Canvas:** Live preview of `TailoredResumeView`.
    - *Header:* Name, `Headline_Suggestion`, Contact Info.
    - *Summary:* `Tailored_Summary`.
    - *Experience:* Filtered/Sorted by `Recommended_Achievement_IDs`.
  - **Interactions:** Hovering over an achievement shows a "Polish with AI" magic wand icon.
  - **Action:** "Download PDF" button.

### Route: `/cover-letter/:jobId` (Cover Letter View)
- **Workflow Step:** Export (Step 8)
- **Wireframe:**
  - **Main Canvas:** Editable text area pre-filled with `Cover_Letter_Draft`.
  - **Action:** "Download PDF" button.

## 4. Backend Features
- **AI Integration (Gemini & Genkit):**
  - **`parseJobFlow`:** Uses `@genkit-ai/google-genai` to extract structured data (Title, Company, Responsibilities, Skills) from raw job descriptions.
  - **`matchAnalysisFlow` / `generateMatchAnalysis`:** Uses `gemini-3.1-pro-preview` for complex reasoning to calculate Fit Score, identify Skill Gaps, write Tailored Summaries, suggest Headlines, and audit documents.
  - **`refineAchievementField`:** Uses `gemini-3-flash-preview` for quick, targeted text polishing (e.g., improving action verbs or metrics).
- **Data Models (TypeScript Interfaces):**
  - `CareerDatabase`: Master schema for user data.
  - `JobOpportunity`: Schema for parsed job data.
  - `MatchAnalysis`: Comprehensive schema for AI output (Fit Score, Gaps, Headline, Summary, Audits).
- **Security & API:**
  - API keys (`GEMINI_API_KEY`) must be securely managed via environment variables.
  - Serverless functions or backend routes (if using Express/Next.js) to proxy AI requests and protect the API key from client-side exposure.

## 5. Build Specs
- **Node Environment:** Node.js 18+
- **Package Manager:** npm
- **Core Dependencies:**
  - `react`, `react-dom`, `react-router-dom` (Frontend)
  - `tailwindcss`, `postcss`, `autoprefixer` (Styling)
  - `@google/genai`, `@genkit-ai/core`, `@genkit-ai/google-genai` (AI Services)
  - `zod` (Schema validation for Genkit)
- **Scripts:**
  - `npm run dev`: Starts the Vite development server.
  - `npm run build`: Compiles TypeScript and builds the Vite project for production.
  - `npm run lint`: Runs ESLint to ensure code quality.
- **Environment Variables (`.env`):**
  - `GEMINI_API_KEY=your_api_key_here`
- **Deployment:**
  - The `dist/` folder generated by `npm run build` is ready for static hosting or serving via an Express backend.
  - If using a custom Express server (`server.ts`), ensure Vite middleware is configured for development and static file serving is configured for production.
