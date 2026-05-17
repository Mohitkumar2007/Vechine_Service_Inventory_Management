import React from 'react';
import { Bell, Car, LogOut, Search, User as UserIcon, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';
import { notify } from '../../lib/actions';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <header className={cn(
      "h-16 backdrop-blur-md border-b fixed top-0 right-0 left-0 lg:left-64 z-40 flex items-center justify-between px-4 md:px-8 transition-colors duration-300",
      theme === 'dark' ? "bg-slate-950/80 border-slate-900" : "bg-white/85 border-slate-200"
    )}>
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
          <Car className="text-white" size={20} />
        </div>
        <div>
          <p className="text-sm font-black leading-none text-white">AutoVantage</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-orange-500">{user.role}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search for jobs, vehicles, or customers..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50 placeholder:text-slate-600 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 ml-auto">
        <button 
          onClick={toggleTheme}
          className={cn(
            "transition-all p-2 rounded-lg border",
            theme === 'dark'
              ? "text-amber-300 border-slate-800 hover:text-white hover:bg-slate-900"
              : "text-slate-700 border-slate-200 bg-slate-100 hover:text-slate-950 hover:bg-white"
          )}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          type="button"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button type="button" onClick={() => notify('No new notifications')} className="relative text-slate-400 hover:text-white transition-colors" title="Notifications">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-slate-950"></span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="lg:hidden rounded-lg border border-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={19} />
        </button>

        <div className="hidden md:block h-8 w-px bg-slate-800"></div>

        <div onClick={() => notify(`${user.role} profile menu opened`)} className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 group cursor-pointer">
          <div className="hidden sm:flex text-right flex-col justify-center">
            <span className="text-sm font-semibold text-white leading-none mb-1">{user.name}</span>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider leading-none">
              {user.role}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-slate-800 group-hover:border-orange-500/50 transition-all overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <UserIcon className="text-slate-500" size={20} />
              </div>
            )}
          </div>
          <ChevronDown size={14} className="hidden sm:block text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
}
