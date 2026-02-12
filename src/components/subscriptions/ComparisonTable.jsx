import React from 'react';

const FEATURES = [
  { label: 'AC Maintenance', values: ['2x Yearly', '4x Yearly', 'Monthly Checkups'] },
  { label: 'Plumbing & Electrical', values: ['Standard Callouts', 'Unlimited Callouts', 'Unlimited + Priority'] },
  { label: 'Handyman Services', values: ['—', '2 Sessions / Year', 'Unlimited'] },
  { label: 'Pest Control', values: ['—', 'Standard (Quarterly)', 'Premium (As Needed)'] },
  { label: 'Emergency Support', values: ['Business Hours', 'Business Hours', '24/7 Dedicated Line'] },
  { label: 'Spare Parts Discount', values: ['5% Off', '15% Off', '25% Off'] },
];

export default function ComparisonTable({ packages }) {
  const sorted = [...packages].sort((a, b) => (a.monthly_price || 0) - (b.monthly_price || 0));
  const planNames = sorted.map(p => p.name);

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Compare Plan Benefits</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-4 pr-4 text-[10px] font-bold text-slate-400 tracking-wider w-[200px]">
                SERVICE FEATURES
              </th>
              {planNames.map((name, i) => (
                <th key={i} className={`text-left py-4 px-4 text-sm font-bold ${i === 1 ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-4 pr-4 text-sm font-medium text-slate-700">{feature.label}</td>
                {feature.values.map((val, j) => (
                  <td key={j} className={`py-4 px-4 text-sm ${val === '—' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}