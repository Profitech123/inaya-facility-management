import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';

const FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'biannually', 'annually'];

export default function AdminPackageForm({ open, onClose, onSubmit, pkg, services = [], isLoading }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    package_type: 'pre-built',
    property_type: 'all',
    duration_months: 12,
    monthly_price: 0,
    setup_fee: 0,
    discount_percentage: 0,
    is_active: true,
    popular: false,
    features: [''],
    services: [{ service_id: '', frequency: 'monthly', visits_per_period: 1 }],
    min_bedrooms: '',
    max_bedrooms: '',
    cancellation_notice_days: 30
  });

  useEffect(() => {
    if (pkg) {
      setForm({
        name: pkg.name || '',
        description: pkg.description || '',
        package_type: pkg.package_type || 'pre-built',
        property_type: pkg.property_type || 'all',
        duration_months: pkg.duration_months || 12,
        monthly_price: pkg.monthly_price || 0,
        setup_fee: pkg.setup_fee || 0,
        discount_percentage: pkg.discount_percentage || 0,
        is_active: pkg.is_active !== false,
        popular: pkg.popular || false,
        features: pkg.features?.length ? pkg.features : [''],
        services: pkg.services?.length ? pkg.services : [{ service_id: '', frequency: 'monthly', visits_per_period: 1 }],
        min_bedrooms: pkg.min_bedrooms || '',
        max_bedrooms: pkg.max_bedrooms || '',
        cancellation_notice_days: pkg.cancellation_notice_days || 30
      });
    } else {
      setForm({
        name: '', description: '', package_type: 'pre-built', property_type: 'all',
        duration_months: 12, monthly_price: 0, setup_fee: 0, discount_percentage: 0,
        is_active: true, popular: false, features: [''],
        services: [{ service_id: '', frequency: 'monthly', visits_per_period: 1 }],
        min_bedrooms: '', max_bedrooms: '', cancellation_notice_days: 30
      });
    }
  }, [pkg, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      monthly_price: Number(form.monthly_price),
      setup_fee: Number(form.setup_fee),
      discount_percentage: Number(form.discount_percentage),
      duration_months: Number(form.duration_months),
      cancellation_notice_days: Number(form.cancellation_notice_days),
      min_bedrooms: form.min_bedrooms ? Number(form.min_bedrooms) : undefined,
      max_bedrooms: form.max_bedrooms ? Number(form.max_bedrooms) : undefined,
      features: form.features.filter(f => f.trim()),
      services: form.services.filter(s => s.service_id)
    };
    onSubmit(data);
  };

  const updateService = (idx, field, value) => {
    const updated = [...form.services];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, services: updated });
  };

  const updateFeature = (idx, value) => {
    const updated = [...form.features];
    updated[idx] = value;
    setForm({ ...form, features: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg ? 'Edit Package' : 'Create New Package'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Package Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>

          {/* Type & Property */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Package Type</label>
              <Select value={form.package_type} onValueChange={(v) => setForm({ ...form, package_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-built">Pre-built</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villa Only</SelectItem>
                  <SelectItem value="apartment">Apartment Only</SelectItem>
                  <SelectItem value="townhouse">Townhouse Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Pricing & Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Price (AED)</label>
                <Input type="number" value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (months)</label>
                <Select value={String(form.duration_months)} onValueChange={(v) => setForm({ ...form, duration_months: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 3, 6, 12, 24].map(m => (
                      <SelectItem key={m} value={String(m)}>{m} month{m > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Setup Fee (AED)</label>
                <Input type="number" value={form.setup_fee} onChange={(e) => setForm({ ...form, setup_fee: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount %</label>
                <Input type="number" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Bedroom Range */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Bedrooms</label>
              <Input type="number" value={form.min_bedrooms} onChange={(e) => setForm({ ...form, min_bedrooms: e.target.value })} placeholder="Any" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Bedrooms</label>
              <Input type="number" value={form.max_bedrooms} onChange={(e) => setForm({ ...form, max_bedrooms: e.target.value })} placeholder="Any" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cancel Notice (days)</label>
              <Input type="number" value={form.cancellation_notice_days} onChange={(e) => setForm({ ...form, cancellation_notice_days: e.target.value })} />
            </div>
          </div>

          {/* Included Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Included Services</h3>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setForm({ ...form, services: [...form.services, { service_id: '', frequency: 'monthly', visits_per_period: 1 }] })}>
                <Plus className="w-4 h-4 mr-1" /> Add Service
              </Button>
            </div>
            <div className="space-y-3">
              {form.services.map((svc, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Select value={svc.service_id} onValueChange={(v) => updateService(idx, 'service_id', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={svc.frequency} onValueChange={(v) => updateService(idx, 'frequency', v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" className="w-20" placeholder="Visits" value={svc.visits_per_period || ''}
                    onChange={(e) => updateService(idx, 'visits_per_period', Number(e.target.value))} />
                  {form.services.length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => setForm({ ...form, services: form.services.filter((_, i) => i !== idx) })}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Features / Highlights</h3>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setForm({ ...form, features: [...form.features, ''] })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {form.features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={f} onChange={(e) => updateFeature(idx, e.target.value)} placeholder="e.g. 24/7 emergency support" />
                  {form.features.length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) })}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} />
              <span className="text-sm">Mark as Popular</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? 'Saving...' : pkg ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}