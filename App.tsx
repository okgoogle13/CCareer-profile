
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, CareerDatabase, JobOpportunity } from './types';
import { Header } from './components/Header';
import { DocumentInput } from './components/DocumentInput';
import { processCareerDocuments } from './services/geminiService';
import { ValidationDashboard } from './components/ValidationDashboard';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { auth, signIn, logout, getUserCareerData } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from './components/UserProfile';
import { JobOpportunityExtractor } from './components/JobOpportunityExtractor';
import { JobOpportunityView } from './components/JobOpportunityView';
import { MatchDashboard } from './components/MatchDashboard';

// Helper to convert files to the generative part format
const filesToGenerativeParts = async (files: File[]) => {
    const generativeParts = [];
    for (const file of files) {
        const base64EncodedData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
        generativeParts.push({
            inlineData: {
                data: base64EncodedData,
                mimeType: file.type,
            },
        });
    }
    return generativeParts;
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<CareerDatabase | null>(null);
  const [extractedJob, setExtractedJob] = useState<JobOpportunity | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'job' | 'match'>('database');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
      
      if (firebaseUser) {
        // Automatically try to load existing data for this user
        const existingData = await getUserCareerData(firebaseUser.uid);
        if (existingData) {
            setProcessedData(existingData);
            setAppState(AppState.VALIDATING);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
        await signIn();
    } catch (err) {
        console.error("Login failed", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    resetState();
  };

  const handleProcess = useCallback(async (files: File[]) => {
    setAppState(AppState.PROCESSING);
    setError(null);
    try {
      const fileParts = await filesToGenerativeParts(files);
      const data = await processCareerDocuments(fileParts);
      setProcessedData(data);
      setAppState(AppState.VALIDATING);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleUpdateData = useCallback((newData: CareerDatabase) => {
    setProcessedData(newData);
  }, []);

  const resetState = () => {
    setAppState(AppState.IDLE);
    setError(null);
    setProcessedData(null);
    setShowProfile(false);
    setExtractedJob(null);
    setActiveTab('database');
  };

  if (isAuthLoading) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onProfileClick={() => setShowProfile(true)}
      />
      
      {showProfile && user && (
        <UserProfile 
          user={user} 
          data={processedData} 
          onClose={() => setShowProfile(false)} 
        />
      )}

      {processedData && (
        <div className="bg-gray-800 border-b border-gray-700 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <button
              onClick={() => setActiveTab('database')}
              className={`py-4 px-2 font-bold border-b-2 transition-colors ${
                activeTab === 'database' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              1. Career Database
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`py-4 px-2 font-bold border-b-2 transition-colors ${
                activeTab === 'job' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              2. Extract Job Opportunity
            </button>
            <button
              onClick={() => {
                if (processedData && extractedJob) setActiveTab('match');
              }}
              className={`py-4 px-2 font-bold border-b-2 transition-colors ${
                activeTab === 'match' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'
              } ${(!processedData || !extractedJob) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!processedData || !extractedJob}
            >
              3. Match & Tailor
            </button>
          </div>
        </div>
      )}

      <main className="pb-20 pt-8">
        {activeTab === 'database' && (
          <>
            {!processedData && appState === AppState.IDLE && (
              <div className="max-w-4xl mx-auto pt-12 text-center px-4 animate-fade-in">
                  <h2 className="text-4xl font-extrabold text-white mb-4">Build Your Master Career Database</h2>
                  <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                    Upload your resumes, project docs, and criteria responses. We'll merge them into a high-fidelity JSON structure synced to your profile.
                  </p>
                  <DocumentInput onProcess={handleProcess} isLoading={false} />
              </div>
            )}

            {appState === AppState.PROCESSING && (
              <div className="flex flex-col items-center justify-center p-8 text-center pt-24">
                <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-2xl font-semibold text-white">Analyzing Your Career...</h2>
                <p className="text-gray-400 mt-2 max-w-2xl">
                  The AI is now using advanced reasoning to de-duplicate, merge, and structure your career history.
                </p>
              </div>
            )}

            {appState === AppState.ERROR && (
              <div className="my-8 mx-auto max-w-3xl p-4">
                  <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                      <strong className="font-bold flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5"/>Processing Error</strong>
                      <span className="block sm:inline mt-2 sm:mt-0">{error}</span>
                      <div className="mt-4">
                        <button
                            onClick={resetState}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-500"
                        >
                            Start Over
                        </button>
                      </div>
                  </div>
              </div>
            )}

            {processedData && (
              <ValidationDashboard 
                data={processedData} 
                onUpdate={handleUpdateData} 
                userId={user?.uid}
              />
            )}
          </>
        )}

        {activeTab === 'job' && (
          <div className="px-4">
            {!extractedJob ? (
              <JobOpportunityExtractor onExtracted={setExtractedJob} careerData={processedData} />
            ) : (
              <JobOpportunityView job={extractedJob} onReset={() => setExtractedJob(null)} onAnalyzeFit={() => setActiveTab('match')} />
            )}
          </div>
        )}

        {activeTab === 'match' && processedData && extractedJob && (
          <div className="px-4">
            <MatchDashboard careerData={processedData} job={extractedJob} />
          </div>
        )}
      </main>
      
      <footer className="text-center p-4 border-t border-gray-800 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Career Database Pre-processor. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
