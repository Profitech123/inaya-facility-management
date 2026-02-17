import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Plus, FileText, DollarSign, Clock, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import jsPDF from 'jspdf';

function AdminInvoicesContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customer_id: '', amount: '', tax_amount: '0', discount_amount: '0', notes: '', due_days: '30', line_items_text: '' });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date'), initialData: [], staleTime: 30000
  });
  const { data: users = [] } = useQuery({
    queryKey: ['adminUsers'], queryFn: () => base44.entities.User.list(), initialData: [], staleTime: 60000
  });
  const { data: bookings = [] } = useQuery({
    queryKey: ['adminBookings'], queryFn: () => base44.entities.Booking.list(), initialData: [], staleTime: 60000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['invoices']); setShowCreate(false); toast.success('Invoice created'); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Invoice.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['invoices']); toast.success('Invoice updated'); }
  });

  const handleCreate = () => {
    const amount = parseFloat(form.amount) || 0;
    const tax = parseFloat(form.tax_amount) || 0;
    const discount = parseFloat(form.discount_amount) || 0;
    const total = amount + tax - discount;
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + (parseInt(form.due_days) || 30));
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(invoices.length + 1).padStart(4, '0')}`;

    const lineItems = form.line_items_text ? form.line_items_text.split('\n').filter(l => l.trim()).map(l => {
      const parts = l.split('|').map(p => p.trim());
      return { description: parts[0] || '', quantity: parseFloat(parts[1]) || 1, unit_price: parseFloat(parts[2]) || 0, amount: (parseFloat(parts[1]) || 1) * (parseFloat(parts[2]) || 0) };
    }) : [{ description: 'Service charge', quantity: 1, unit_price: amount, amount }];

    createMutation.mutate({
      invoice_number: invoiceNumber,
      customer_id: form.customer_id,
      invoice_date: now.toISOString().split('T')[0],
      due_date: due.toISOString().split('T')[0],
      amount, tax_amount: tax, discount_amount: discount, total_amount: total,
      status: 'pending',
      line_items: lineItems,
      notes: form.notes,
    });
    setForm({ customer_id: '', amount: '', tax_amount: '0', discount_amount: '0', notes: '', due_days: '30', line_items_text: '' });
  };

  const markPaid = (inv) => {
    updateMutation.mutate({ id: inv.id, data: { status: 'paid', payment_date: new Date().toISOString(), payment_method: 'card' } });
  };

  const downloadPDF = (inv) => {
    const customer = users.find(u => u.id === inv.customer_id);
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(16, 185, 129);
    doc.text('INAYA', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text('Facilities Management Services L.L.C', 14, 27);
    doc.setFontSize(16); doc.setTextColor(30, 41, 59);
    doc.text(`Invoice ${inv.invoice_number}`, 14, 45);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${inv.invoice_date}`, 14, 53);
    doc.text(`Due: ${inv.due_date}`, 14, 59);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 14, 65);
    doc.text(`Customer: ${customer?.full_name || 'N/A'}`, 14, 75);
    doc.text(`Email: ${customer?.email || 'N/A'}`, 14, 81);

    let y = 95;
    doc.setFillColor(30, 41, 59); doc.setTextColor(255); doc.setFontSize(8);
    doc.rect(14, y, 182, 7, 'F');
    doc.text('Description', 16, y + 5); doc.text('Qty', 120, y + 5); doc.text('Unit Price', 140, y + 5); doc.text('Amount', 170, y + 5);
    y += 7; doc.setTextColor(51, 65, 85);
    (inv.line_items || []).forEach((item, i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 6, 'F'); }
      doc.text(String(item.description || '').substring(0, 50), 16, y + 4.5);
      doc.text(String(item.quantity || 1), 122, y + 4.5);
      doc.text(`AED ${item.unit_price || 0}`, 140, y + 4.5);
      doc.text(`AED ${item.amount || 0}`, 170, y + 4.5);
      y += 6;
    });
    y += 8;
    doc.setFontSize(10);
    doc.text(`Subtotal: AED ${inv.amount}`, 140, y); y += 6;
    if (inv.tax_amount) { doc.text(`Tax: AED ${inv.tax_amount}`, 140, y); y += 6; }
    if (inv.discount_amount) { doc.text(`Discount: -AED ${inv.discount_amount}`, 140, y); y += 6; }
    doc.setFontSize(12); doc.setTextColor(16, 185, 129);
    doc.text(`Total: AED ${inv.total_amount}`, 140, y + 4);
    if (inv.notes) { doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(`Notes: ${inv.notes}`, 14, y + 20); }
    doc.save(`${inv.invoice_number}.pdf`);
  };

  const filtered = invoices
    .filter(inv => statusFilter === 'all' || inv.status === statusFilter)
    .filter(inv => !search || inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) || users.find(u => u.id === inv.customer_id)?.full_name?.toLowerCase().includes(search.toLowerCase()));

  const stats = useMemo(() => ({
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue' || (i.status === 'pending' && i.due_date && i.due_date < new Date().toISOString().split('T')[0])).length,
    totalAmount: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total_amount || 0), 0),
  }), [invoices]);

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoice Management</h1>
          <p className="text-slate-500">Create, track, and manage invoices</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Invoice
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: `AED ${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: `AED ${stats.pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: `${stats.pending} invoices` },
          { label: 'Paid', value: stats.paid, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${kpi.color}`} /></div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{kpi.value}</div>
                    <div className="text-xs text-slate-500">{kpi.label}</div>
                    {kpi.sub && <div className="text-[10px] text-slate-400">{kpi.sub}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice # or customer..." className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-700">Invoice #</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Customer</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Due</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Amount</th>
                  <th className="p-3 text-center font-semibold text-slate-700">Status</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const customer = users.find(u => u.id === inv.customer_id);
                  const isOverdue = inv.status === 'pending' && inv.due_date && inv.due_date < new Date().toISOString().split('T')[0];
                  return (
                    <tr key={inv.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{inv.invoice_number}</td>
                      <td className="p-3 text-slate-600">{customer?.full_name || 'Unknown'}</td>
                      <td className="p-3 text-slate-500">{inv.invoice_date}</td>
                      <td className={`p-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{inv.due_date}</td>
                      <td className="p-3 text-right font-semibold text-slate-900">AED {(inv.total_amount || 0).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <Badge className={statusColors[isOverdue ? 'overdue' : inv.status] || statusColors.pending}>
                          {isOverdue ? 'overdue' : inv.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => downloadPDF(inv)}>
                            <Download className="w-3 h-3 mr-1" /> PDF
                          </Button>
                          {inv.status === 'pending' && (
                            <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => markPaid(inv)}>
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400">No invoices found</div>}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer</Label>
              <Select value={form.customer_id} onValueChange={v => setForm({ ...form, customer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Amount (AED)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Tax (AED)</Label><Input type="number" value={form.tax_amount} onChange={e => setForm({ ...form, tax_amount: e.target.value })} /></div>
              <div><Label>Discount (AED)</Label><Input type="number" value={form.discount_amount} onChange={e => setForm({ ...form, discount_amount: e.target.value })} /></div>
            </div>
            <div><Label>Due in (days)</Label><Input type="number" value={form.due_days} onChange={e => setForm({ ...form, due_days: e.target.value })} /></div>
            <div>
              <Label>Line Items (one per line: Description | Qty | Unit Price)</Label>
              <Textarea value={form.line_items_text} onChange={e => setForm({ ...form, line_items_text: e.target.value })} placeholder="AC Maintenance | 1 | 350&#10;Filter Replacement | 2 | 50" rows={3} />
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate} disabled={!form.customer_id || !form.amount}>
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminInvoices() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminInvoicesContent />
    </AuthGuard>
  );
}