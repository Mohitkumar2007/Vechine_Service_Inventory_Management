import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Package, AlertCircle, TrendingDown, Box } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { cn, formatCurrency } from '../lib/utils';
import { downloadText, notify } from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/ui/Modal';

interface InventoryPart {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  reorderLevel: number;
}

export function InventoryPage() {
  const { user } = useAuth();
  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partForm, setPartForm] = useState({ name: '', sku: '', category: 'General', price: '100', stock: '10', reorderLevel: '5' });
  const visibleParts = useMemo(() => parts.filter((part) => `${part.name} ${part.sku} ${part.category}`.toLowerCase().includes(query.toLowerCase())), [parts, query]);
  const totalValue = parts.reduce((sum, part) => sum + part.price * part.stock, 0);
  const lowStock = parts.filter((part) => part.stock <= part.reorderLevel).length;
  const outOfStock = parts.filter((part) => part.stock === 0).length;

  const loadParts = async () => {
    if (!user) return;
    try {
      const rows = await apiRequest<any[]>('/inventory/', { role: user.role });
      setParts(rows.map((row) => ({
        id: String(row.part_id),
        name: row.part_name,
        sku: row.sku,
        price: Number(row.unit_price || 0),
        stock: Number(row.stock_qty || 0),
        category: row.category || 'General',
        reorderLevel: Number(row.reorder_level || 5),
      })));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load inventory');
    }
  };

  useEffect(() => {
    loadParts();
  }, [user?.role]);

  const addPart = () => {
    if (!partForm.name.trim() || !partForm.sku.trim()) {
      notify('Part name and SKU are required');
      return;
    }
    apiRequest('/inventory/', {
      method: 'POST',
      role: user?.role,
      body: JSON.stringify({
        part_name: partForm.name,
        sku: partForm.sku,
        category: partForm.category,
        unit_price: Number(partForm.price || 0),
        stock_qty: Number(partForm.stock || 0),
        reorder_level: Number(partForm.reorderLevel || 5),
      }),
    }).then(() => {
      notify('Component added to MySQL');
      setPartForm({ name: '', sku: '', category: 'General', price: '100', stock: '10', reorderLevel: '5' });
      setIsModalOpen(false);
      loadParts();
    }).catch((error) => notify(error instanceof Error ? error.message : 'Could not add component'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Component Inventory</h2>
          <p className="text-slate-400">Stock management and supply chain overview.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={() => downloadText('parts-import-template.csv', 'name,sku,category,price,stock')} className="font-bold uppercase tracking-widest text-[10px] h-10 px-6">
            Import Parts
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
            <Plus size={16} className="mr-2" /> Add Component
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Stock Value</p>
                <h4 className="text-2xl font-black text-white">{formatCurrency(totalValue)}</h4>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <TrendingDown size={20} className="rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start text-red-500">
              <div>
                <p className="text-[10px] opacity-70 font-black uppercase tracking-widest mb-1">Out of Stock</p>
                <h4 className="text-2xl font-black">{outOfStock} Items</h4>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start text-amber-500">
              <div>
                <p className="text-[10px] opacity-70 font-black uppercase tracking-widest mb-1">Low Stock Alerts</p>
                <h4 className="text-2xl font-black">{lowStock} Items</h4>
              </div>
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Package size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search parts by name, SKU, or category..." className="pl-10" />
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-950/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part / Component</TableHead>
              <TableHead>SKU ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleParts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500 translate-y-[-2px]">
                      <Box size={16} />
                    </div>
                    <span className="font-bold text-white">{part.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-500 uppercase tracking-widest">{part.sku}</TableCell>
                <TableCell>
                   <Badge variant="default" className="bg-slate-800 text-[10px]">{part.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full", part.stock > 20 ? "bg-emerald-500" : "bg-amber-500")} 
                        style={{ width: `${Math.min(100, (part.stock / 50) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={cn("text-xs font-bold", part.stock > 20 ? "text-emerald-500" : "text-amber-500")}>
                      {part.stock}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-bold text-white">{formatCurrency(part.price)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-orange-500 text-[10px] uppercase font-black" onClick={() => {
                    apiRequest(`/inventory/${part.id}/restock/`, { method: 'PATCH', role: user?.role, body: JSON.stringify({ quantity: 10 }) })
                      .then(() => {
                        notify(`${part.name} restocked by 10`);
                        loadParts();
                      })
                      .catch((error) => notify(error instanceof Error ? error.message : 'Could not restock item'));
                  }}>Restock</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Component" description="Create a new inventory item in MySQL.">
        <form onSubmit={(event) => { event.preventDefault(); addPart(); }} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input value={partForm.name} onChange={(event) => setPartForm((form) => ({ ...form, name: event.target.value }))} placeholder="Part name" />
          <Input value={partForm.sku} onChange={(event) => setPartForm((form) => ({ ...form, sku: event.target.value.toUpperCase() }))} placeholder="SKU" />
          <Input value={partForm.category} onChange={(event) => setPartForm((form) => ({ ...form, category: event.target.value }))} placeholder="Category" />
          <Input value={partForm.price} onChange={(event) => setPartForm((form) => ({ ...form, price: event.target.value }))} placeholder="Unit price" />
          <Input value={partForm.stock} onChange={(event) => setPartForm((form) => ({ ...form, stock: event.target.value }))} placeholder="Stock quantity" />
          <Input value={partForm.reorderLevel} onChange={(event) => setPartForm((form) => ({ ...form, reorderLevel: event.target.value }))} placeholder="Reorder level" />
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Component</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
