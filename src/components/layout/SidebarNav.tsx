import React from "react";
import { motion } from "motion/react";
import { Briefcase, User, History, LogOut, Library } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  onLogout: () => void;
};

export function SidebarNav({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <nav className="w-80 bg-[var(--sys-color-charcoalBackground-steps-1)] border-r-2 border-[var(--sys-color-concreteGrey-steps-0)] h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-8 border-b-2 border-[var(--sys-color-concreteGrey-steps-0)]">
        <motion.h1 
          initial={{ opacity: 0, y: -20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-4xl type-solidarityProtest text-[var(--sys-color-paperWhite-base)] uppercase tracking-tighter leading-none"
        >
          Career<br/><span className="text-[var(--sys-color-solidarityRed-base)]">Copilot</span>
        </motion.h1>
      </div>
      
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <NavItem icon={<Briefcase size={20} />} label="Workspace" active={activePath === '/workspace'} onClick={() => navigate('/workspace')} />
        <NavItem icon={<User size={20} />} label="Master Profile" active={activePath === '/profile'} onClick={() => navigate('/profile')} />
        <NavItem icon={<History size={20} />} label="Past Applications" active={activePath === '/past'} onClick={() => navigate('/past')} />
        <NavItem icon={<Library size={20} />} label="Component Library" active={activePath === '/components'} onClick={() => navigate('/components')} />
      </div>

      <div className="p-6 border-t-2 border-[var(--sys-color-concreteGrey-steps-0)]">
        <motion.button 
          onClick={onLogout} 
          whileHover={{ x: 5, color: 'var(--sys-color-solidarityRed-base)' }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center gap-3 text-left p-4 text-[var(--sys-color-worker-ash-base)] font-bold uppercase tracking-wider transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </motion.button>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 4, rotate: active ? 0 : 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`w-full flex items-center gap-3 text-left p-4 transition-colors border-2 font-bold uppercase tracking-wider text-sm ${
        active 
          ? 'bg-[var(--sys-color-solidarityRed-base)] border-[var(--sys-color-solidarityRed-base)] text-[var(--sys-color-paperWhite-base)] shadow-[var(--sys-shadow-elevation2Placard)]' 
          : 'bg-transparent border-transparent text-[var(--sys-color-worker-ash-base)] hover:border-[var(--sys-color-concreteGrey-steps-0)] hover:bg-[var(--sys-color-charcoalBackground-steps-2)]'
      }`}
      style={{ borderRadius: active ? 'var(--sys-shape-blockRiot02)' : 'var(--sys-shape-radius-none)' }}
    >
      {icon}
      {label}
    </motion.button>
  );
}
