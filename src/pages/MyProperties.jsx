import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';

function MyPropertiesContent() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    property_type: 'villa',
    address: '',
    area: '',
    bedrooms: '',
    square_meters: '',
    access_notes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = '/');
  }, []);

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.email],
    queryFn: () => base44.entities.Property.filter({ owner_id: user?.id }),
    enabled: !!user,
    initialData: []
  });

  const createPropertyMutation = useMutation({
    mutationFn: (data) => base44.entities.Property.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myProperties']);
      setShowForm(false);
      setFormData({ property_type: 'villa', address: '', area: '', bedrooms: '', square_meters: '', access_notes: '' });
      toast.success('Property added successfully!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPropertyMutation.mutate({
      ...formData,
      bedrooms: parseInt(formData.bedrooms),
      square_meters: parseFloat(formData.square_meters),
      owner_id: user.id
    });
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Properties</h1>
              <p className="text-slate-300">Manage your properties and service locations.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Property</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                    <Select value={formData.property_type} onValueChange={(val) => setFormData({...formData, property_type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Area/Community</label>
                    <Input
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      placeholder="e.g., Arabian Ranches"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full property address"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bedrooms</label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Square Meters</label>
                    <Input
                      type="number"
                      value={formData.square_meters}
                      onChange={(e) => setFormData({...formData, square_meters: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Access Notes</label>
                  <Textarea
                    value={formData.access_notes}
                    onChange={(e) => setFormData({...formData, access_notes: e.target.value})}
                    placeholder="Gate codes, parking instructions, etc."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Save Property
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {properties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-4">No properties added yet</p>
              <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {properties.map(property => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl capitalize">{property.property_type}</CardTitle>
                        <p className="text-sm text-slate-500">{property.area}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                    <p className="text-slate-700">{property.address}</p>
                  </div>
                  {property.bedrooms && (
                    <p className="text-sm text-slate-600">Bedrooms: {property.bedrooms}</p>
                  )}
                  {property.square_meters && (
                    <p className="text-sm text-slate-600">Area: {property.square_meters} sqm</p>
                  )}
                  {property.access_notes && (
                    <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                      {property.access_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyProperties() {
  return (
    <AuthGuard requiredRole="customer">
      <MyPropertiesContent />
    </AuthGuard>
  );
}