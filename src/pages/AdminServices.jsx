import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Clock, Tag, Layers, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import AIServiceCategorizer from '../components/admin/AIServiceCategorizer';
import AIDynamicPricing from '../components/admin/AIDynamicPricing';
import AIBundleRecommendations from '../components/admin/AIBundleRecommendations';

function AdminServicesContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('services');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: '', display_order: 0 });
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    duration_minutes: '',
    image_url: '',
    features: '',
    is_active: true,
    available_for_subscription: true
  });

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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      resetForm();
      toast.success('Service created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      resetForm();
      toast.success('Service updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      toast.success('Service deleted');
    }
  });

  const createCatMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceCategory.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); resetCatForm(); toast.success('Category created'); }
  });
  const updateCatMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceCategory.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); resetCatForm(); toast.success('Category updated'); }
  });
  const deleteCatMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceCategory.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); toast.success('Category deleted'); }
  });

  const resetCatForm = () => { setCatForm({ name: '', slug: '', description: '', icon: '', display_order: 0 }); setEditingCategory(null); setShowCatForm(false); };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      description: '',
      price: '',
      duration_minutes: '',
      image_url: '',
      features: '',
      is_active: true,
      available_for_subscription: true
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      ...service,
      features: service.features?.join('\n') || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes) || 60,
      features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
      slug: formData.name.toLowerCase().replace(/\s+/g, '-')
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Services</h1>
            <p className="text-slate-500">Configure services, pricing, and categories</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'categories' && (
              <Button variant="outline" onClick={() => { setShowCatForm(!showCatForm); setEditingCategory(null); setCatForm({ name: '', slug: '', description: '', icon: '', display_order: 0 }); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            )}
            {activeTab === 'services' && (
              <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="services" className="gap-1.5"><Tag className="w-3.5 h-3.5" /> Services ({services.length})</TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5"><Layers className="w-3.5 h-3.5" /> Categories ({categories.length})</TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Insights</TabsTrigger>
          </TabsList>

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

          <TabsContent value="services" className="mt-6">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price (AED)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_active !== false} onCheckedChange={v => setFormData({...formData, is_active: v})} />
                    <label className="text-sm text-slate-700">Active</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.available_for_subscription !== false} onCheckedChange={v => setFormData({...formData, available_for_subscription: v})} />
                    <label className="text-sm text-slate-700">Available for subscriptions</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Features (one per line)</label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    rows={4}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>

                {/* AI Categorizer */}
                <AIServiceCategorizer
                  serviceName={formData.name}
                  serviceDescription={formData.description}
                  categories={categories}
                  onApply={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                />

                <div className="flex gap-3">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingService ? 'Update Service' : 'Create Service'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge variant={service.is_active ? 'default' : 'secondary'}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-2 line-clamp-2">{service.description}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900">AED {service.price}</span>
                  {service.duration_minutes && (
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration_minutes} min</span>
                  )}
                </div>
                {categories.find(c => c.id === service.category_id) && (
                  <Badge variant="outline" className="text-[10px] mb-3">
                    {categories.find(c => c.id === service.category_id)?.name}
                  </Badge>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(service.id); }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6 space-y-6">
            <AIDynamicPricing
              services={services}
              categories={categories}
              bookings={allBookings}
              providers={allProviders}
            />
            <AIBundleRecommendations
              services={services}
              categories={categories}
              bookings={allBookings}
            />
          </TabsContent>
        </Tabs>
      </div>
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