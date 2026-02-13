import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft, Sparkles, Puzzle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ServiceSelector from '../components/packages/ServiceSelector';
import AddonPicker from '../components/packages/AddonPicker';
import PackagePriceSummary from '../components/packages/PackagePriceSummary';
import SavedPackagesList from '../components/packages/SavedPackagesList';

const FREQ_MULTIPLIER = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 0.34, 'one-time': 0 };
const DURATION_DISCOUNTS = { 1: 0, 3: 5, 6: 10, 12: 15 };

export default function PackageBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [packageName, setPackageName] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [duration, setDuration] = useState(1);
  const [propertyType, setPropertyType] = useState('any');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientAuth.me()
      .then(u => { setUser(u); setAuthChecking(false); })
      .catch(() => {
        window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      });
  }, []);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.ServiceCategory.list(),
    initialData: []
  });

  const { data: addons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      const all = await base44.entities.ServiceAddon.list();
      return all.filter(a => a.is_active !== false);
    },
    initialData: []
  });

  const { data: savedPackages = [], isLoading: loadingSaved } = useQuery({
    queryKey: ['customPackages', user?.id],
    queryFn: async () => {
      const all = await base44.entities.CustomPackage.list();
      return all.filter(p => p.customer_id === user.id && p.is_active !== false);
    },
    enabled: !!user?.id,
    initialData: []
  });

  // Calculate monthly price
  const calcMonthlyPrice = () => {
    let monthly = 0;
    selectedServices.forEach(sel => {
      const svc = services.find(s => s.id === sel.service_id);
      if (!svc) return;
      const mult = FREQ_MULTIPLIER[sel.frequency || 'monthly'] || 1;
      monthly += svc.price * mult;
    });
    addons.filter(a => selectedAddonIds.includes(a.id)).forEach(a => {
      monthly += a.price;
    });
    const disc = DURATION_DISCOUNTS[duration] || 0;
    return Math.round(monthly * (1 - disc / 100));
  };

  const handleToggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.some(s => s.service_id === serviceId)) {
        return prev.filter(s => s.service_id !== serviceId);
      }
      return [...prev, { service_id: serviceId, frequency: 'monthly', visits_per_month: 1 }];
    });
  };

  const handleFrequencyChange = (serviceId, frequency) => {
    const visitsMap = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 1, 'one-time': 1 };
    setSelectedServices(prev =>
      prev.map(s => s.service_id === serviceId
        ? { ...s, frequency, visits_per_month: visitsMap[frequency] || 1 }
        : s
      )
    );
  };

  const handleToggleAddon = (addonId) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSave = async () => {
    if (!packageName.trim()) {
      toast.error('Please name your package');
      return;
    }
    if (selectedServices.length === 0) {
      toast.error('Add at least one service');
      return;
    }

    setSaving(true);
    const data = {
      name: packageName,
      customer_id: user.id,
      services: selectedServices,
      addon_ids: selectedAddonIds,
      property_type: propertyType,
      duration_months: duration,
      monthly_price: calcMonthlyPrice(),
      is_active: true,
    };

    if (editingId) {
      await base44.entities.CustomPackage.update(editingId, data);
      toast.success('Package updated!');
    } else {
      await base44.entities.CustomPackage.create(data);
      toast.success('Package saved!');
    }

    queryClient.invalidateQueries(['customPackages']);
    resetForm();
    setSaving(false);
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setPackageName(pkg.name);
    setSelectedServices(pkg.services || []);
    setSelectedAddonIds(pkg.addon_ids || []);
    setDuration(pkg.duration_months || 1);
    setPropertyType(pkg.property_type || 'any');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this saved package?')) return;
    await base44.entities.CustomPackage.update(id, { is_active: false });
    queryClient.invalidateQueries(['customPackages']);
    toast.success('Package deleted');
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setPackageName('');
    setSelectedServices([]);
    setSelectedAddonIds([]);
    setDuration(1);
    setPropertyType('any');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-6">
          <Link to={createPageUrl('Subscriptions')} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Custom Package Builder</h1>
          </div>
          <p className="text-slate-300 max-w-lg">
            Mix and match services to build a maintenance plan perfectly tailored to your home.
            Set frequencies, add extras, and save for future use.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Saved Packages */}
        {savedPackages.length > 0 && (
          <div className="mb-10">
            <SavedPackagesList
              packages={savedPackages}
              services={services}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        )}

        {/* Builder */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Service Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {editingId ? 'Edit Package' : 'Build Your Package'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Package Name *</label>
                    <Input
                      value={packageName}
                      onChange={e => setPackageName(e.target.value)}
                      placeholder="e.g. My Villa Care Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Property</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
                    <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Month</SelectItem>
                        <SelectItem value="3">3 Months (5% off)</SelectItem>
                        <SelectItem value="6">6 Months (10% off)</SelectItem>
                        <SelectItem value="12">12 Months (15% off)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Select Services</h2>
              <p className="text-sm text-slate-400 mb-4">Choose services and set how often you need them</p>
              <ServiceSelector
                services={services}
                categories={categories}
                selectedServices={selectedServices}
                onToggleService={handleToggleService}
                onFrequencyChange={handleFrequencyChange}
              />
            </div>

            {/* Addons */}
            <AddonPicker
              addons={addons}
              selectedIds={selectedAddonIds}
              onToggle={handleToggleAddon}
            />
          </div>

          {/* Right: Price Summary */}
          <div>
            <PackagePriceSummary
              selectedServices={selectedServices}
              services={services}
              selectedAddonIds={selectedAddonIds}
              addons={addons}
              duration={duration}
              onRemoveService={handleToggleService}
            />

            <div className="mt-4 space-y-2">
              <Button
                onClick={handleSave}
                disabled={saving || selectedServices.length === 0 || !packageName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-11"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> {editingId ? 'Update Package' : 'Save Package'}</>
                )}
              </Button>

              {editingId && (
                <Button variant="outline" onClick={resetForm} className="w-full h-11">
                  Cancel Editing
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
