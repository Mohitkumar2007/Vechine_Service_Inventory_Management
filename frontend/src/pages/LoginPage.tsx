import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Car, Lock, User, ShieldCheck, Wrench, CreditCard, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Navigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { DEMO_USERS } from '../data/mock';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const roles = [
    { id: 'reception', title: 'Reception', desc: 'Bookings & Registration', icon: UserCircle, password: 'reception123' },
    { id: 'mechanic', title: 'Mechanic', desc: 'Repair Jobs & Tracking', icon: Wrench, password: 'mechanic123' },
    { id: 'billing', title: 'Billing', desc: 'Invoices & Payments', icon: CreditCard, password: 'billing123' },
    { id: 'admin', title: 'Administrator', desc: 'Analytics & Management', icon: ShieldCheck, password: 'admin123' },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);
    if (!result.ok) toast.error(result.message || 'Login failed');
    if (result.ok && result.message) toast.success(result.message);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-4xl z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-3xl mb-6 shadow-2xl shadow-orange-500/40 transform rotate-12 transition-transform hover:rotate-0 duration-500">
            <Car size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">AutoVantage</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Vehicle Service Inventory Management System with one secure interface for reception, mechanics, billing, and owner/admin users.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 items-stretch">
          <Card className="border-slate-800 bg-slate-950/80 shadow-2xl">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div>
                <h2 className="text-2xl font-black text-white">Secure Login</h2>
                <p className="text-sm text-slate-500 mt-1">Use username and password to open the assigned role dashboard.</p>
              </div>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Username</span>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                  <Input value={username} onChange={(event) => setUsername(event.target.value)} className="pl-10" />
                </div>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-10" />
                </div>
              </label>
              <Button disabled={isSubmitting} className="w-full h-11 font-bold uppercase tracking-widest text-[11px]">{isSubmitting ? 'Checking...' : 'Enter Dashboard'}</Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {DEMO_USERS.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      setUsername(account.username);
                      setPassword(account.password);
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-left hover:border-orange-500/50 transition-colors"
                  >
                    <span className="block text-xs font-bold text-white">{account.username}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-orange-500">{account.role}</span>
                  </button>
                ))}
              </div>
            </form>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="group h-full cursor-pointer border-slate-800 hover:border-orange-500/50 hover:bg-slate-900 transition-all duration-300 p-1 bg-slate-950 shadow-2xl"
                onClick={() => {
                  setUsername(role.id);
                  setPassword(role.password);
                }}
              >
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-2xl mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 text-orange-500 shadow-inner">
                    <role.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-6 flex-1">
                    {role.desc}
                  </p>
                  <Button variant="outline" className="w-full h-11 border-slate-800 group-hover:border-orange-500 group-hover:text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                    Fill Credentials
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
            &copy; 2024 AUTOVANTAGE SYSTEMS &bull; SECURE TERMINAL v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
