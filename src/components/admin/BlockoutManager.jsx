import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trash2, Loader2, Plus, Clock, Ban } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TIME_SLOTS = [
  'all_day', '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'
];

const REASONS = ['Leave', 'Training', 'Personal', 'Medical', 'Holiday', 'Other'];

export default function BlockoutManager({ open, onClose, provider }) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ date: '', time_slot: 'all_day', reason: 'Leave' });

  const { data: blockouts = [], isLoading } = useQuery({
    queryKey: ['blockouts', provider?.id],
    queryFn: () => base44.entities.TechBlockout.filter({ provider_id: provider.id }, '-date'),
    enabled: !!provider?.id,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TechBlockout.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockouts', provider?.id] });
      toast.success('Block-out time added');
      setForm({ date: '', time_slot: 'all_day', reason: 'Leave' });
      setShowAddForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TechBlockout.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockouts', provider?.id] });
      toast.success('Block-out removed');
    }
  });

  const handleAdd = () => {
    if (!form.date) { toast.error('Please select a date'); return; }
    createMutation.mutate({ ...form, provider_id: provider.id });
  };

  const upcomingBlockouts = blockouts.filter(b => new Date(b.date) >= new Date(new Date().toDateString()));
  const pastBlockouts = blockouts.filter(b => new Date(b.date) < new Date(new Date().toDateString()));

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            Block-out Times — {provider.full_name}
          </DialogTitle>
        </DialogHeader>

        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="gap-2 mb-3">
            <Plus className="w-4 h-4" /> Add Block-out
          </Button>
        ) : (
          <Card className="mb-3">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <Label>Time Slot</Label>
                <Select value={form.time_slot} onValueChange={v => setForm({ ...form, time_slot: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(s => (
                      <SelectItem key={s} value={s}>{s === 'all_day' ? 'All Day' : s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={form.reason} onValueChange={v => setForm({ ...form, reason: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleAdd} disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading && <div className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></div>}

          {upcomingBlockouts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Upcoming</h4>
              <div className="space-y-2">
                {upcomingBlockouts.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-red-50 border-red-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{format(new Date(b.date), 'EEE, MMM d, yyyy')}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {b.time_slot === 'all_day' ? 'All Day' : b.time_slot}
                          {b.reason && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{b.reason}</Badge>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(b.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastBlockouts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Past</h4>
              <div className="space-y-1">
                {pastBlockouts.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg text-slate-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(b.date), 'MMM d')} — {b.time_slot === 'all_day' ? 'All Day' : b.time_slot}</span>
                    {b.reason && <span className="text-xs">({b.reason})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && blockouts.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <Ban className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No block-out times scheduled</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}