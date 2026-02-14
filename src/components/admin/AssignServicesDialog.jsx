import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AssignServicesDialog({ open, onClose, provider }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: services = [] } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const list = await base44.entities.Service.list();
      return list.filter(s => s.is_active !== false);
    },
    initialData: []
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => base44.entities.ServiceCategory.list(),
    initialData: []
  });

  useEffect(() => {
    if (provider) {
      setSelectedIds(provider.assigned_service_ids || []);
    }
  }, [provider]);

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Provider.update(provider.id, { assigned_service_ids: selectedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success('Service assignments updated');
      onClose();
    }
  });

  const toggleService = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectAllInCategory = (catId) => {
    const catServiceIds = services.filter(s => s.category_id === catId).map(s => s.id);
    const allSelected = catServiceIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !catServiceIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...catServiceIds])]);
    }
  };

  const filteredServices = services.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = categories.map(cat => ({
    ...cat,
    services: filteredServices.filter(s => s.category_id === cat.id)
  })).filter(g => g.services.length > 0);

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Services — {provider.full_name}</DialogTitle>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="pl-10" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {grouped.map(group => {
            const allInGroupSelected = group.services.every(s => selectedIds.includes(s.id));
            return (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{group.name}</h4>
                  <button onClick={() => selectAllInCategory(group.id)} className="text-[10px] text-emerald-600 hover:underline">
                    {allInGroupSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="space-y-1">
                  {group.services.map(svc => {
                    const isSelected = selectedIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left text-sm transition-colors ${
                          isSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="flex-1 truncate">{svc.name}</span>
                        {svc.price && <span className="text-xs text-slate-400">AED {svc.price}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {grouped.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No services found</p>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t mt-3">
          <Badge variant="outline">{selectedIds.length} service{selectedIds.length !== 1 ? 's' : ''} selected</Badge>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save Assignments
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}