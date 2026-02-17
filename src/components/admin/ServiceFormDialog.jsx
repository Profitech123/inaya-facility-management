import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const emptyForm = {
  name: '', category_id: '', description: '', price: '', duration_minutes: '', image_url: '', features: '', is_active: true, available_for_subscription: true
};

export default function ServiceFormDialog({ open, onOpenChange, service, categories, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!service;

  useEffect(() => {
    if (service) {
      setForm({ ...service, price: String(service.price || ''), duration_minutes: String(service.duration_minutes || ''), features: service.features?.join('\n') || '' });
    } else {
      setForm(emptyForm);
    }
  }, [service, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes) || 60,
      features: form.features ? form.features.split('\n').filter(f => f.trim()) : [],
      slug: form.name.toLowerCase().replace(/\s+/g, '-'),
    }, service?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Service Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category_id} onValueChange={val => setForm({ ...form, category_id: val })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Price (AED) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Features (one per line)</Label>
            <Textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={3} className="mt-1" placeholder="Feature 1&#10;Feature 2" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active !== false} onCheckedChange={v => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.available_for_subscription !== false} onCheckedChange={v => setForm({ ...form, available_for_subscription: v })} />
              <Label>Available for subscriptions</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{isEditing ? 'Update Service' : 'Create Service'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}