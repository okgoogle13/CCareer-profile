import React from 'react';
import { FileText, Briefcase, ClipboardList, LogOut, Database } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'database', label: 'Career Database', icon: Database },
    { id: 'job', label: 'Extract Job', icon: Briefcase },
    { id: 'match', label: 'Match & Tailor', icon: ClipboardList },
    { id: 'past', label: 'Past Applications', icon: FileText },
  ];

  return (
    <div className="w-72 bg-[var(--sys-color-charcoalBackground-steps-1)] border-r-2 border-[var(--sys-color-concreteGrey-steps-0)] h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b-2 border-[var(--sys-color-concreteGrey-steps-0)]">
        <h1 className="text-2xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter">
          Career<span className="text-[var(--sys-color-solidarityRed-base)]">Copilot</span>
        </h1>
      </div>
      <nav className="flex-1 p-6 space-y-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 transition-all border-2 ${
                isActive 
                  ? 'bg-[var(--sys-color-solidarityRed-base)] border-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)]' 
                  : 'bg-transparent border-transparent text-[var(--sys-color-worker-ash-base)] hover:border-[var(--sys-color-concreteGrey-steps-0)] hover:bg-[var(--sys-color-charcoalBackground-steps-2)]'
              }`}
              style={{ borderRadius: isActive ? 'var(--sys-shape-blockRiot01)' : 'var(--sys-shape-radius-none)' }}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t-2 border-[var(--sys-color-concreteGrey-steps-0)]">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-4 p-4 text-[var(--sys-color-worker-ash-base)] hover:text-[var(--sys-color-solidarityRed-base)] transition-colors font-bold uppercase tracking-wider text-sm"
        >
          <LogOut className="w-6 h-6" />
          Logout
        </button>
      </div>
    </div>
  );
};
