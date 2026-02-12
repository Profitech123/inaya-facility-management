import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Checkbox } from '@/components/ui/checkbox';

export default function AddonSelector({ serviceId, selectedIds, onChange }) {
  const { data: addons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: () => base44.entities.ServiceAddon.filter({ is_active: true }),
    initialData: []
  });

  // Show addons linked to this service OR generic (no service_id)
  const available = addons.filter(a => !a.service_id || a.service_id === serviceId);

  if (available.length === 0) return null;

  const toggle = (id) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  const totalAddonPrice = available
    .filter(a => selectedIds.includes(a.id))
    .reduce((s, a) => s + a.price, 0);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-3">Add-ons (optional)</label>
      <div className="space-y-3">
        {available.map(addon => (
          <label key={addon.id}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedIds.includes(addon.id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
            <Checkbox
              checked={selectedIds.includes(addon.id)}
              onCheckedChange={() => toggle(addon.id)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-slate-900">{addon.name}</span>
                <span className="text-sm font-semibold text-emerald-600">+AED {addon.price}</span>
              </div>
              {addon.description && (
                <p className="text-xs text-slate-500 mt-0.5">{addon.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {totalAddonPrice > 0 && (
        <div className="mt-3 text-right text-sm text-slate-600">
          Add-ons subtotal: <span className="font-semibold text-slate-900">AED {totalAddonPrice}</span>
        </div>
      )}
    </div>
  );
}