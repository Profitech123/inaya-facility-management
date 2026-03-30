import React from 'react';

export default function BillingToggle({ billing, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
      <button
        onClick={() => onChange(billing === 'monthly' ? 'yearly' : 'monthly')}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${billing === 'yearly' ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${billing === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
      <span className={`text-sm font-medium ${billing === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
        Yearly
        <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">Save 15%</span>
      </span>
    </div>
  );
}