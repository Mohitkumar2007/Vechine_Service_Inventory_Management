import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Calendar, 
  Wrench, 
  FileText, 
  Package, 
  Truck, 
  Settings, 
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const menuItems: SidebarItem[] = [
  // General Dashboard
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPTION', 'MECHANIC', 'BILLING'] },
  
  // Reception Tasks
  { title: 'Appointments', href: '/appointments', icon: Calendar, roles: ['ADMIN', 'RECEPTION'] },
  { title: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'RECEPTION'] },
  { title: 'Vehicles', href: '/vehicles', icon: Car, roles: ['ADMIN', 'RECEPTION'] },
  
  // Mechanic Tasks
  { title: 'Service Jobs', href: '/jobs', icon: Wrench, roles: ['ADMIN', 'MECHANIC'] },
  
  // Billing Tasks
  { title: 'Invoices', href: '/invoices', icon: FileText, roles: ['ADMIN', 'BILLING'] },
  
  // Admin Tasks
  { title: 'Inventory', href: '/inventory', icon: Package, roles: ['ADMIN'] },
  { title: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['ADMIN'] },
  { title: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-slate-900 flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Car className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight tracking-tight">AutoVantage</h1>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Service System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
              isActive 
                ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              "group-hover:text-orange-500"
            )} />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-900">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { user } = useAuth();

  if (!user) return null;

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));
  const primaryItems = filteredItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {primaryItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold transition-colors",
              isActive ? "bg-orange-500/15 text-orange-500" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            )}
          >
            <item.icon size={18} />
            <span className="w-full truncate text-center">{item.title.replace('Service ', '')}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
