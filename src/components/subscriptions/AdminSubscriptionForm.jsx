import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export default function AdminSubscriptionForm({ open, onClose, onSubmit, subscription, packages = [], users = [], properties = [], isLoading }) {
  const [form, setForm] = useState({
    package_id: '',
    customer_id: '',
    property_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    next_billing_date: '',
    monthly_amount: 0,
    payment_method: '',
    auto_renew: true,
    pause_reason: '',
    cancel_reason: '',
  });

  useEffect(() => {
    if (subscription) {
      setForm({
        package_id: subscription.package_id || '',
        customer_id: subscription.customer_id || '',
        property_id: subscription.property_id || '',
        status: subscription.status || 'active',
        start_date: subscription.start_date || '',
        end_date: subscription.end_date || '',
        next_billing_date: subscription.next_billing_date || '',
        monthly_amount: subscription.monthly_amount || 0,
        payment_method: subscription.payment_method || '',
        auto_renew: subscription.auto_renew !== false,
        pause_reason: subscription.pause_reason || '',
        cancel_reason: subscription.cancel_reason || '',
      });
    } else {
      setForm({
        package_id: '', customer_id: '', property_id: '', status: 'active',
        start_date: '', end_date: '', next_billing_date: '', monthly_amount: 0,
        payment_method: '', auto_renew: true, pause_reason: '', cancel_reason: '',
      });
    }
  }, [subscription, open]);

  // Auto-fill price when package changes
  const handlePackageChange = (pkgId) => {
    const pkg = packages.find(p => p.id === pkgId);
    setForm(prev => ({
      ...prev,
      package_id: pkgId,
      monthly_amount: pkg?.monthly_price || prev.monthly_amount
    }));
  };

  // Filter properties by selected customer
  const customerProperties = form.customer_id
    ? properties.filter(p => p.owner_id === form.customer_id)
    : properties;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      monthly_amount: Number(form.monthly_amount),
    };
    // Remove empty optional fields
    if (!data.pause_reason) delete data.pause_reason;
    if (!data.cancel_reason) delete data.cancel_reason;
    if (!data.payment_method) delete data.payment_method;
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Create Subscription'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Package */}
          <div>
            <label className="block text-sm font-medium mb-1">Package *</label>
            <Select value={form.package_id} onValueChange={handlePackageChange}>
              <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
              <SelectContent>
                {packages.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — AED {p.monthly_price}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium mb-1">Customer *</label>
            <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v, property_id: '' })}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property */}
          <div>
            <label className="block text-sm font-medium mb-1">Property *</label>
            <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {customerProperties.length === 0 ? (
                  <SelectItem value="_none" disabled>No properties found</SelectItem>
                ) : (
                  customerProperties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.address} ({p.property_type})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Next Billing</label>
              <Input type="date" value={form.next_billing_date} onChange={(e) => setForm({ ...form, next_billing_date: e.target.value })} />
            </div>
          </div>

          {/* Amount & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Amount (AED) *</label>
              <Input type="number" value={form.monthly_amount} onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <Select value={form.payment_method || '_none'} onValueChange={(v) => setForm({ ...form, payment_method: v === '_none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Not set</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-renew */}
          <div className="flex items-center gap-2">
            <Switch checked={form.auto_renew} onCheckedChange={(v) => setForm({ ...form, auto_renew: v })} />
            <span className="text-sm">Auto-renew</span>
          </div>

          {/* Reason fields (conditional) */}
          {form.status === 'paused' && (
            <div>
              <label className="block text-sm font-medium mb-1">Pause Reason</label>
              <Textarea value={form.pause_reason} onChange={(e) => setForm({ ...form, pause_reason: e.target.value })} rows={2} placeholder="Why is this subscription paused?" />
            </div>
          )}
          {form.status === 'cancelled' && (
            <div>
              <label className="block text-sm font-medium mb-1">Cancel Reason</label>
              <Textarea value={form.cancel_reason} onChange={(e) => setForm({ ...form, cancel_reason: e.target.value })} rows={2} placeholder="Why was this subscription cancelled?" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : subscription ? 'Update Subscription' : 'Create Subscription'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}