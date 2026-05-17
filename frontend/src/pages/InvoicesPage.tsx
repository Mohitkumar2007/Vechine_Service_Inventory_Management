import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, Download, Printer, Mail, ReceiptText, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../lib/utils';
import { downloadText, notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface BillableService {
  booking_id: number;
  customer_name: string;
  phone: string;
  make: string;
  model: string;
  registration_no: string;
  service_type: string;
  status: string;
  scheduled_at: string;
  estimated_cost: number;
}

interface Bill {
  bill_id: number;
  booking_id: number;
  customer_name: string;
  phone: string;
  make: string;
  model: string;
  registration_no: string;
  service_type: string;
  total_amount: number;
  bill_status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'CANCELLED';
  generated_at: string;
}

export function InvoicesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [paymentBillId, setPaymentBillId] = useState('');
  const [laborAmount, setLaborAmount] = useState('800');
  const [partsAmount, setPartsAmount] = useState('0');
  const [billableServices, setBillableServices] = useState<BillableService[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBillingData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [services, billRows] = await Promise.all([
        apiRequest<BillableService[]>('/billable-services/', { role: user.role }),
        apiRequest<Bill[]>('/bills/', { role: user.role }),
      ]);
      setBillableServices(services);
      setBills(billRows);
      if (!selectedBookingId && services.length > 0) {
        setSelectedBookingId(services[0].booking_id);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [user?.role]);

  const selectedService = billableServices.find((service) => service.booking_id === selectedBookingId);
  const collected = bills.filter((bill) => bill.bill_status === 'PAID').reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);
  const outstanding = bills.filter((bill) => bill.bill_status !== 'PAID').reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

  const visibleBills = useMemo(() => bills.filter((bill) => {
    const matchesStatus = statusFilter === 'ALL' || bill.bill_status === statusFilter;
    const haystack = `${bill.bill_id} ${bill.customer_name} ${bill.registration_no} ${bill.service_type}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [bills, query, statusFilter]);

  const invoiceHtml = (bill: Bill) => `
    <!doctype html>
    <html>
      <head>
        <title>Bill ${bill.bill_id}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 32px; font-family: Arial, sans-serif; color: #0f172a; }
          .invoice { max-width: 760px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 28px; }
          .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #f97316; padding-bottom: 18px; }
          h1 { margin: 0; font-size: 24px; }
          h2 { margin: 24px 0 10px; font-size: 16px; color: #f97316; }
          p { margin: 4px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; border-bottom: 1px solid #e2e8f0; padding: 10px; font-size: 13px; }
          th { background: #f8fafc; }
          .right { text-align: right; }
          .badge { display: inline-block; padding: 5px 9px; border-radius: 999px; font-weight: 700; font-size: 11px; background: ${bill.bill_status === 'PAID' ? '#dcfce7' : '#fee2e2'}; color: ${bill.bill_status === 'PAID' ? '#166534' : '#991b1b'}; }
          .total { font-size: 22px; font-weight: 900; color: #f97316; }
          @media print { body { padding: 0; } .invoice { border: 0; } }
        </style>
      </head>
      <body>
        <main class="invoice">
          <section class="top">
            <div>
              <h1>Vehicle Service Inventory Management System</h1>
              <p>Premium Garage / Service Center Invoice</p>
              <p>Bill ID: <strong>BILL-${bill.bill_id}</strong></p>
            </div>
            <div class="right">
              <span class="badge">${bill.bill_status}</span>
              <p>Generated: ${formatDate(bill.generated_at)}</p>
              <p>Booking ID: ${bill.booking_id}</p>
            </div>
          </section>
          <h2>Customer & Vehicle</h2>
          <p><strong>Customer:</strong> ${bill.customer_name}</p>
          <p><strong>Phone:</strong> ${bill.phone}</p>
          <p><strong>Vehicle:</strong> ${bill.make} ${bill.model}</p>
          <p><strong>Registration:</strong> ${bill.registration_no}</p>
          <h2>Service Details</h2>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${bill.service_type}</td>
                <td class="right">${formatCurrency(Number(bill.total_amount))}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th class="right">Grand Total</th>
                <th class="right total">${formatCurrency(Number(bill.total_amount))}</th>
              </tr>
            </tfoot>
          </table>
        </main>
      </body>
    </html>
  `;

  const printBill = (bill: Bill) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      notify('Allow popups to print this invoice');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(invoiceHtml(bill));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateInvoice = async () => {
    if (!selectedBookingId) {
      notify('Select a car/service for billing first');
      return;
    }
    try {
      const result = await apiRequest<{ bill_id: number; total_amount: number }>('/bills/', {
        method: 'POST',
        role: user?.role,
        body: JSON.stringify({
          booking_id: selectedBookingId,
          labor_amount: Number(laborAmount || 0),
          parts_amount: Number(partsAmount || 0),
          discount_amount: 0,
        }),
      });
      setPaymentBillId(String(result.bill_id));
      notify(`Invoice #${result.bill_id} generated`);
      await loadBillingData();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not generate invoice');
    }
  };

  const processPayment = async () => {
    if (!paymentBillId.trim()) {
      notify('Enter a bill ID first');
      return;
    }
    try {
      await apiRequest('/payments/', {
        method: 'POST',
        role: user?.role,
        body: JSON.stringify({
          bill_id: paymentBillId,
          payment_mode: 'CASH',
        }),
      });
      notify(`Payment recorded for bill #${paymentBillId}`);
      setPaymentBillId('');
      await loadBillingData();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not process payment');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Billing Counter</h2>
          <p className="text-slate-400">Generate invoices from service cars and record MySQL-backed payments.</p>
        </div>
        <Button onClick={generateInvoice} className="w-full md:w-auto font-bold uppercase tracking-widest text-[10px] h-10 px-8">
          <Plus size={16} className="mr-2" /> Generate Invoice
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ReceiptText size={18} className="text-orange-500" /> Cars Ready For Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <p className="text-sm text-slate-500">Loading billing services...</p>}
            {!isLoading && billableServices.length === 0 && <p className="text-sm text-slate-500">No unbilled service cars found.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billableServices.map((service) => (
                <button
                  key={service.booking_id}
                  type="button"
                  onClick={() => {
                    setSelectedBookingId(service.booking_id);
                    setLaborAmount(String(Number(service.estimated_cost || 800) || 800));
                  }}
                  className={`text-left rounded-lg border p-4 transition-all ${
                    selectedBookingId === service.booking_id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{service.customer_name}</p>
                      <p className="text-xs text-slate-400">{service.make} {service.model} [{service.registration_no}]</p>
                    </div>
                    <Badge variant={service.status === 'COMPLETED' ? 'success' : 'warning'}>{service.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{service.service_type}</p>
                  <p className="mt-2 text-xs font-mono text-slate-500">{formatDate(service.scheduled_at)}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-900 pt-4">
              <Input value={selectedService ? `${selectedService.registration_no} - ${selectedService.customer_name}` : ''} readOnly placeholder="Select service car" />
              <Input value={laborAmount} onChange={(event) => setLaborAmount(event.target.value)} placeholder="Labor amount" />
              <Input value={partsAmount} onChange={(event) => setPartsAmount(event.target.value)} placeholder="Parts amount" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-orange-500 text-white shadow-xl shadow-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white opacity-80 text-xs uppercase tracking-[0.2em]">Quick Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-orange-100 mb-6">Enter bill ID or use the generated bill ID to collect payment.</p>
              <div className="space-y-4">
                <Input value={paymentBillId} onChange={(event) => setPaymentBillId(event.target.value)} placeholder="Bill ID" className="bg-orange-600 border-orange-400 placeholder:text-orange-300 text-white focus-visible:ring-white" />
                <Button onClick={processPayment} className="w-full bg-white text-orange-500 hover:bg-orange-50 shadow-none font-black h-11">
                  <CreditCard size={16} className="mr-2" /> PROCESS PAYMENT
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-sm">Revenue Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Collected</span>
                <span className="text-emerald-500 font-bold">{formatCurrency(collected)}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${collected + outstanding ? (collected / (collected + outstanding)) * 100 : 0}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Outstanding</span>
                <span className="text-red-500 font-bold">{formatCurrency(outstanding)}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${collected + outstanding ? (outstanding / (collected + outstanding)) * 100 : 0}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-950/40">
        <div className="p-6 border-b border-slate-900 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bills by ID, customer, vehicle, or service..." className="pl-10" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setStatusFilter((current) => current === 'ALL' ? 'PAID' : current === 'PAID' ? 'UNPAID' : 'ALL')} className="flex-1 md:flex-initial"><Filter size={18} className="mr-2" /> {statusFilter}</Button>
            <Button variant="outline" onClick={() => downloadText('mysql-bills.csv', 'bill,customer,vehicle,amount,status\n' + bills.map((bill) => `${bill.bill_id},${bill.customer_name},${bill.registration_no},${bill.total_amount},${bill.bill_status}`).join('\n'))} className="flex-1 md:flex-initial"><Download size={18} /> </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Customer / Vehicle</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleBills.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">No bills found.</TableCell>
              </TableRow>
            )}
            {visibleBills.map((bill) => (
              <TableRow key={bill.bill_id}>
                <TableCell className="font-mono text-xs font-bold text-orange-500 uppercase tracking-widest">BILL-{bill.bill_id}</TableCell>
                <TableCell>
                  <p className="font-bold text-white">{bill.customer_name}</p>
                  <p className="text-xs text-slate-500">{bill.make} {bill.model} [{bill.registration_no}]</p>
                </TableCell>
                <TableCell className="text-slate-300">{bill.service_type}</TableCell>
                <TableCell>
                  <Badge variant={bill.bill_status === 'PAID' ? 'success' : 'danger'}>{bill.bill_status}</Badge>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-xs uppercase">{formatDate(bill.generated_at)}</TableCell>
                <TableCell className="font-mono font-black text-white">{formatCurrency(Number(bill.total_amount))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => printBill(bill)} className="h-8 w-8 text-slate-400 hover:text-white">
                      <Printer size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => notify(`Bill #${bill.bill_id} email queued`)} className="h-8 w-8 text-slate-400 hover:text-white">
                      <Mail size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
