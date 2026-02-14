import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

const SPECIALIZATIONS = [
  'AC & HVAC', 'Plumbing', 'Electrical', 'Cleaning', 'Pest Control',
  'Painting', 'Carpentry', 'Landscaping', 'General Maintenance', 'Security Systems',
  'Swimming Pool', 'Fire Safety', 'Elevator Maintenance',
];

export default function StepSpecialization({ provider, onUpdate, onNext, onBack }) {
  const [selectedSpecs, setSelectedSpecs] = useState(provider.specialization || []);
  const [selectedServices, setSelectedServices] = useState(provider.assigned_service_ids || []);
  const [saving, setSaving] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ['allServicesOnboarding'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesOnboarding'],
    queryFn: () => base44.entities.ServiceCategory.list(),
    initialData: [],
    staleTime: 60000,
  });

  const toggleSpec = (spec) => {
    setSelectedSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const toggleService = (id) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({ specialization: selectedSpecs, assigned_service_ids: selectedServices });
    setSaving(false);
    onNext();
  };

  // Group services by category
  const grouped = categories.map(cat => ({
    ...cat,
    services: services.filter(s => s.category_id === cat.id && s.is_active !== false),
  })).filter(g => g.services.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Specializations</h2>
        <p className="text-slate-500 text-sm mt-1">Select your areas of expertise and specific services you can perform</p>
      </div>

      {/* General Specializations */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Areas of Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map(spec => (
            <button
              key={spec}
              onClick={() => toggleSpec(spec)}
              className={`
                px-3.5 py-2 rounded-lg text-sm font-medium border transition-all
                ${selectedSpecs.includes(spec)
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}
              `}
            >
              {selectedSpecs.includes(spec) && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Specific Services */}
      {grouped.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Specific Services You Can Perform</h3>
          <div className="space-y-4">
            {grouped.map(group => (
              <Card key={group.id} className="border-slate-200">
                <CardContent className="pt-4 pb-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{group.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.services.map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`
                          px-3 py-1.5 rounded-md text-xs font-medium border transition-all
                          ${selectedServices.includes(svc.id)
                            ? 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                        `}
                      >
                        {selectedServices.includes(svc.id) && <Check className="w-3 h-3 inline mr-1" />}
                        {svc.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-500">
        <strong className="text-slate-700">{selectedSpecs.length}</strong> specialization(s) and <strong className="text-slate-700">{selectedServices.length}</strong> service(s) selected
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleSave} disabled={saving || selectedSpecs.length === 0} className="bg-emerald-600 hover:bg-emerald-700 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Continue
        </Button>
      </div>
    </div>
  );
}