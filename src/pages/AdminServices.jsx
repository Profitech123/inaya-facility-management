import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StableAdminWrapper from '../components/StableAdminWrapper';
import { STATIC_CATEGORIES, STATIC_SERVICES } from '@/data/services';

function AdminServicesContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
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

  const [seeding, setSeeding] = useState(false);

  const handleSeedAll = async () => {
    if (!confirm('This will create all service categories and services from the template. Existing entries with the same name will be skipped. Continue?')) return;
    
    setSeeding(true);
    try {
      // First, seed categories
      const existingCatNames = new Set(categories.map(c => c.name.toLowerCase()));
      let catsCreated = 0;
      const categoryIdMap = {};
      
      for (const cat of STATIC_CATEGORIES) {
        if (existingCatNames.has(cat.name.toLowerCase())) {
          const existing = categories.find(c => c.name.toLowerCase() === cat.name.toLowerCase());
          categoryIdMap[cat.id] = existing.id;
          continue;
        }
        const created = await base44.entities.ServiceCategory.create({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          display_order: cat.display_order,
          is_active: true
        });
        categoryIdMap[cat.id] = created.id;
        catsCreated++;
      }

      // Then seed services
      const existingServiceNames = new Set(services.map(s => s.name.toLowerCase()));
      let svcsCreated = 0;

      for (const svc of STATIC_SERVICES) {
        if (existingServiceNames.has(svc.name.toLowerCase())) continue;
        await base44.entities.Service.create({
          name: svc.name,
          slug: svc.slug,
          category_id: categoryIdMap[svc.category_id] || svc.category_id,
          description: svc.description,
          price: svc.price,
          duration_minutes: svc.duration_minutes,
          features: svc.features,
          is_active: true,
          available_for_subscription: svc.available_for_subscription,
          image_url: ''
        });
        svcsCreated++;
      }

      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Seeded ${catsCreated} categories and ${svcsCreated} services`);
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed data: ' + (error.message || 'Unknown error'));
    } finally {
      setSeeding(false);
    }
  };

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
            <p className="text-slate-500">Configure your service catalog</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleSeedAll} 
              disabled={seeding}
              className="gap-2"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {seeding ? 'Seeding...' : 'Seed All Services'}
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
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

                <div className="grid md:grid-cols-2 gap-4">
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
                <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                <div className="text-2xl font-bold text-slate-900 mb-4">AED {service.price}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Delete this service?')) {
                        deleteMutation.mutate(service.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminServices() {
  return (
    <StableAdminWrapper>
      <AdminServicesContent />
    </StableAdminWrapper>
  );
}
