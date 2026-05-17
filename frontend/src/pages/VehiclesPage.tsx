import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Car as CarIcon, Gauge, Calendar, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { MOCK_VEHICLES } from '../data/mock';
import { Badge } from '../components/ui/Badge';
import { notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/ui/Modal';

export function VehiclesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ registrationNo: '', make: '', model: '', customerPhone: '', year: String(new Date().getFullYear()) });
  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => {
    const haystack = `${vehicle.licensePlate} ${vehicle.vin} ${vehicle.make} ${vehicle.model}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [vehicles, query]);

  const loadVehicles = async () => {
    if (!user) return;
    try {
      const rows = await apiRequest<any[]>('/vehicles/', { role: user.role });
      setVehicles(rows.map((row) => ({
        id: String(row.vehicle_id),
        customerId: String(row.customer_id),
        make: row.make,
        model: row.model,
        year: Number(row.vehicle_year || new Date().getFullYear()),
        vin: row.vin || '',
        licensePlate: row.registration_no,
      })));
    } catch {
      notify('Using local vehicle data because MySQL API is unavailable');
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [user?.role]);

  const addVehicle = () => {
    if (!vehicleForm.registrationNo.trim() || !vehicleForm.make.trim() || !vehicleForm.model.trim() || !vehicleForm.customerPhone.trim()) {
      notify('Registration, make, model, and customer phone are required');
      return;
    }
    apiRequest('/vehicles/', {
      method: 'POST',
      role: user?.role,
      body: JSON.stringify({
        customer_phone: vehicleForm.customerPhone,
        registration_no: vehicleForm.registrationNo,
        make: vehicleForm.make,
        model: vehicleForm.model,
        vehicle_year: Number(vehicleForm.year || new Date().getFullYear()),
      }),
    }).then(() => {
      notify('Vehicle saved in MySQL');
      setVehicleForm({ registrationNo: '', make: '', model: '', customerPhone: '', year: String(new Date().getFullYear()) });
      setIsModalOpen(false);
      loadVehicles();
    }).catch((error) => notify(error instanceof Error ? error.message : 'Could not save vehicle'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Fleet Asset Registry</h2>
          <p className="text-slate-400">Inventory of all vehicles serviced within the network.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
          <Plus size={16} className="mr-2" /> Add Vehicle
        </Button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by License Plate, VIN, or Model..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all overflow-hidden group">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                <CarIcon size={80} className="text-slate-800 absolute -bottom-4 -right-4 transform rotate-12 group-hover:scale-110 transition-transform" />
                <div className="z-10 text-center">
                  <div className="bg-white px-3 py-1 rounded text-slate-950 font-black text-sm mb-2 shadow-lg border-2 border-slate-950 uppercase tracking-tighter">
                    {vehicle.licensePlate}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Plate ID</p>
                </div>
              </div>
              <CardContent className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-xs text-orange-500 font-bold uppercase tracking-[0.2em]">{vehicle.year} Model</p>
                  </div>
                  <Badge variant="info">In System</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-slate-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">VIN</p>
                      <p className="text-xs text-slate-300 font-mono uppercase">{vehicle.vin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge size={16} className="text-slate-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Odometer Reading</p>
                      <p className="text-xs text-slate-300 font-mono uppercase">12,450 km</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 rounded-sm" onClick={() => notify(`Service history loaded for ${vehicle.licensePlate}`)}>Service History</Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-sm" onClick={() => notify(`Diagnostics opened for ${vehicle.licensePlate}`)}>Diagnostics</Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vehicle" description="Register a vehicle against a customer phone number.">
        <form onSubmit={(event) => { event.preventDefault(); addVehicle(); }} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input value={vehicleForm.registrationNo} onChange={(event) => setVehicleForm((form) => ({ ...form, registrationNo: event.target.value.toUpperCase() }))} placeholder="Registration no." />
          <Input value={vehicleForm.customerPhone} onChange={(event) => setVehicleForm((form) => ({ ...form, customerPhone: event.target.value }))} placeholder="Customer phone" />
          <Input value={vehicleForm.make} onChange={(event) => setVehicleForm((form) => ({ ...form, make: event.target.value }))} placeholder="Make" />
          <Input value={vehicleForm.model} onChange={(event) => setVehicleForm((form) => ({ ...form, model: event.target.value }))} placeholder="Model" />
          <Input value={vehicleForm.year} onChange={(event) => setVehicleForm((form) => ({ ...form, year: event.target.value }))} placeholder="Year" />
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Vehicle</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
