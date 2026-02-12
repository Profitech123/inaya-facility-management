import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function AddonPicker({ addons, selectedIds, onToggle }) {
  if (addons.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Add-ons</h3>
      <div className="space-y-2">
        {addons.map(addon => {
          const checked = selectedIds.includes(addon.id);
          return (
            <label
              key={addon.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                checked ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <Checkbox checked={checked} onCheckedChange={() => onToggle(addon.id)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800">{addon.name}</div>
                {addon.description && <div className="text-xs text-slate-400">{addon.description}</div>}
              </div>
              <span className="text-sm font-semibold text-emerald-600 flex-shrink-0">+AED {addon.price}/mo</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}