import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Car, Wrench, CreditCard, 
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertCircle, Package, Calendar, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { MOCK_JOBS, MOCK_INVOICES } from '../data/mock';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { downloadText, notify } from '../lib/actions';

const data = [
  { name: 'Mon', revenue: 4000, services: 24 },
  { name: 'Tue', revenue: 3000, services: 18 },
  { name: 'Wed', revenue: 2000, services: 12 },
  { name: 'Thu', revenue: 2780, services: 20 },
  { name: 'Fri', revenue: 1890, services: 15 },
  { name: 'Sat', revenue: 2390, services: 22 },
  { name: 'Sun', revenue: 3490, services: 26 },
];

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Executive Control</h2>
        <p className="text-slate-400">Real-time overview of your service network performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$84,250', icon: CreditCard, trend: '+12.5%', color: 'text-emerald-500' },
          { label: 'Active Services', value: '42', icon: Wrench, trend: '+5.2%', color: 'text-orange-500' },
          { label: 'Total Customers', value: '1,280', icon: Users, trend: '+2.4%', color: 'text-blue-500' },
          { label: 'Inventory Value', value: '$12,400', icon: Package, trend: '-1.2%', color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-slate-800/50 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-slate-950", stat.color)}>
                    <stat.icon size={20} />
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded bg-slate-950", 
                    stat.trend.startsWith('+') ? "text-emerald-500" : "text-red-500"
                  )}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className="text-2xl font-black text-white tracking-tight">{stat.value}</h4>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>Daily financial intake across all centers.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle>Service Efficiency</CardTitle>
            <CardDescription>Average job completion time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="services" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReceptionDashboard = () => (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-white tracking-tight">Reception Terminal</h2>
          <p className="text-slate-400">Managing customer intake and service scheduling.</p>
        </div>
        <Button onClick={() => navigate('/appointments')} className="w-full sm:w-auto font-bold uppercase tracking-widest text-[10px] h-10 px-8">
          New Booking
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-orange-500 border-none shadow-xl shadow-orange-500/20">
          <CardContent className="p-6">
            <h4 className="text-orange-100/80 uppercase text-[10px] font-black tracking-[0.2em] mb-4">Today's Appointments</h4>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-white leading-none">12</span>
              <Calendar className="text-white opacity-20" size={48} />
            </div>
            <div className="mt-4 flex gap-2">
              <Badge className="bg-white/20 text-white border-none">8 Checked-in</Badge>
              <Badge className="bg-white/10 text-white border-none">4 Pending</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h4 className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-4">Active Customers</h4>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-white leading-none">1,280</span>
              <Users className="text-slate-700" size={48} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <h4 className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-4">Vehicles in Bay</h4>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-white leading-none">24</span>
              <Car className="text-slate-700" size={48} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-950/40 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-6">
          <div>
            <CardTitle>Upcoming Schedules</CardTitle>
            <CardDescription>Next appointments for today.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>View Calendar</Button>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_JOBS.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium text-white">Alice Smith</TableCell>
                <TableCell className="text-slate-400 font-mono text-xs uppercase tracking-wider">Toyota Camry [ABC-1234]</TableCell>
                <TableCell className="text-slate-300">{job.description}</TableCell>
                <TableCell className="text-slate-400 font-mono text-xs uppercase tracking-wider">10:00 AM</TableCell>
                <TableCell>
                  <Badge variant={job.status === 'IN_PROGRESS' ? 'info' : 'warning'}>
                    {job.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderMechanicDashboard = () => (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Mechanic Station</h2>
        <p className="text-slate-400">Your assigned repair jobs and technical diagnostics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-orange-500/30 bg-orange-500/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30">
                <Wrench className="text-white" size={24} />
              </div>
              <Badge variant="info">Priority</Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ongoing Repair</h3>
            <p className="text-sm text-slate-400 mb-6">Oil change and brake inspection for Toyota Camry</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-3/4 animate-pulse"></div>
              </div>
              <span className="text-xs font-bold text-orange-500">75%</span>
            </div>
            <Button className="w-full" onClick={() => navigate('/jobs')}>Update Progress</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40 flex flex-col justify-center items-center text-center p-8">
          <Clock className="text-slate-700 mb-4" size={48} />
          <h4 className="text-lg font-bold text-white">Pending Assignments</h4>
          <p className="text-sm text-slate-500 mt-2">You have 4 tasks in queue.</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/jobs')}>View Queue</Button>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40 flex flex-col justify-center items-center text-center p-8">
          <CheckCircle2 className="text-emerald-500/50 mb-4" size={48} />
          <h4 className="text-lg font-bold text-white">Jobs Completed</h4>
          <p className="text-sm text-slate-500 mt-2">8 jobs finished this week.</p>
          <Button variant="ghost" className="mt-6 text-emerald-500" onClick={() => navigate('/jobs')}>View Jobs</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle>Inventory Quick-Access</CardTitle>
            <CardDescription>Required parts for your current list.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Oil Filter OF-100', stock: 12, status: 'In Stock' },
                { name: 'Front Brake Pads B-22', stock: 2, status: 'Low Stock' },
                { name: 'Synthentic Oil 5W-30', stock: 0, status: 'Ordered' },
              ].map((part, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex gap-4 items-center">
                    <Package className="text-slate-600" size={20} />
                    <div>
                      <p className="font-bold text-sm text-white">{part.name}</p>
                      <p className="text-xs text-slate-500">Available: {part.stock}</p>
                    </div>
                  </div>
                  <Badge variant={part.status === 'In Stock' ? 'success' : part.status === 'Low Stock' ? 'warning' : 'danger'}>
                    {part.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle>Technical Manuals</CardTitle>
            <CardDescription>Recently accessed service guides.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {['Toyota Camry 2022 Guide', 'Honda Civic Hybrid PDF', 'Brake Calibration v2', 'Diagnostic Codes L-3'].map((manual, i) => (
                <div key={i} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-blue-500/50 transition-colors">
                  <FileText className="text-blue-500" size={18} />
                  <span className="text-xs font-bold text-slate-300">{manual}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBillingDashboard = () => (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Finance Terminal</h2>
        <p className="text-slate-400">Payment processing and invoice lifecycle management.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Unpaid Invoices', value: '8', icon: FileText, color: 'text-red-500' },
          { label: 'Today Total', value: '$2,450', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Pending Payouts', value: '$1,200', icon: Clock, color: 'text-amber-500' },
          { label: 'Growth', value: '+4.2%', icon: ArrowUpRight, color: 'text-blue-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={16} className={stat.color} />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
              </div>
              <h4 className="text-2xl font-black text-white">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-800 bg-slate-950/40">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-6">
          <CardTitle>Recent Invoices</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadText('billing-summary.csv', 'invoice,customer,amount,status\ninv1,Alice Smith,165.50,PAID')}>Export CSV</Button>
            <Button size="sm" onClick={() => navigate('/billing')}>Generate Bill</Button>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs font-bold text-orange-500 uppercase">{inv.id}</TableCell>
                <TableCell className="font-medium text-white">Alice Smith</TableCell>
                <TableCell className="font-mono font-bold text-white">{formatCurrency(inv.amount)}</TableCell>
                <TableCell className="text-slate-400 text-xs font-mono">{formatDate(inv.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'PAID' ? 'success' : 'danger'}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => notify(`Invoice ${inv.id} preview opened`)}>View PDF</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      {user.role === 'ADMIN' && renderAdminDashboard()}
      {user.role === 'RECEPTION' && renderReceptionDashboard()}
      {user.role === 'MECHANIC' && renderMechanicDashboard()}
      {user.role === 'BILLING' && renderBillingDashboard()}
    </div>
  );
}
