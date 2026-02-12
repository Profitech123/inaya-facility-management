import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', multiplier: 4 },
  { value: 'biweekly', label: 'Bi-weekly', multiplier: 2 },
  { value: 'monthly', label: 'Monthly', multiplier: 1 },
  { value: 'quarterly', label: 'Quarterly', multiplier: 0.34 },
  { value: 'one-time', label: 'One-time', multiplier: 0 },
];

export default function ServiceSelector({ services, categories, selectedServices, onToggleService, onFrequencyChange }) {
  const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || 'General';

  const grouped = {};
  services.filter(s => s.is_active !== false).forEach(s => {
    const cat = getCategoryName(s.category_id);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const isSelected = (sId) => selectedServices.some(s => s.service_id === sId);
  const getSelected = (sId) => selectedServices.find(s => s.service_id === sId);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, svcs]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{cat}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {svcs.map(service => {
              const selected = isSelected(service.id);
              const selData = getSelected(service.id);
              return (
                <Card
                  key={service.id}
                  className={cn(
                    "transition-all cursor-pointer border-2",
                    selected
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{service.name}</span>
                          {selected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        {service.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{service.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                        AED {service.price}
                      </Badge>
                    </div>

                    {selected ? (
                      <div className="flex items-center gap-2 mt-3">
                        <Select
                          value={selData?.frequency || 'monthly'}
                          onValueChange={(val) => onFrequencyChange(service.id, val)}
                        >
                          <SelectTrigger className="h-8 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FREQUENCIES.map(f => (
                              <SelectItem key={f.value} value={f.value} className="text-xs">
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); onToggleService(service.id); }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 h-8 text-xs gap-1.5"
                        onClick={() => onToggleService(service.id)}
                      >
                        <Plus className="w-3 h-3" /> Add to Package
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}