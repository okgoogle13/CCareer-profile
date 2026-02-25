# Career Database Pre-processor: Project Guidelines

## Project Overview
The **Career Database Pre-processor** is a specialized AI-powered utility designed to transform fragmented, raw career documents (Resumes, Cover Letters, Selection Criteria) into a highly-structured, machine-readable JSON database. It solves the problem of data silos in career history by de-duplicating roles, rewriting achievements into high-impact formulas, and categorizing skills across diverse documents.

## Tech Stack
- **Frontend Framework**: [React 19](https://react.dev/) (Functional Components, Hooks)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first, responsive design)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (Utilizing `gemini-3-pro-preview` for complex reasoning and `gemini-3-flash-preview` for fast processing)
- **Database (Intended)**: [Firebase/Firestore](https://firebase.google.com/) for secure storage of processed profiles.
- **Export (Intended)**: [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html) for generating refined resume snapshots.
- **Types**: TypeScript for strict data structuring.

## Application Flow
The application follows a linear, wizard-like progression to ensure data integrity:
1.  **Ingestion (IDLE State)**: Users upload up to 100 documents via a drag-and-drop interface.
2.  **Analysis (PROCESSING State)**: 
    - Files are converted to Base64.
    - Gemini analyzes the entire corpus simultaneously.
    - Logic: De-duplicate roles, merge timeline gaps, and structure achievements.
3.  **Refinement (VALIDATING State)**: 
    - A dashboard displays "Needs Review" flags (e.g., missing metrics or weak STAR structures).
    - Users can live-edit fields to finalize the data.
4.  **Integration (API PREVIEW)**: 
    - Final structured JSON is available for downstream applications (like CareerCopilot).

## Core Components
- `Header`: Consistent branding and navigation.
- `DocumentInput`: Managed file upload state with type validation (PDF, DOCX, TXT).
- `ValidationDashboard`: The "Human-in-the-loop" interface.
    - `CareerEntryCard`: Collapsible view of merged roles.
    - `AchievementItem`: Specialized editor for the "Action + Noun + Metric + Outcome" formula.
    - `EditableField`: Inline editing for rapid data cleaning.
- `App`: Main state orchestrator using a Finite State Machine (IDLE -> PROCESSING -> VALIDATING -> ERROR).

## AI Integration & Prompt Engineering
- **Model Choice**: Primarily uses `gemini-3-pro-preview` (via `geminiService.ts`) for high-context window support and complex reasoning required for de-duplication across 100+ documents.
- **Structured Output**: Uses `responseMimeType: "application/json"` with a strict `responseSchema` to guarantee the UI can parse the result.
- **Heuristics**:
    - **Metric Placeholders**: If a metric is missing, the AI inserts "X" and sets `Needs_Review_Flag: true`.
    - **STAR Mapping**: Narrative text is automatically mapped into Situation, Task, Action, and Result.
    - **Subtype Tagging**: Contextual analysis of community sector subtypes (e.g., "Youth Work", "Mental Health").

## Data Schema (Summary)
The `CareerDatabase` interface is the single source of truth:
- `Personal_Information`: Basic contact and portfolio data.
- `Career_Profile`: High-level summary points and target titles.
- `Master_Skills_Inventory`: Categorized list of technical and soft skills.
- `Career_Entries`: The "Where/When/What" (Work, Education, Projects).
- `Structured_Achievements`: The "How well" (linked to Career Entries).
- `KSC_Responses`: Behavioral examples mapped to the STAR method.

## Styling & Theming
- **Theme**: Dark-mode primary (`bg-gray-900`) with high-contrast accent colors (`text-cyan-400`).
- **Visual Cues**: 
    - `Amber` borders and `ExclamationTriangle` icons for data requiring validation.
    - `Cyan` for primary actions and successfully processed items.
- **Responsiveness**: Grid layouts (`grid-cols-1 md:grid-cols-2`) ensure the validator is usable on tablets and desktops where heavy data entry occurs.
