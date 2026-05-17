import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Clock, User, Car } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../lib/utils';
import { notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface MechanicJob {
  id: string;
  customer: string;
  vehicle: string;
  registrationNo: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  estimatedCost: number;
  scheduledAt: string;
  parts: unknown[];
}

export function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MechanicJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadJobs = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rows = await apiRequest<any[]>('/service-bookings/', { role: user.role });
      setJobs(rows.map((row) => ({
        id: String(row.booking_id),
        customer: row.customer_name,
        vehicle: `${row.make} ${row.model}`.trim(),
        registrationNo: row.registration_no,
        status: row.status,
        description: row.service_type || row.complaint,
        estimatedCost: Number(row.estimated_cost || 0),
        scheduledAt: row.scheduled_at,
        parts: [],
      })));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load Oracle jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [user?.role]);

  const stats = useMemo(() => {
    const pending = jobs.filter((job) => job.status === 'PENDING' || job.status === 'ASSIGNED').length;
    const inRepair = jobs.filter((job) => job.status === 'IN_PROGRESS').length;
    const completed = jobs.filter((job) => job.status === 'COMPLETED').length;
    return [
      { label: 'Pending', count: String(pending), color: 'bg-amber-500' },
      { label: 'Assigned', count: String(jobs.filter((job) => job.status === 'ASSIGNED').length), color: 'bg-blue-500' },
      { label: 'In Repair', count: String(inRepair), color: 'bg-orange-500' },
      { label: 'Completed', count: String(completed), color: 'bg-emerald-500' },
    ];
  }, [jobs]);

  const createJob = () => {
    notify('Create jobs from Reception > Appointments so they are stored in the database');
  };

  const updateStatus = async (id: string, status: MechanicJob['status']) => {
    if (!user) return;
    try {
      await apiRequest(`/service-bookings/${id}/status/`, {
        method: 'PATCH',
        role: user.role,
        body: JSON.stringify({ status }),
      });
      setJobs((current) => current.map((job) => job.id === id ? { ...job, status } : job));
      notify(`Job ${id} marked ${status}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not update Oracle job status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Assigned Service Jobs</h2>
          <p className="text-slate-400">Technical workflow and active repair management.</p>
        </div>
        <Button onClick={createJob} className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
          <Plus size={16} className="mr-2" /> Create Job
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-2xl font-black text-white">{stat.count}</h4>
              </div>
              <div className={`w-2 h-10 rounded-full ${stat.color} opacity-20`}></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading && (
          <Card className="border-slate-800 bg-slate-950/40">
            <CardContent className="p-8 text-center text-slate-500">Loading Oracle service jobs...</CardContent>
          </Card>
        )}
        {!isLoading && jobs.length === 0 && (
          <Card className="border-slate-800 bg-slate-950/40">
            <CardContent className="p-8 text-center text-slate-500">No service jobs found in Oracle.</CardContent>
          </Card>
        )}
        {jobs.map((job) => (
          <Card key={job.id} className="border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-900/20">
                  <Badge variant={job.status === 'IN_PROGRESS' ? 'info' : 'warning'} className="mb-4">
                    {job.status}
                  </Badge>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} /> Scheduled {formatDate(job.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User size={14} /> Mechanic: John M.
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{job.description}</h3>
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-mono uppercase tracking-[0.1em]">
                        <span className="flex items-center gap-1"><Car size={14} /> {job.vehicle} [{job.registrationNo}]</span>
                        <span>&bull;</span>
                        <span>Customer: {job.customer}</span>
                        <span>&bull;</span>
                        <span>Job ID: {job.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Cost</p>
                      <p className="text-xl font-black text-white">{formatCurrency(job.estimatedCost)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-slate-900">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-9 px-4" onClick={() => notify(`${job.parts.length} parts used on ${job.id}`)}>View Parts</Button>
                      <Button variant="outline" size="sm" className="h-9 px-4" onClick={() => notify(`Diagnostics report opened for ${job.id}`)}>Diagnostics</Button>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="secondary" size="sm" className="h-9 px-6 font-bold flex-1 md:flex-initial" onClick={() => updateStatus(job.id, 'IN_PROGRESS')}>Update Status</Button>
                      <Button size="sm" className="h-9 px-6 font-bold flex-1 md:flex-initial" onClick={() => updateStatus(job.id, 'COMPLETED')}>Complete Job</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
