# CareerCopilot

CareerCopilot is a powerful, AI-driven career management and application tailoring platform. 

**First and foremost, this is a React web application** designed for optimal usage on **desktop screens or large laptop screens** using modern browsers like **Google Chrome** or **Comet**.

While it may contain extension-like capabilities for page extraction, its primary home is a full-screen, immersive web experience built with React, TypeScript, and Vite.

## Architecture & Tech Stack

The application follows modern norms and best practices for a decoupled frontend/backend architecture:

### Frontend (Client)
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite for lightning-fast HMR and optimized production builds
- **Routing:** Standard SPA routing (e.g., `react-router-dom`) to manage distinct views (Workspace, Master Profile, Past Applications, Component Library) cleanly and predictably.
- **Styling:** Tailwind CSS with a custom "protest street art" design system, utilizing CSS variables for dynamic theming and `motion/react` for fluid, spring-physics animations.

### Backend (API & AI)
- **AI Orchestration:** **Python Genkit** backend. The backend is responsible for securely handling complex LLM reasoning, document parsing, and criteria extraction flows using Google's Genkit framework for Python.
- **Database & Auth:** Firebase (Firestore & Firebase Auth) for secure, real-time user data synchronization and identity management.

## Getting Started (Frontend Development)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory with your Firebase and API configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Note: In a production environment with a Python Genkit backend, 
   # sensitive API keys (like GEMINI_API_KEY) should remain securely on the server.
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open the provided local URL in Chrome or Comet on a desktop display.

## Routing Best Practices

The frontend routing is structured to reflect standard React SPA patterns, separating concerns into distinct pages:
- `/` or `/workspace` - The main application workspace for tailoring active job applications.
- `/profile` - The master profile editor for managing base resumes and career history.
- `/history` - The archive of past applications and generated cover letters.
- `/components` - The living design system and component library.

*(Note: If running in extension mode, routing may adapt to memory-based or hash-based routing to accommodate Chrome Extension environment constraints, but browser-based usage relies on standard History API routing).*

## Python Genkit Backend Integration

The React frontend communicates with a Python Genkit backend via RESTful APIs. The backend handles:
- **`jobParser` flow:** Ingesting raw job descriptions and extracting structured criteria.
- **`matchAnalysis` flow:** Comparing the user's master profile against the extracted job criteria to identify gaps and generate tailored cover letters.

Ensure your Python backend is running and accessible to the Vite dev server (typically via a proxy configured in `vite.config.ts`) to enable full AI functionality.
