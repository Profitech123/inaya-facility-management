import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Receipt, Tag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const FREQ_LABELS = {
  weekly: 'Weekly (4x/mo)',
  biweekly: 'Bi-weekly (2x/mo)',
  monthly: 'Monthly (1x/mo)',
  quarterly: 'Quarterly',
  'one-time': 'One-time',
};

const FREQ_MULTIPLIER = {
  weekly: 4,
  biweekly: 2,
  monthly: 1,
  quarterly: 0.34,
  'one-time': 0,
};

const DURATION_DISCOUNTS = {
  1: 0,
  3: 5,
  6: 10,
  12: 15,
};

export default function PackagePriceSummary({
  selectedServices, services, selectedAddonIds, addons,
  duration, onRemoveService
}) {
  const lineItems = selectedServices.map(sel => {
    const svc = services.find(s => s.id === sel.service_id);
    if (!svc) return null;
    const freq = sel.frequency || 'monthly';
    const mult = FREQ_MULTIPLIER[freq] || 1;
    const isOneTime = freq === 'one-time';
    const monthly = isOneTime ? 0 : svc.price * mult;
    const oneTime = isOneTime ? svc.price : 0;
    return { ...sel, name: svc.name, basePrice: svc.price, monthly, oneTime, freqLabel: FREQ_LABELS[freq] };
  }).filter(Boolean);

  const addonItems = addons.filter(a => selectedAddonIds.includes(a.id));
  const servicesMonthly = lineItems.reduce((s, i) => s + i.monthly, 0);
  const addonsMonthly = addonItems.reduce((s, a) => s + a.price, 0);
  const subtotalMonthly = servicesMonthly + addonsMonthly;
  const oneTimeTotal = lineItems.reduce((s, i) => s + i.oneTime, 0);
  const discountPct = DURATION_DISCOUNTS[duration] || 0;
  const discountAmount = Math.round(subtotalMonthly * discountPct / 100);
  const finalMonthly = subtotalMonthly - discountAmount;

  return (
    <Card className="sticky top-24 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          <CardTitle className="text-base">Package Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lineItems.length === 0 && selectedAddonIds.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-300 text-3xl mb-2">📦</div>
            <p className="text-sm text-slate-400">Add services to start building your package</p>
          </div>
        ) : (
          <>
            {/* Services */}
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-400">{item.freqLabel}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-slate-700">
                    {item.monthly > 0 ? `AED ${item.monthly.toLocaleString()}` : `AED ${item.oneTime} (once)`}
                  </span>
                  <button
                    onClick={() => onRemoveService(item.service_id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Addons */}
            {addonItems.map(addon => (
              <div key={addon.id} className="flex items-center justify-between text-xs text-slate-500">
                <span>+ {addon.name}</span>
                <span>AED {addon.price}/mo</span>
              </div>
            ))}

            {/* Subtotal */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monthly subtotal</span>
                <span className="text-slate-700">AED {subtotalMonthly.toLocaleString()}</span>
              </div>

              {oneTimeTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">One-time services</span>
                  <span className="text-slate-700">AED {oneTimeTotal.toLocaleString()}</span>
                </div>
              )}

              {discountPct > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Tag className="w-3 h-3" />
                    {duration}-month discount ({discountPct}%)
                  </span>
                  <span className="text-emerald-600 font-medium">-AED {discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-emerald-200">
                <span className="text-base font-bold text-slate-900">Total/month</span>
                <span className="text-xl font-bold text-emerald-600">AED {finalMonthly.toLocaleString()}</span>
              </div>

              {duration > 1 && (
                <div className="text-right text-xs text-slate-400">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {duration} months = AED {(finalMonthly * duration).toLocaleString()} total
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}