import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Tag, Layers, Sparkles, PackagePlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import AIServiceCategorizer from '../components/admin/AIServiceCategorizer';
import AIDynamicPricing from '../components/admin/AIDynamicPricing';
import AIBundleRecommendations from '../components/admin/AIBundleRecommendations';
import { logAuditEvent } from '../components/admin/AuditLogger';
import ServiceFormDialog from '../components/admin/ServiceFormDialog';
import AddonFormDialog from '../components/admin/AddonFormDialog';
import ServiceCard from '../components/admin/ServiceCard';
import AddonTable from '../components/admin/AddonTable';

function AdminServicesContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');

  // Service dialog state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Addon dialog state
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonPresetServiceId, setAddonPresetServiceId] = useState('');

  // Category form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: '', display_order: 0 });

  // Queries
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.ServiceCategory.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: addons = [] } = useQuery({
    queryKey: ['service-addons'],
    queryFn: () => base44.entities.ServiceAddon.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['admin-bookings-for-pricing'],
    queryFn: () => base44.entities.Booking.list('-created_date', 200),
    initialData: [],
    staleTime: 120000
  });

  const { data: allProviders = [] } = useQuery({
    queryKey: ['admin-providers-for-pricing'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
    staleTime: 120000
  });

  // Service mutations
  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['services']);
      logAuditEvent({ action: 'service_created', entity_type: 'Service', entity_id: '-', details: `Service "${variables.name}" created at AED ${variables.price}` });
      toast.success('Service created');
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['services']);
      logAuditEvent({ action: 'service_updated', entity_type: 'Service', entity_id: variables.id, details: `Service "${variables.data.name}" updated` });
      toast.success('Service updated');
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['services']);
      const svc = services.find(s => s.id === id);
      logAuditEvent({ action: 'service_deleted', entity_type: 'Service', entity_id: id, details: `Service "${svc?.name || id}" deleted` });
      toast.success('Service deleted');
    }
  });

  // Addon mutations
  const createAddonMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceAddon.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['service-addons']);
      logAuditEvent({ action: 'addon_created', entity_type: 'ServiceAddon', entity_id: '-', details: `Add-on "${variables.name}" created at AED ${variables.price}` });
      toast.success('Add-on created');
    }
  });

  const updateAddonMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceAddon.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['service-addons']);
      logAuditEvent({ action: 'addon_updated', entity_type: 'ServiceAddon', entity_id: variables.id, details: `Add-on "${variables.data.name}" updated` });
      toast.success('Add-on updated');
    }
  });

  const deleteAddonMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceAddon.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['service-addons']);
      logAuditEvent({ action: 'addon_deleted', entity_type: 'ServiceAddon', entity_id: id, details: `Add-on deleted` });
      toast.success('Add-on deleted');
    }
  });

  // Category mutations
  const createCatMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceCategory.create(data),
    onSuccess: (_, variables) => { queryClient.invalidateQueries(['categories']); logAuditEvent({ action: 'category_created', entity_type: 'ServiceCategory', entity_id: '-', details: `Category "${variables.name}" created` }); resetCatForm(); toast.success('Category created'); }
  });
  const updateCatMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceCategory.update(id, data),
    onSuccess: (_, variables) => { queryClient.invalidateQueries(['categories']); logAuditEvent({ action: 'category_updated', entity_type: 'ServiceCategory', entity_id: variables.id, details: `Category "${variables.data.name}" updated` }); resetCatForm(); toast.success('Category updated'); }
  });
  const deleteCatMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceCategory.delete(id),
    onSuccess: (_, id) => { const cat = categories.find(c => c.id === id); queryClient.invalidateQueries(['categories']); logAuditEvent({ action: 'category_deleted', entity_type: 'ServiceCategory', entity_id: id, details: `Category "${cat?.name || id}" deleted` }); toast.success('Category deleted'); }
  });

  const resetCatForm = () => { setCatForm({ name: '', slug: '', description: '', icon: '', display_order: 0 }); setEditingCategory(null); setShowCatForm(false); };

  // Handlers
  const handleSaveService = (data, id) => {
    if (id) {
      updateServiceMutation.mutate({ id, data });
    } else {
      createServiceMutation.mutate(data);
    }
    setServiceDialogOpen(false);
    setEditingService(null);
  };

  const handleSaveAddon = (data, id) => {
    if (id) {
      updateAddonMutation.mutate({ id, data });
    } else {
      createAddonMutation.mutate(data);
    }
    setAddonDialogOpen(false);
    setEditingAddon(null);
    setAddonPresetServiceId('');
  };

  const openAddonForService = (serviceId) => {
    setAddonPresetServiceId(serviceId);
    setEditingAddon(null);
    setAddonDialogOpen(true);
  };

  // Filtered services
  const filteredServices = services.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Services</h1>
            <p className="text-slate-500">Configure services, add-ons, and categories</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'categories' && (
              <Button variant="outline" onClick={() => { setShowCatForm(!showCatForm); setEditingCategory(null); setCatForm({ name: '', slug: '', description: '', icon: '', display_order: 0 }); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            )}
            {activeTab === 'addons' && (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditingAddon(null); setAddonPresetServiceId(''); setAddonDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Add-on
              </Button>
            )}
            {activeTab === 'services' && (
              <Button onClick={() => { setEditingService(null); setServiceDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="services" className="gap-1.5"><Tag className="w-3.5 h-3.5" /> Services ({services.length})</TabsTrigger>
            <TabsTrigger value="addons" className="gap-1.5"><PackagePlus className="w-3.5 h-3.5" /> Add-ons ({addons.length})</TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5"><Layers className="w-3.5 h-3.5" /> Categories ({categories.length})</TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Insights</TabsTrigger>
          </TabsList>

          {/* === SERVICES TAB === */}
          <TabsContent value="services" className="mt-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  categoryName={categories.find(c => c.id === service.category_id)?.name}
                  addonCount={addons.filter(a => a.service_id === service.id || !a.service_id).length}
                  onEdit={() => { setEditingService(service); setServiceDialogOpen(true); }}
                  onDelete={() => deleteServiceMutation.mutate(service.id)}
                  onManageAddons={() => { setActiveTab('addons'); }}
                />
              ))}
              {filteredServices.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No services found.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* === ADD-ONS TAB === */}
          <TabsContent value="addons" className="mt-6">
            <AddonTable
              addons={addons}
              services={services}
              onCreate={() => { setEditingAddon(null); setAddonPresetServiceId(''); setAddonDialogOpen(true); }}
              onEdit={(addon) => { setEditingAddon(addon); setAddonDialogOpen(true); }}
              onDelete={(id) => deleteAddonMutation.mutate(id)}
            />
          </TabsContent>

          {/* === CATEGORIES TAB === */}
          <TabsContent value="categories" className="mt-6">
            {showCatForm && (
              <Card className="mb-6">
                <CardHeader><CardTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                      <Input value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} placeholder="e.g. hard-services" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Icon (lucide name)</label>
                      <Input value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="e.g. Wrench" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                      <Input type="number" value={catForm.display_order} onChange={e => setCatForm({ ...catForm, display_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <Textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      const data = { ...catForm, slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-') };
                      editingCategory ? updateCatMutation.mutate({ id: editingCategory.id, data }) : createCatMutation.mutate(data);
                    }}>{editingCategory ? 'Update' : 'Create'}</Button>
                    <Button variant="outline" onClick={resetCatForm}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <Card key={cat.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                      <Badge variant="outline" className="text-[10px]">Order: {cat.display_order || 0}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Slug: {cat.slug}</p>
                    {cat.description && <p className="text-sm text-slate-600 mb-3">{cat.description}</p>}
                    <p className="text-xs text-slate-400 mb-3">{services.filter(s => s.category_id === cat.id).length} services</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingCategory(cat); setCatForm(cat); setShowCatForm(true); }}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => { if (confirm('Delete category?')) deleteCatMutation.mutate(cat.id); }}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* === AI INSIGHTS TAB === */}
          <TabsContent value="ai-insights" className="mt-6 space-y-6">
            <AIDynamicPricing services={services} categories={categories} bookings={allBookings} providers={allProviders} />
            <AIBundleRecommendations services={services} categories={categories} bookings={allBookings} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ServiceFormDialog
        open={serviceDialogOpen}
        onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) setEditingService(null); }}
        service={editingService}
        categories={categories}
        onSave={handleSaveService}
      />
      <AddonFormDialog
        open={addonDialogOpen}
        onOpenChange={(open) => { setAddonDialogOpen(open); if (!open) { setEditingAddon(null); setAddonPresetServiceId(''); } }}
        addon={editingAddon || (addonPresetServiceId ? { service_id: addonPresetServiceId } : null)}
        services={services}
        onSave={handleSaveAddon}
      />
    </div>
  );
}

export default function AdminServices() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminServicesContent />
    </AuthGuard>
  );
}