import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, Send, ShoppingCart } from 'lucide-react';

import PackageBuilderHero from '../components/packages/PackageBuilderHero';
import PackageConfigCard from '../components/packages/PackageConfigCard';
import ServiceSelector from '../components/packages/ServiceSelector';
import AddonPicker from '../components/packages/AddonPicker';
import PackagePriceSummary from '../components/packages/PackagePriceSummary';
import SavedPackagesList from '../components/packages/SavedPackagesList';
import QuoteRequestDialog from '../components/packages/QuoteRequestDialog';

const FREQ_MULTIPLIER = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 0.34, 'one-time': 0 };
const DURATION_DISCOUNTS = { 1: 0, 3: 5, 6: 10, 12: 15 };

export default function PackageBuilder() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [packageName, setPackageName] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [duration, setDuration] = useState(1);
  const [propertyType, setPropertyType] = useState('any');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) {
        setAuthChecked(true);
        return;
      }
      base44.auth.me()
        .then(u => { setUser(u); setAuthChecked(true); })
        .catch(() => setAuthChecked(true));
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

  const { data: savedPackages = [] } = useQuery({
    queryKey: ['customPackages', user?.id],
    queryFn: async () => {
      const all = await base44.entities.CustomPackage.list();
      return all.filter(p => p.customer_id === user.id && p.is_active !== false);
    },
    enabled: !!user?.id,
    initialData: []
  });

  const calcMonthlyPrice = () => {
    let monthly = 0;
    selectedServices.forEach(sel => {
      const svc = services.find(s => s.id === sel.service_id);
      if (!svc) return;
      monthly += svc.price * (FREQ_MULTIPLIER[sel.frequency || 'monthly'] || 1);
    });
    addons.filter(a => selectedAddonIds.includes(a.id)).forEach(a => {
      monthly += a.price;
    });
    return Math.round(monthly * (1 - (DURATION_DISCOUNTS[duration] || 0) / 100));
  };

  const handleToggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.some(s => s.service_id === serviceId)
        ? prev.filter(s => s.service_id !== serviceId)
        : [...prev, { service_id: serviceId, frequency: 'monthly', visits_per_month: 1 }]
    );
  };

  const handleFrequencyChange = (serviceId, frequency) => {
    const visitsMap = { weekly: 4, biweekly: 2, monthly: 1, quarterly: 1, 'one-time': 1 };
    setSelectedServices(prev =>
      prev.map(s => s.service_id === serviceId ? { ...s, frequency, visits_per_month: visitsMap[frequency] || 1 } : s)
    );
  };

  const handleToggleAddon = (addonId) => {
    setSelectedAddonIds(prev => prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]);
  };

  const handleSave = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (!packageName.trim()) { toast.error('Please name your package'); return; }
    if (selectedServices.length === 0) { toast.error('Add at least one service'); return; }

    setSaving(true);
    const data = {
      name: packageName, customer_id: user.id, services: selectedServices,
      addon_ids: selectedAddonIds, property_type: propertyType,
      duration_months: duration, monthly_price: calcMonthlyPrice(), is_active: true,
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

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const monthlyPrice = calcMonthlyPrice();

  return (
    <div className="min-h-screen bg-slate-50">
      <PackageBuilderHero />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Saved Packages (logged-in users only) */}
        {savedPackages.length > 0 && (
          <div className="mb-10">
            <SavedPackagesList packages={savedPackages} services={services} onDelete={handleDelete} onEdit={handleEdit} />
          </div>
        )}

        {/* Builder */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PackageConfigCard
              packageName={packageName} setPackageName={setPackageName}
              propertyType={propertyType} setPropertyType={setPropertyType}
              duration={duration} setDuration={setDuration}
              editingId={editingId}
            />

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Select Services</h2>
              <p className="text-sm text-slate-400 mb-4">Choose services and set how often you need them</p>
              <ServiceSelector
                services={services} categories={categories}
                selectedServices={selectedServices}
                onToggleService={handleToggleService}
                onFrequencyChange={handleFrequencyChange}
              />
            </div>

            <AddonPicker addons={addons} selectedIds={selectedAddonIds} onToggle={handleToggleAddon} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PackagePriceSummary
              selectedServices={selectedServices} services={services}
              selectedAddonIds={selectedAddonIds} addons={addons}
              duration={duration} onRemoveService={handleToggleService}
            />

            <div className="space-y-2.5">
              {/* Request Quote (works for everyone) */}
              <Button
                onClick={() => setQuoteOpen(true)}
                disabled={selectedServices.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-11"
              >
                <Send className="w-4 h-4" /> Request Custom Quote
              </Button>

              {/* Save Package (logged-in users) */}
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving || selectedServices.length === 0 || !packageName.trim()}
                className="w-full gap-2 h-11"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><Save className="w-4 h-4" /> {user ? (editingId ? 'Update Package' : 'Save Package') : 'Sign In & Save'}</>
                }
              </Button>

              {editingId && (
                <Button variant="ghost" onClick={resetForm} className="w-full h-11 text-slate-500">
                  Cancel Editing
                </Button>
              )}
            </div>

            {!user && (
              <p className="text-xs text-center text-slate-400 px-2">
                Sign in to save packages for later or subscribe directly
              </p>
            )}
          </div>
        </div>
      </div>

      <QuoteRequestDialog
        open={quoteOpen} onOpenChange={setQuoteOpen}
        selectedServices={selectedServices} services={services}
        addons={addons} selectedAddonIds={selectedAddonIds}
        duration={duration} propertyType={propertyType}
        monthlyPrice={monthlyPrice}
      />
    </div>
  );
}