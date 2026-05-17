import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Car, User, Wrench, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import toast from 'react-hot-toast';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface BookingDraft {
  customer: string;
  phone: string;
  vehicle: string;
  registrationNo: string;
  serviceType: string;
  preferredSlot: string;
}

interface ScheduledBooking extends BookingDraft {
  id: string;
  status: string;
}

const emptyDraft: BookingDraft = {
  customer: '',
  phone: '',
  vehicle: '',
  registrationNo: '',
  serviceType: '',
  preferredSlot: '',
};

const DRAFT_KEY = 'autovantage_booking_draft';
function formatSlot(value: string) {
  if (!value) return 'Not selected';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ServiceBookingPage() {
  const { user } = useAuth();
  const slotInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<BookingDraft>(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    return savedDraft ? { ...emptyDraft, ...JSON.parse(savedDraft) } : emptyDraft;
  });
  const [bookings, setBookings] = useState<ScheduledBooking[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const loadBookings = async () => {
    if (!user) return;
    setIsLoadingBookings(true);
    try {
      const rows = await apiRequest<any[]>('/service-bookings/', { role: user.role });
      setBookings(rows.map((row) => ({
        id: String(row.booking_id),
        customer: row.customer_name,
        phone: row.phone,
        vehicle: `${row.make} ${row.model}`.trim(),
        registrationNo: row.registration_no,
        serviceType: row.service_type,
        preferredSlot: row.scheduled_at,
        status: row.status,
      })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load appointments');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.role]);

  const bookingRows = useMemo(() => {
    return bookings;
  }, [bookings]);

  const updateDraft = (field: keyof BookingDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const scheduleService = async (event: React.FormEvent) => {
    event.preventDefault();
    const requiredFields: (keyof BookingDraft)[] = ['customer', 'phone', 'vehicle', 'registrationNo', 'serviceType', 'preferredSlot'];
    const missingField = requiredFields.find((field) => !draft[field].trim());

    if (missingField) {
      toast.error('Fill all booking details including preferred slot');
      return;
    }

    if (!user) return;

    setIsSaving(true);
    try {
      await apiRequest('/service-bookings/', {
        method: 'POST',
        role: user.role,
        body: JSON.stringify({
          customer: draft.customer,
          phone: draft.phone,
          vehicle: draft.vehicle,
          registration_no: draft.registrationNo,
          service_type: draft.serviceType,
          scheduled_at: draft.preferredSlot,
          complaint: draft.serviceType,
          estimated_cost: 0,
        }),
      });
      await loadBookings();
      setDraft((current) => ({
        ...emptyDraft,
        preferredSlot: current.preferredSlot,
      }));
      toast.success('Appointment scheduled in database');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save appointment');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setDraft((current) => ({ ...emptyDraft, preferredSlot: current.preferredSlot }));
    toast('Form cleared. Preferred slot preserved.');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Appointment Booking</h2>
          <p className="text-slate-400">Register customer visits, vehicles, and repair schedules from one reception workflow.</p>
        </div>
        <Button onClick={() => document.getElementById('booking-customer')?.focus()} className="w-full sm:w-auto gap-2 font-bold uppercase tracking-widest text-[10px]">
          <CalendarClock size={16} /> New Appointment
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6">
        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle>Appointment Form</CardTitle>
            <CardDescription>Stores customer, vehicle, and appointment records in the database.</CardDescription>
          </CardHeader>
          <form onSubmit={scheduleService} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-0">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer</span>
              <Input id="booking-customer" value={draft.customer} onChange={(event) => updateDraft('customer', event.target.value)} placeholder="Mohit Kumar" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone</span>
              <Input value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} placeholder="8088062938" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Vehicle</span>
              <Input value={draft.vehicle} onChange={(event) => updateDraft('vehicle', event.target.value)} placeholder="TOYOTA CAMRY" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Registration No.</span>
              <Input value={draft.registrationNo} onChange={(event) => updateDraft('registrationNo', event.target.value.toUpperCase())} placeholder="KA53Z3681" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Service Type</span>
              <Input value={draft.serviceType} onChange={(event) => updateDraft('serviceType', event.target.value)} placeholder="Oil Change" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Preferred Slot</span>
              <div className="flex gap-2">
                <Input
                  ref={slotInputRef}
                  type="datetime-local"
                  value={draft.preferredSlot}
                  onChange={(event) => updateDraft('preferredSlot', event.target.value)}
                  className="calendar-picker"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Open calendar"
                  aria-label="Open calendar"
                  onClick={() => slotInputRef.current?.showPicker?.()}
                >
                  <CalendarClock size={18} />
                </Button>
              </div>
              <span className="block text-xs text-slate-500">Selected: {formatSlot(draft.preferredSlot)}</span>
            </label>
            <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">Reset</Button>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">{isSaving ? 'Saving...' : 'Schedule Appointment'}</Button>
            </div>
          </form>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today's Appointments", value: '12', icon: CalendarClock, accent: 'text-orange-500' },
            { label: 'Vehicles Waiting', value: '6', icon: Car, accent: 'text-blue-500' },
            { label: 'Open Estimates', value: '9', icon: Wrench, accent: 'text-emerald-500' },
          ].map((item) => (
            <Card key={item.label} className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5">
                <item.icon className={item.accent} size={22} />
                <p className="mt-4 text-[10px] uppercase tracking-widest font-black text-slate-500">{item.label}</p>
                <p className="text-3xl font-black text-white">{item.value}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="sm:col-span-3 border-slate-800 bg-slate-950/40">
            <CardHeader>
              <CardTitle>Customer Search</CardTitle>
              <CardDescription>Find previous bills and registered vehicles.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input className="pl-10" placeholder="Search by mobile, name, vehicle number..." />
              </div>
              <Button variant="outline" className="gap-2" onClick={() => toast('Filter applied to appointment list')}><Filter size={16} /> Filter</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-950/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Complaint</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBookings && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">Loading appointments...</TableCell>
              </TableRow>
            )}
            {!isLoadingBookings && bookingRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">No appointments yet.</TableCell>
              </TableRow>
            )}
            {!isLoadingBookings && bookingRows.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="text-white font-semibold"><User size={14} className="inline mr-2 text-slate-500" />{booking.customer}</TableCell>
                <TableCell className="text-slate-300">{booking.vehicle} <span className="text-slate-500 font-mono text-xs">[{booking.registrationNo}]</span></TableCell>
                <TableCell className="text-slate-400">{booking.serviceType}</TableCell>
                <TableCell className="text-slate-400 font-mono text-xs">{formatSlot(booking.preferredSlot)}</TableCell>
                <TableCell><Badge variant="warning">{booking.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
