import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'];

function AdminServiceAreasContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ area_name: '', emirate: 'Dubai', service_fee: '0', delivery_time: 'Same day', is_active: true });
  const [filterEmirate, setFilterEmirate] = useState('all');

  const { data: areas = [] } = useQuery({
    queryKey: ['serviceAreas'], queryFn: () => base44.entities.ServiceArea.list('area_name'), initialData: [], staleTime: 30000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceArea.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['serviceAreas']); setShowForm(false); toast.success('Area created'); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceArea.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['serviceAreas']); setShowForm(false); setEditing(null); toast.success('Area updated'); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceArea.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['serviceAreas']); toast.success('Area deleted'); }
  });

  const handleSubmit = () => {
    const data = { ...form, service_fee: parseFloat(form.service_fee) || 0 };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const openEdit = (area) => {
    setEditing(area);
    setForm({ area_name: area.area_name, emirate: area.emirate, service_fee: String(area.service_fee || 0), delivery_time: area.delivery_time || 'Same day', is_active: area.is_active !== false });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ area_name: '', emirate: 'Dubai', service_fee: '0', delivery_time: 'Same day', is_active: true });
    setShowForm(true);
  };

  const filtered = areas.filter(a => filterEmirate === 'all' || a.emirate === filterEmirate);
  const activeCount = areas.filter(a => a.is_active !== false).length;
  const emirateCounts = EMIRATES.map(e => ({ name: e, count: areas.filter(a => a.emirate === e).length })).filter(e => e.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Areas</h1>
          <p className="text-slate-500">Manage coverage zones, delivery times, and area-specific fees</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={openNew}>
          <Plus className="w-4 h-4" /> Add Area
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold text-slate-900">{areas.length}</div><div className="text-xs text-slate-500">Total Areas</div></div></div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-emerald-600" /></div>
          <div><div className="text-2xl font-bold text-slate-900">{activeCount}</div><div className="text-xs text-slate-500">Active Areas</div></div></div>
        </CardContent></Card>
        {emirateCounts.slice(0, 2).map(e => (
          <Card key={e.name}><CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{e.count}</div>
            <div className="text-xs text-slate-500">{e.name} areas</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterEmirate} onValueChange={setFilterEmirate}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emirates</SelectItem>
            {EMIRATES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-500">{filtered.length} areas</span>
      </div>

      {/* Areas Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(area => (
          <Card key={area.id} className={`hover:shadow-md transition ${area.is_active === false ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{area.area_name}</h3>
                  <div className="text-xs text-slate-400">{area.emirate}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={area.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                    {area.is_active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Fee: AED {area.service_fee || 0}</span>
                </div>
                <span className="text-xs text-slate-400">{area.delivery_time || '—'}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => openEdit(area)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7 text-red-600 hover:bg-red-50" onClick={() => { if (confirm('Delete this area?')) deleteMutation.mutate(area.id); }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No service areas found</div>}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Area' : 'Add Service Area'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Area Name</Label><Input value={form.area_name} onChange={e => setForm({ ...form, area_name: e.target.value })} placeholder="e.g. Dubai Marina" /></div>
            <div><Label>Emirate</Label>
              <Select value={form.emirate} onValueChange={v => setForm({ ...form, emirate: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EMIRATES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Service Fee (AED)</Label><Input type="number" value={form.service_fee} onChange={e => setForm({ ...form, service_fee: e.target.value })} /></div>
              <div><Label>Delivery Time</Label><Input value={form.delivery_time} onChange={e => setForm({ ...form, delivery_time: e.target.value })} placeholder="e.g. Same day" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={!form.area_name}>
              {editing ? 'Update Area' : 'Create Area'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminServiceAreas() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminServiceAreasContent />
    </AuthGuard>
  );
}