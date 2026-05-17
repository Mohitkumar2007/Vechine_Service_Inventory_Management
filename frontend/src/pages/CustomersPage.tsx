import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { MOCK_CUSTOMERS } from '../data/mock';
import { formatDate } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/ui/Modal';

export function CustomersPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', address: '' });
  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    const haystack = `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [customers, query]);

  const loadCustomers = async () => {
    if (!user) return;
    try {
      const rows = await apiRequest<any[]>('/customers/', { role: user.role });
      setCustomers(rows.map((row) => ({
        id: String(row.customer_id),
        name: row.name,
        phone: row.phone,
        email: row.email || '',
        address: row.address || '',
        registeredAt: row.created_at,
      })));
    } catch {
      notify('Using local customer data because MySQL API is unavailable');
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user?.role]);

  const registerCustomer = () => {
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      notify('Customer name and phone are required');
      return;
    }
    apiRequest('/customers/', {
      method: 'POST',
      role: user?.role,
      body: JSON.stringify({
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email || null,
        address: customerForm.address,
      }),
    }).then(() => {
      notify('Customer registered in MySQL');
      setCustomerForm({ name: '', phone: '', email: '', address: '' });
      setIsModalOpen(false);
      loadCustomers();
    }).catch((error) => notify(error instanceof Error ? error.message : 'Could not save customer'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Customer Network</h2>
          <p className="text-slate-400">Database of registered vehicle owners and their service histories.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
          <Plus size={16} className="mr-2" /> Register Customer
        </Button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers by name, phone, or email..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => notify('Showing active customers only')}>
          <Filter size={18} /> Filters
        </Button>
      </div>

      <Card className="border-slate-800 bg-slate-950/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Details</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-orange-500 font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white leading-tight">{customer.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{customer.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Phone size={12} className="text-slate-500" /> {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Mail size={12} className="text-slate-500" /> {customer.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={12} /> {customer.address}
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-xs uppercase tracking-wider">
                  {formatDate(customer.registeredAt)}
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => notify(`${customer.name} actions opened`)}>
                    <MoreVertical size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t border-slate-900 flex justify-between items-center text-xs text-slate-500">
          <p>Showing {filteredCustomers.length} of {customers.length} customers</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => notify('Next page loaded')}>Next</Button>
          </div>
        </div>
      </Card>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Customer" description="Create a customer record in MySQL.">
        <form onSubmit={(event) => { event.preventDefault(); registerCustomer(); }} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} placeholder="Customer name" />
          <Input value={customerForm.phone} onChange={(event) => setCustomerForm((form) => ({ ...form, phone: event.target.value }))} placeholder="Phone number" />
          <Input value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} placeholder="Email" />
          <Input value={customerForm.address} onChange={(event) => setCustomerForm((form) => ({ ...form, address: event.target.value }))} placeholder="Address" />
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
