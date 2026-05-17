import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNav, Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

export function Layout() {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "min-h-screen selection:bg-orange-500/30 transition-colors duration-300",
      theme === 'dark' ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950"
    )}>
      <Sidebar />
      <Navbar />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-3 pb-24 sm:p-4 sm:pb-24 md:p-8 lg:pb-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
