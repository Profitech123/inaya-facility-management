import React from 'react';
import { TrendingUp, Package, Calendar, DollarSign } from 'lucide-react';

export default function SubscriptionStats({ subscriptions }) {
  const active = subscriptions.filter(s => s.status === 'active').length;
  const paused = subscriptions.filter(s => s.status === 'paused').length;
  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthly_amount || 0), 0);
  const nextBilling = subscriptions
    .filter(s => s.status === 'active' && s.next_billing_date)
    .map(s => new Date(s.next_billing_date))
    .sort((a, b) => a - b)[0];

  const stats = [
    { label: 'Active Plans', value: active, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Paused Plans', value: paused, icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Monthly Spend', value: `AED ${totalMonthly.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    {
      label: 'Next Billing',
      value: nextBilling ? nextBilling.toLocaleDateString('en-AE', { day: 'numeric', month: 'short' }) : 'N/A',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{s.label}</p>
              <p className="text-lg font-bold text-slate-900 truncate">{s.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}