import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, PackagePlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import { logAuditEvent } from '../components/admin/AuditLogger';
import ServiceFormDialog from '../components/admin/ServiceFormDialog';
import AddonFormDialog from '../components/admin/AddonFormDialog';
import ServiceCard from '../components/admin/ServiceCard';
import AddonTable from '../components/admin/AddonTable';

function AdminServicesContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('services');
  const [search, setSearch] = useState('');

  // Service dialog state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Addon dialog state
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [prefilledServiceId, setPrefilledServiceId] = useState('');

  // Data fetching
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.ServiceCategory.list(),
    initialData: [],
  });

  const { data: addons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: () => base44.entities.ServiceAddon.list(),
    initialData: [],
  });

  // Service mutations
  const createServiceMut = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      logAuditEvent({ action: 'service_created', entity_type: 'Service', entity_id: '-', details: `Service "${vars.name}" created` });
      toast.success('Service created');
    }
  });

  const updateServiceMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      logAuditEvent({ action: 'service_updated', entity_type: 'Service', entity_id: vars.id, details: `Service "${vars.data.name}" updated` });
      toast.success('Service updated');
    }
  });

  const deleteServiceMut = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      const svc = services.find(s => s.id === id);
      logAuditEvent({ action: 'service_deleted', entity_type: 'Service', entity_id: id, details: `Service "${svc?.name || id}" deleted` });
      toast.success('Service deleted');
    }
  });

  // Addon mutations
  const createAddonMut = useMutation({
    mutationFn: (data) => base44.entities.ServiceAddon.create(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      logAuditEvent({ action: 'addon_created', entity_type: 'ServiceAddon', entity_id: '-', details: `Add-on "${vars.name}" created` });
      toast.success('Add-on created');
    }
  });

  const updateAddonMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceAddon.update(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      logAuditEvent({ action: 'addon_updated', entity_type: 'ServiceAddon', entity_id: vars.id, details: `Add-on "${vars.data.name}" updated` });
      toast.success('Add-on updated');
    }
  });

  const deleteAddonMut = useMutation({
    mutationFn: (id) => base44.entities.ServiceAddon.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('Add-on deleted');
    }
  });

  // Handlers
  const handleSaveService = (data, id) => {
    if (id) {
      updateServiceMut.mutate({ id, data });
    } else {
      createServiceMut.mutate(data);
    }
    setServiceDialogOpen(false);
    setEditingService(null);
  };

  const handleSaveAddon = (data, id) => {
    if (id) {
      updateAddonMut.mutate({ id, data });
    } else {
      createAddonMut.mutate(data);
    }
    setAddonDialogOpen(false);
    setEditingAddon(null);
  };

  const openNewService = () => { setEditingService(null); setServiceDialogOpen(true); };
  const openEditService = (svc) => { setEditingService(svc); setServiceDialogOpen(true); };
  const openNewAddon = (serviceId) => { setEditingAddon(null); setPrefilledServiceId(serviceId || ''); setAddonDialogOpen(true); };
  const openEditAddon = (addon) => { setEditingAddon(addon); setAddonDialogOpen(true); };
  const openServiceAddons = (serviceId) => { setPrefilledServiceId(serviceId); setActiveTab('addons'); };

  // Filtered data
  const filteredServices = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase();
    return services.filter(s => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [services, search]);

  const filteredAddons = useMemo(() => {
    if (!search) return addons;
    const q = search.toLowerCase();
    return addons.filter(a => a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [addons, search]);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '';
  const getAddonCount = (serviceId) => addons.filter(a => a.service_id === serviceId || !a.service_id).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Services</h1>
            <p className="text-slate-500 text-sm">Configure services, pricing, and add-ons</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 w-56"
              />
            </div>
            {activeTab === 'services' && (
              <Button onClick={openNewService} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" /> New Service
              </Button>
            )}
            {activeTab === 'addons' && (
              <Button onClick={() => openNewAddon('')} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" /> New Add-on
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-slate-500">Total Services</p>
            <p className="text-2xl font-bold text-slate-900">{services.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-slate-500">Active Services</p>
            <p className="text-2xl font-bold text-emerald-600">{services.filter(s => s.is_active !== false).length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-slate-500">Total Add-ons</p>
            <p className="text-2xl font-bold text-slate-900">{addons.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-slate-500">Categories</p>
            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="services" className="gap-1.5"><Tag className="w-3.5 h-3.5" /> Services</TabsTrigger>
            <TabsTrigger value="addons" className="gap-1.5"><PackagePlus className="w-3.5 h-3.5" /> Add-ons</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            {filteredServices.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">{search ? 'No services match your search' : 'No services yet'}</p>
                {!search && <Button variant="link" onClick={openNewService} className="text-emerald-600 mt-1">Create your first service</Button>}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredServices.map(svc => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    categoryName={getCategoryName(svc.category_id)}
                    addonCount={addons.filter(a => a.service_id === svc.id).length}
                    onEdit={() => openEditService(svc)}
                    onDelete={() => deleteServiceMut.mutate(svc.id)}
                    onManageAddons={() => openServiceAddons(svc.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addons" className="mt-6">
            {/* If coming from a specific service, show filter */}
            {prefilledServiceId && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="gap-1 py-1 px-3">
                  Showing add-ons for: {services.find(s => s.id === prefilledServiceId)?.name || 'Selected Service'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setPrefilledServiceId('')} className="text-xs">Show All</Button>
              </div>
            )}
            <AddonTable
              addons={prefilledServiceId ? filteredAddons.filter(a => a.service_id === prefilledServiceId || !a.service_id) : filteredAddons}
              services={services}
              onEdit={openEditAddon}
              onDelete={(id) => deleteAddonMut.mutate(id)}
              onCreate={() => openNewAddon(prefilledServiceId)}
            />
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
        onOpenChange={(open) => { setAddonDialogOpen(open); if (!open) setEditingAddon(null); }}
        addon={editingAddon || (prefilledServiceId ? { service_id: prefilledServiceId } : null)}
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