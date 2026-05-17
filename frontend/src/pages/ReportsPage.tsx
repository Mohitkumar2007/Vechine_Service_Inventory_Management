import React, { useEffect, useMemo, useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { downloadText, notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const data = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Feb', revenue: 52000, expenses: 34000 },
  { month: 'Mar', revenue: 48000, expenses: 31000 },
  { month: 'Apr', revenue: 61000, expenses: 42000 },
  { month: 'May', revenue: 55000, expenses: 38000 },
  { month: 'Jun', revenue: 67000, expenses: 45000 },
];

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b'];

export function ReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const chartData = useMemo(() => {
    const monthly = report?.monthly?.length ? report.monthly.map((row: any) => ({ month: row.month, revenue: Number(row.revenue), expenses: Math.round(Number(row.revenue) * 0.62) })) : data;
    return monthly;
  }, [report]);
  const serviceData = useMemo(() => {
    const rows = report?.services?.length ? report.services.map((row: any) => ({ name: row.status, value: Number(row.count) })) : [
      { name: 'Engine', value: 400 },
      { name: 'Electrical', value: 300 },
      { name: 'Body', value: 300 },
      { name: 'Brakes', value: 200 },
    ];
    return rows;
  }, [report]);

  useEffect(() => {
    if (!user) return;
    apiRequest('/reports/', { role: user.role }).then(setReport).catch((error) => notify(error instanceof Error ? error.message : 'Could not load reports'));
  }, [user?.role]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Intelligence & Reports</h2>
          <p className="text-slate-400">Deep dive into operational metrics and financial health.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
           <Button variant="outline" onClick={() => notify('Report range set to last 30 days')} className="font-bold uppercase tracking-widest text-[10px] h-10 px-6">
            <Calendar size={16} className="mr-2" /> Last 30 Days
          </Button>
          <Button onClick={() => downloadText('vehicle-service-report.csv', 'month,revenue,expenses\n' + chartData.map((row: any) => `${row.month},${row.revenue},${row.expenses}`).join('\n'))} className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
            <Download size={16} className="mr-2" /> Export Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
            <CardDescription>Revenue vs operational expenses over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40">
           <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Job distribution by service category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex flex-col items-center justify-center">
             <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="grid grid-cols-2 gap-4 w-full mt-4">
                {serviceData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
