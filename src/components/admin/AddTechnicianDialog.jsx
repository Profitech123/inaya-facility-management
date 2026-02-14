import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Provider.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success('Technician added successfully');
      setForm({ full_name: '', email: '', phone: '', specialization: [] });
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