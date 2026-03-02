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

### Firebase Authentication & Database
To use the authentication and database features, you must configure Firebase for your extension:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a project or select your existing one.
3.  Copy the configuration values into a `.env` file in the root directory:
    ```env
    FIREBASE_API_KEY=your_api_key
    FIREBASE_AUTH_DOMAIN=your_auth_domain
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_STORAGE_BUCKET=your_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    FIREBASE_APP_ID=your_app_id
    GEMINI_API_KEY=your_gemini_api_key
    ```
4.  **Important:** In Firebase Authentication settings, ensure Google is enabled as a sign-in provider.
    -   You may need to add your Chrome Extension ID to the authorized domains in Firebase Authentication settings.

### Gemini API
Ensure you have a valid Gemini API key in your `.env` file as `GEMINI_API_KEY`.

## Usage

1.  Click the extension icon in the Chrome toolbar.
2.  Sign in with Google.
3.  Upload your career documents (Resume, Project Docs, etc.) in the "Career Database" tab.
4.  Navigate to a job posting page (e.g., LinkedIn, Indeed).
5.  Go to the "Extract Job Opportunity" tab and click "Extract from Page".
6.  Go to the "Match & Tailor" tab to generate tailored content.
