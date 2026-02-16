import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, Home, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent } from './AuditLogger';
import ProviderAvailabilityBadge, { getProviderAvailability } from './ProviderAvailabilityChecker';

const TIME_SLOTS = ['08:00-10:00','10:00-12:00','12:00-14:00','14:00-16:00','16:00-18:00','18:00-20:00'];

const INITIAL_FORM = {
  service_id: '', property_id: '', customer_id: '',
  scheduled_date: '', scheduled_time: '',
  total_amount: '', admin_notes: '',
  status: 'confirmed', payment_status: 'pending',
};

export default function CreateJobDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedProviderIds, setSelectedProviderIds] = useState([]);

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

  const { data: blockouts = [] } = useQuery({
    queryKey: ['blockouts'],
    queryFn: () => base44.entities.TechBlockout.list(),
    initialData: [],
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list(),
    initialData: [],
  });

  // Auto-populate property when customer is selected
  const customerProperties = useMemo(() => {
    if (!form.customer_id) return [];
    return properties.filter(p => p.owner_id === form.customer_id);
  }, [form.customer_id, properties]);

  const handleCustomerChange = (customerId) => {
    const custProps = properties.filter(p => p.owner_id === customerId);
    setForm(prev => ({
      ...prev,
      customer_id: customerId,
      property_id: custProps.length === 1 ? custProps[0].id : '',
    }));
  };

  // Filter services by selected providers' specialization
  const filteredServices = useMemo(() => {
    const active = services.filter(s => s.is_active !== false);
    if (selectedProviderIds.length === 0) return active;

    // Show services that at least one selected provider is qualified for
    return active.filter(svc => {
      return selectedProviderIds.some(pid => {
        const provider = providers.find(p => p.id === pid);
        if (!provider) return false;
        // Check assigned_service_ids first, then specialization
        if (provider.assigned_service_ids?.length > 0) {
          return provider.assigned_service_ids.includes(svc.id);
        }
        if (provider.specialization?.length > 0) {
          return provider.specialization.some(spec =>
            svc.name?.toLowerCase().includes(spec.toLowerCase()) ||
            spec.toLowerCase().includes(svc.name?.toLowerCase())
          );
        }
        return true; // provider has no restrictions
      });
    });
  }, [services, selectedProviderIds, providers]);

  // Get eligible providers for selected service
  const eligibleProviders = useMemo(() => {
    const active = providers.filter(p => p.is_active);
    if (!form.service_id) return active;

    return active.map(p => {
      const isQualified = (() => {
        if (p.assigned_service_ids?.length > 0) {
          return p.assigned_service_ids.includes(form.service_id);
        }
        const svc = services.find(s => s.id === form.service_id);
        if (p.specialization?.length > 0 && svc) {
          return p.specialization.some(spec =>
            svc.name?.toLowerCase().includes(spec.toLowerCase()) ||
            spec.toLowerCase().includes(svc.name?.toLowerCase())
          );
        }
        return true;
      })();

      const availability = getProviderAvailability(
        p, form.scheduled_date, form.scheduled_time, blockouts, allBookings
      );

      return { ...p, isQualified, availability };
    }).sort((a, b) => {
      // Qualified first, then available, then by rating
      if (a.isQualified !== b.isQualified) return b.isQualified - a.isQualified;
      const order = { available: 0, busy: 1, unknown: 2, blocked: 3, unavailable: 4 };
      if (order[a.availability.status] !== order[b.availability.status]) return order[a.availability.status] - order[b.availability.status];
      return (b.average_rating || 0) - (a.average_rating || 0);
    });
  }, [providers, form.service_id, form.scheduled_date, form.scheduled_time, blockouts, allBookings, services]);

  const handleServiceChange = (serviceId) => {
    const svc = services.find(s => s.id === serviceId);
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      total_amount: svc?.price?.toString() || prev.total_amount,
    }));
    // Remove any selected providers that aren't qualified for new service
    if (serviceId) {
      setSelectedProviderIds(prev => prev.filter(pid => {
        const p = providers.find(pr => pr.id === pid);
        if (!p) return false;
        if (p.assigned_service_ids?.length > 0) return p.assigned_service_ids.includes(serviceId);
        return true;
      }));
    }
  };

  const toggleProvider = (providerId) => {
    setSelectedProviderIds(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleSubmit = async () => {
    if (!form.service_id || !form.customer_id || !form.scheduled_date || !form.total_amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!form.property_id) {
      toast.error('Please select a property');
      return;
    }
    setSaving(true);

    const primaryProviderId = selectedProviderIds[0] || '';
    const data = {
      ...form,
      total_amount: parseFloat(form.total_amount),
      assigned_provider_id: primaryProviderId,
      assigned_provider_ids: selectedProviderIds.length > 0 ? selectedProviderIds : undefined,
      assigned_provider: primaryProviderId
        ? providers.find(p => p.id === primaryProviderId)?.full_name || ''
        : '',
    };
    Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === undefined) delete data[k]; });

    const booking = await base44.entities.Booking.create(data);
    const providerNames = selectedProviderIds.map(id => providers.find(p => p.id === id)?.full_name).filter(Boolean).join(', ');
    logAuditEvent({
      action: 'booking_created_by_admin',
      entity_type: 'Booking',
      entity_id: booking.id,
      details: `Admin created booking #${booking.id.slice(0, 8)}${providerNames ? ` — assigned to ${providerNames}` : ''}`,
    });
    queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    toast.success('Job created successfully');
    setSaving(false);
    setForm(INITIAL_FORM);
    setSelectedProviderIds([]);
    onClose();
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setSelectedProviderIds([]);
    }
  }, [open]);

  const selectedCustomer = customers.find(c => c.id === form.customer_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">

          {/* Customer Section */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Customer *</label>
            <Select value={form.customer_id} onValueChange={handleCustomerChange}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {c.full_name} <span className="text-slate-400">({c.email})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property - auto-populated */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Property *
              {customerProperties.length === 1 && (
                <span className="text-xs text-emerald-600 ml-2 font-normal">Auto-selected</span>
              )}
            </label>
            {customerProperties.length === 0 && form.customer_id ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                No properties found for this customer. Add a property first.
              </p>
            ) : (
              <Select value={form.property_id} onValueChange={v => set('property_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {customerProperties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-slate-400" />
                        {p.address} · {p.area}
                        <Badge variant="outline" className="text-[10px] ml-1">{p.property_type} · {p.bedrooms || '?'} BR</Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date & Time */}
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
                  {TIME_SLOTS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service - filtered by provider specialization */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Service *
              {selectedProviderIds.length > 0 && filteredServices.length < services.filter(s => s.is_active !== false).length && (
                <span className="text-xs text-blue-600 ml-2 font-normal">
                  Filtered by provider skills ({filteredServices.length} matching)
                </span>
              )}
            </label>
            <Select value={form.service_id} onValueChange={handleServiceChange}>
              <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
              <SelectContent>
                {filteredServices.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — AED {s.price}
                    {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Amount (AED) *</label>
            <Input type="number" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} />
          </div>

          {/* Provider Assignment - multi-select with availability */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Assign Providers
              {selectedProviderIds.length > 0 && (
                <Badge className="ml-2 text-[10px] bg-emerald-100 text-emerald-700">
                  {selectedProviderIds.length} selected
                </Badge>
              )}
            </label>
            {/* Selected providers chips */}
            {selectedProviderIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedProviderIds.map(pid => {
                  const p = providers.find(pr => pr.id === pid);
                  return p ? (
                    <Badge key={pid} variant="outline" className="gap-1 pr-1 text-xs">
                      {p.full_name}
                      <button onClick={() => toggleProvider(pid)} className="ml-1 hover:bg-slate-200 rounded p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            {/* Provider list */}
            <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
              {eligibleProviders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No active providers</p>
              ) : (
                eligibleProviders.map(p => {
                  const isSelected = selectedProviderIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !p.isQualified ? 'opacity-50' : ''
                      } ${isSelected ? 'bg-emerald-50' : ''}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleProvider(p.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 truncate">{p.full_name}</span>
                          {p.average_rating > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {p.average_rating.toFixed(1)}
                            </span>
                          )}
                          {!p.isQualified && (
                            <Badge variant="outline" className="text-[10px] text-slate-400">Not specialized</Badge>
                          )}
                        </div>
                        {p.specialization?.length > 0 && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {p.specialization.join(', ')}
                          </p>
                        )}
                      </div>
                      <ProviderAvailabilityBadge availability={p.availability} />
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Admin Notes */}
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