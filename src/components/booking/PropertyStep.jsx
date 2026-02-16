import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Home, Plus, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PropertyStep({ bookingData, setBookingData, properties, userId, onPropertiesRefetch, onBack, onNext }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newProperty, setNewProperty] = useState({
    property_type: 'villa',
    address: '',
    area: '',
    city: 'Dubai',
    bedrooms: '',
    access_notes: '',
    owner_id: userId
  });

  const handleCreateProperty = async () => {
    if (!newProperty.address) {
      toast.error('Please enter an address');
      return;
    }
    setSaving(true);
    const created = await base44.entities.Property.create({
      ...newProperty,
      bedrooms: newProperty.bedrooms ? Number(newProperty.bedrooms) : undefined,
      owner_id: userId
    });
    setSaving(false);
    setShowAddForm(false);
    setBookingData(prev => ({ ...prev, property_id: created.id }));
    if (onPropertiesRefetch) onPropertiesRefetch();
    toast.success('Property added!');
  };

  const selectedProp = properties.find(p => p.id === bookingData.property_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-600" />
          Property Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Existing properties */}
        {properties.length > 0 && !showAddForm && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Property</label>
            {properties.map(prop => {
              const isSelected = bookingData.property_id === prop.id;
              return (
                <button
                  key={prop.id}
                  onClick={() => setBookingData(prev => ({ ...prev, property_id: prop.id }))}
                  className={cn(
                    "w-full p-4 rounded-xl text-left border-2 transition-all flex items-start gap-3",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Home className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900">{prop.address}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="capitalize">{prop.property_type}</span>
                      {prop.bedrooms && <span>• {prop.bedrooms} BR</span>}
                      {prop.area && <span>• {prop.area}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Add property button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 rounded-xl text-left border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors flex items-center gap-3 text-slate-500 hover:text-emerald-600"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Add New Property</div>
              <div className="text-xs text-slate-400">Register a new location for service</div>
            </div>
          </button>
        )}

        {/* Inline add property form */}
        {showAddForm && (
          <div className="p-5 bg-slate-50 rounded-xl border space-y-4">
            <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> New Property
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Property Type *</label>
                <Select value={newProperty.property_type} onValueChange={v => setNewProperty(p => ({ ...p, property_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Bedrooms</label>
                <Input
                  type="number"
                  value={newProperty.bedrooms}
                  onChange={e => setNewProperty(p => ({ ...p, bedrooms: e.target.value }))}
                  placeholder="e.g. 3"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Address *</label>
              <Input
                value={newProperty.address}
                onChange={e => setNewProperty(p => ({ ...p, address: e.target.value }))}
                placeholder="Building/Villa name, Street"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Area / Community</label>
                <Input
                  value={newProperty.area}
                  onChange={e => setNewProperty(p => ({ ...p, area: e.target.value }))}
                  placeholder="e.g. Dubai Marina"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">City</label>
                <Input value={newProperty.city} onChange={e => setNewProperty(p => ({ ...p, city: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Access Notes</label>
              <Textarea
                value={newProperty.access_notes}
                onChange={e => setNewProperty(p => ({ ...p, access_notes: e.target.value }))}
                placeholder="Gate codes, parking instructions, etc."
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateProperty} disabled={saving}>
                {saving ? 'Saving...' : 'Save & Select'}
              </Button>
            </div>
          </div>
        )}

        {/* Selected property details */}
        {selectedProp && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="text-xs font-medium text-emerald-700 mb-1">Selected Property</div>
            <div className="text-sm font-semibold text-slate-900">{selectedProp.address}</div>
            <div className="text-xs text-slate-600 mt-0.5 capitalize">
              {selectedProp.property_type}{selectedProp.bedrooms ? ` • ${selectedProp.bedrooms} Bedrooms` : ''}{selectedProp.area ? ` • ${selectedProp.area}` : ''}
            </div>
            {selectedProp.access_notes && (
              <div className="text-xs text-slate-500 mt-1 italic">Access: {selectedProp.access_notes}</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!bookingData.property_id}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}