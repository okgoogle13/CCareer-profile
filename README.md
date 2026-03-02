# CareerCopilot Chrome Extension

This project is a Chrome Extension that helps you tailor your resume and cover letter to job descriptions using AI.

## Installation

1.  **Build the extension:**
    Run `npm run build` to generate the `dist` folder.

2.  **Load in Chrome:**
    -   Open Chrome and navigate to `chrome://extensions/`.
    -   Enable "Developer mode" in the top right corner.
    -   Click "Load unpacked".
    -   Select the `dist` folder in this project directory.

## Configuration

### Supabase Authentication & Database
To use the authentication and database features, you must configure Supabase for your extension:

1.  Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2.  Create a project or select your existing one.
3.  Copy the configuration values (Project URL and anon key) into a `.env` file in the root directory:
    ```env
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    ```
4.  **Important:** In Supabase Authentication settings, add your extension ID to the "Redirect URLs" list.
    -   After loading the extension in Chrome, copy the ID (e.g., `abcdefghijklmnop...`).
    -   Go to Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs.
    -   Add `chrome-extension://<your-extension-id>/*`.
    -   Ensure Google is enabled as an OAuth provider in Supabase.

### Gemini API
Ensure you have a valid Gemini API key in your `.env` file as `GEMINI_API_KEY`.

## Usage

1.  Click the extension icon in the Chrome toolbar.
2.  Sign in with Google.
3.  Upload your career documents (Resume, Project Docs, etc.) in the "Career Database" tab.
4.  Navigate to a job posting page (e.g., LinkedIn, Indeed).
5.  Go to the "Extract Job Opportunity" tab and click "Extract from Page".
6.  Go to the "Match & Tailor" tab to generate tailored content.
