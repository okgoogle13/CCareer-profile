import React from "react";
import { SidebarNav } from "./SidebarNav";

type Props = {
  children: React.ReactNode;
  onLogout: () => void;
};

export function AppShell({ children, onLogout }: Props) {
  return (
    <div className="min-h-screen bg-[var(--sys-color-charcoalBackground-base)] flex text-[var(--sys-color-worker-ash-base)] font-sans">
      <SidebarNav onLogout={onLogout} />
      <main className="flex-1 ml-80 relative">
        {/* Grit Particle Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
