import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Truck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/ui/Modal';

interface Supplier { id: string; name: string; contact: string; phone: string; email: string; category: string; }

export function SuppliersPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', contact: '', phone: '', email: '', category: 'General parts' });
  const visibleSuppliers = useMemo(() => suppliers.filter((supplier) => `${supplier.name} ${supplier.category}`.toLowerCase().includes(query.toLowerCase())), [suppliers, query]);

  const loadSuppliers = async () => {
    if (!user) return;
    try {
      const rows = await apiRequest<any[]>('/suppliers/', { role: user.role });
      setSuppliers(rows.map((row) => ({
        id: String(row.supplier_id),
        name: row.supplier_name,
        contact: row.contact_person || '',
        phone: row.phone || '',
        email: row.email || '',
        category: row.address || 'General parts',
      })));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load suppliers');
    }
  };

  useEffect(() => { loadSuppliers(); }, [user?.role]);

  const addSupplier = () => {
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) {
      notify('Supplier name and phone are required');
      return;
    }
    apiRequest('/suppliers/', {
      method: 'POST',
      role: user?.role,
      body: JSON.stringify({
        supplier_name: supplierForm.name,
        contact_person: supplierForm.contact,
        phone: supplierForm.phone,
        email: supplierForm.email,
        address: supplierForm.category,
      }),
    }).then(() => {
      notify('Supplier added to MySQL');
      setSupplierForm({ name: '', contact: '', phone: '', email: '', category: 'General parts' });
      setIsModalOpen(false);
      loadSuppliers();
    }).catch((error) => notify(error instanceof Error ? error.message : 'Could not add supplier'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Supplier Portfolio</h2>
          <p className="text-slate-400">Management of primary part vendors and procurement chains.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
          <Plus size={16} className="mr-2" /> Add Supplier
        </Button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search suppliers by name or category..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleSuppliers.map((supplier) => (
          <Card key={supplier.id} className="border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-900 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors">
                  <Truck size={24} />
                </div>
                <Badge variant="info">Partner</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{supplier.name}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em] mb-6">{supplier.category}</p>
              
              <div className="space-y-3 pt-6 border-t border-slate-900">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Primary Contact</span>
                  <span className="text-slate-300 font-medium">{supplier.contact}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <span className="text-slate-500">Email</span>
                  <span className="text-slate-300 font-medium">{supplier.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <span className="text-slate-500">Active Orders</span>
                  <Badge variant="success">12</Badge>
                </div>
              </div>
              
              <div className="mt-8 pt-6 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => notify(`Order history opened for ${supplier.name}`)}>Order History</Button>
                <Button size="sm" className="flex-1" onClick={() => notify(`New order created for ${supplier.name}`)}><Plus size={14} className="mr-1" /> New Order</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Supplier" description="Create a supplier record in MySQL.">
        <form onSubmit={(event) => { event.preventDefault(); addSupplier(); }} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input value={supplierForm.name} onChange={(event) => setSupplierForm((form) => ({ ...form, name: event.target.value }))} placeholder="Supplier name" />
          <Input value={supplierForm.contact} onChange={(event) => setSupplierForm((form) => ({ ...form, contact: event.target.value }))} placeholder="Contact person" />
          <Input value={supplierForm.phone} onChange={(event) => setSupplierForm((form) => ({ ...form, phone: event.target.value }))} placeholder="Phone" />
          <Input value={supplierForm.email} onChange={(event) => setSupplierForm((form) => ({ ...form, email: event.target.value }))} placeholder="Email" />
          <Input value={supplierForm.category} onChange={(event) => setSupplierForm((form) => ({ ...form, category: event.target.value }))} placeholder="Parts category" />
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Supplier</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
