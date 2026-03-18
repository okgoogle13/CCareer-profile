
import React, { useState, useEffect } from 'react';
import { AppShell } from './src/components/layout/AppShell';
import { ApplicationWorkspacePage } from './src/pages/ApplicationWorkspacePage';
import { ProfileEditorPage } from './src/pages/ProfileEditorPage';
import { PastApplicationsPage } from './src/pages/PastApplicationsPage';
import { ComponentLibraryPage } from './src/pages/ComponentLibraryPage';
import { auth, signIn, logout } from './services/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useChromeExtension } from './hooks/useChromeExtension';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'profile' | 'past' | 'components'>('workspace');
  const { isExtension } = useChromeExtension();

  // Auth Listener
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    });

    // Fallback: if auth takes too long (e.g. config missing), stop loading
    timeoutId = setTimeout(() => {
      setIsAuthLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isExtension]);

  const handleLogin = async () => {
    try {
        await signIn();
    } catch (err) {
        console.error("Login failed", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('workspace');
  };

  if (isAuthLoading) {
    return (
        <div className="min-h-screen bg-[var(--sys-color-charcoalBackground-base)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[var(--sys-color-solidarityRed-base)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--sys-color-charcoalBackground-base)] flex flex-col items-center justify-center p-8">
        <h1 className="text-7xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter leading-none mb-8 text-center">
          Career<br/><span className="text-[var(--sys-color-solidarityRed-base)]">Copilot</span>
        </h1>
        <p className="text-xl type-melancholyLonging text-[var(--sys-color-worker-ash-base)] mb-12 max-w-2xl text-center">
          A living manifesto for your career. No neutral canvas. Tailor your response.
        </p>
        <button 
          onClick={handleLogin}
          className="px-8 py-4 bg-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)] font-bold uppercase tracking-widest text-xl hover:bg-[var(--sys-color-charcoalBackground-steps-1)] hover:text-[var(--sys-color-solidarityRed-base)] border-2 border-[var(--sys-color-solidarityRed-base)] transition-all"
          style={{ borderRadius: 'var(--sys-shape-blockRiot01)' }}
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'workspace' && <ApplicationWorkspacePage />}
      {activeTab === 'profile' && <ProfileEditorPage />}
      {activeTab === 'past' && <PastApplicationsPage />}
      {activeTab === 'components' && <ComponentLibraryPage />}
    </AppShell>
  );
};

export default App;
