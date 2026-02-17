import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const emptyForm = { name: '', description: '', service_id: '', price: '', is_active: true };

export default function AddonFormDialog({ open, onOpenChange, addon, services, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!addon;

  useEffect(() => {
    if (addon?.id) {
      setForm({ ...addon, price: String(addon.price || '') });
    } else if (addon?.service_id) {
      setForm({ ...emptyForm, service_id: addon.service_id });
    } else {
      setForm(emptyForm);
    }
  }, [addon, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      description: form.description || '',
      service_id: form.service_id || '',
      price: parseFloat(form.price),
      is_active: form.is_active,
    }, addon?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Add-on' : 'Add New Add-on'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Add-on Name *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Price (AED) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>Linked Service</Label>
              <Select value={form.service_id || 'all'} onValueChange={val => setForm({ ...form, service_id: val === 'all' ? '' : val })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All services" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services (Global)</SelectItem>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active !== false} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{isEditing ? 'Update Add-on' : 'Create Add-on'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}