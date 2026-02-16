import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent } from './AuditLogger';

export default function CreateJobDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    service_id: '', property_id: '', customer_id: '',
    scheduled_date: '', scheduled_time: '',
    total_amount: '', assigned_provider_id: '',
    customer_notes: '', admin_notes: '',
    status: 'confirmed', payment_status: 'pending',
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['adminProperties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['adminCustomers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
  });

  // Filter properties for selected customer
  const customerProperties = form.customer_id
    ? properties.filter(p => p.owner_id === form.customer_id)
    : properties;

  const handleServiceChange = (serviceId) => {
    const svc = services.find(s => s.id === serviceId);
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      total_amount: svc?.price?.toString() || prev.total_amount,
    }));
  };

  const handleSubmit = async () => {
    if (!form.service_id || !form.customer_id || !form.scheduled_date || !form.total_amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const data = {
      ...form,
      total_amount: parseFloat(form.total_amount),
    };
    // Remove empty strings
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

    const booking = await base44.entities.Booking.create(data);
    logAuditEvent({
      action: 'booking_created_by_admin',
      entity_type: 'Booking',
      entity_id: booking.id,
      details: `Admin manually created booking #${booking.id.slice(0, 8)}`,
    });
    queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    toast.success('Job created successfully');
    setSaving(false);
    setForm({
      service_id: '', property_id: '', customer_id: '',
      scheduled_date: '', scheduled_time: '',
      total_amount: '', assigned_provider_id: '',
      customer_notes: '', admin_notes: '',
      status: 'confirmed', payment_status: 'pending',
    });
    onClose();
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Customer *</label>
            <Select value={form.customer_id} onValueChange={v => set('customer_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Service *</label>
            <Select value={form.service_id} onValueChange={handleServiceChange}>
              <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
              <SelectContent>
                {services.filter(s => s.is_active !== false).map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — AED {s.price}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Property</label>
            <Select value={form.property_id} onValueChange={v => set('property_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {customerProperties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.address} ({p.area})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Date *</label>
              <Input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Time Slot</label>
              <Select value={form.scheduled_time} onValueChange={v => set('scheduled_time', v)}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {['08:00-10:00','10:00-12:00','12:00-14:00','14:00-16:00','16:00-18:00','18:00-20:00'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Amount (AED) *</label>
              <Input type="number" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Assign Provider</label>
              <Select value={form.assigned_provider_id} onValueChange={v => set('assigned_provider_id', v)}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {providers.filter(p => p.is_active).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Admin Notes</label>
            <Textarea value={form.admin_notes} onChange={e => set('admin_notes', e.target.value)} rows={2} placeholder="Internal notes..." />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Create Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}