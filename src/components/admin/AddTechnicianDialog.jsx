import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SPECIALIZATIONS = [
  'AC Maintenance', 'Plumbing', 'Electrical', 'Cleaning',
  'Pest Control', 'Landscaping', 'Pool Maintenance', 'General Maintenance',
  'Fire Safety', 'MEP', 'Painting', 'Carpentry'
];

export default function AddTechnicianDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialization: [],
    assigned_service_ids: [],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const list = await base44.entities.Service.list();
      return list.filter(s => s.is_active !== false);
    },
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Provider.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success('Technician added successfully');
      setForm({ full_name: '', email: '', phone: '', specialization: [], assigned_service_ids: [] });
      onClose();
    },
  });

  const toggleSpec = (spec) => {
    setForm(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      ...form,
      is_active: true,
      average_rating: 0,
      total_jobs_completed: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Technician</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Ahmed Khan"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. ahmed@inaya.ae"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +971 50 123 4567"
            />
          </div>
          <div>
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.specialization.includes(spec)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {spec}
                  {form.specialization.includes(spec) && <X className="w-3 h-3 inline ml-1" />}
                </button>
              ))}
            </div>
          </div>
          {services.length > 0 && (
            <div>
              <Label>Assign Services (optional)</Label>
              <div className="max-h-32 overflow-y-auto mt-2 space-y-1 border rounded-lg p-2">
                {services.map(svc => {
                  const isSelected = form.assigned_service_ids.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        assigned_service_ids: isSelected
                          ? prev.assigned_service_ids.filter(id => id !== svc.id)
                          : [...prev.assigned_service_ids, svc.id]
                      }))}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {svc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={createMutation.isPending}>
              {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Adding...</> : 'Add Technician'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}