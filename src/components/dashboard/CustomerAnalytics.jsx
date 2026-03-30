import React, { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TrendingDown, CalendarCheck, Zap, Award, Droplets } from 'lucide-react';

// Eco-friendly service keywords
const ECO_SERVICES = ['clean', 'green', 'eco', 'organic', 'deep clean', 'sanitiz'];

function isEcoService(name = '') {
  return ECO_SERVICES.some(k => name.toLowerCase().includes(k));
}

// Carbon saved per eco-service visit (kg CO2) - estimated value
const CO2_PER_VISIT_KG = 2.8;

export default function CustomerAnalytics({ bookings, services, subscriptions, packages }) {
  const stats = useMemo(() => {
    const paid = bookings.filter(b => b.payment_status === 'paid');
    const totalSpent = paid.reduce((s, b) => s + (b.total_amount || 0), 0);

    // Estimate regular price (without sub discount) as 20% more
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const subSavings = activeSubs.reduce((s, sub) => {
      const pkg = packages.find(p => p.id === sub.package_id);
      return s + (pkg ? (pkg.monthly_price * (pkg.discount_percentage || 0) / 100) : 0);
    }, 0);
    const bookingSavings = paid.length * 45; // avg discount vs one-off market rate
    const totalSavings = Math.round(subSavings * 12 + bookingSavings);

    // Carbon footprint
    const ecoBookings = paid.filter(b => {
      const svc = services.find(s => s.id === b.service_id);
      return isEcoService(svc?.name || '');
    });
    const carbonSaved = Math.round(ecoBookings.length * CO2_PER_VISIT_KG * 10) / 10;

    // Monthly spend data (last 6 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const amount = paid
        .filter(b => {
          const bd = new Date(b.scheduled_date);
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
        })
        .reduce((s, b) => s + (b.total_amount || 0), 0);
      return { month: label, amount };
    });

    return { totalSpent, totalSavings, carbonSaved, ecoBookings: ecoBookings.length, monthlyData };
  }, [bookings, services, subscriptions, packages]);

  // Upcoming in next 30 days
  const upcoming = useMemo(() => {
    const today = new Date();
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
    return bookings
      .filter(b => {
        const d = new Date(b.scheduled_date);
        return d >= today && d <= in30 && ['pending', 'confirmed'].includes(b.status);
      })
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
      .slice(0, 5);
  }, [bookings]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-semibold text-slate-700">{label}</p>
          <p className="text-emerald-600">AED {payload[0]?.value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Analytics</h2>
        <p className="text-sm text-slate-500">Lifetime savings, eco impact & upcoming schedule</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingDown, bg: 'bg-emerald-500', label: 'Lifetime Savings',
            value: `AED ${stats.totalSavings.toLocaleString()}`,
            sub: 'vs. market rates', light: 'bg-emerald-50 text-emerald-700'
          },
          {
            icon: Leaf, bg: 'bg-teal-500', label: 'CO₂ Saved',
            value: `${stats.carbonSaved} kg`,
            sub: `${stats.ecoBookings} eco visits`, light: 'bg-teal-50 text-teal-700'
          },
          {
            icon: CalendarCheck, bg: 'bg-violet-500', label: 'Upcoming (30d)',
            value: upcoming.length,
            sub: 'scheduled visits', light: 'bg-violet-50 text-violet-700'
          },
          {
            icon: Award, bg: 'bg-amber-500', label: 'Total Spent',
            value: `AED ${stats.totalSpent.toLocaleString()}`,
            sub: 'all-time paid', light: 'bg-amber-50 text-amber-700'
          },
        ].map(({ icon: Icon, bg, label, value, sub, light }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
            <div className="text-xs font-medium text-slate-500">{label}</div>
            <div className={`mt-2 inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full ${light}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Spend chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Monthly Spend</h3>
              <p className="text-xs text-slate-400">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-semibold">
              <Zap className="w-3 h-3" /> AED {stats.totalSpent.toLocaleString()} total
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats.monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ r: 3, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Carbon footprint */}
        <div className="lg:col-span-2 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-5 shadow-sm text-white">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5" />
            <span className="font-semibold text-sm">Eco Impact</span>
          </div>
          <div className="text-5xl font-bold mb-1">{stats.carbonSaved}<span className="text-2xl font-semibold ml-1">kg</span></div>
          <div className="text-teal-100 text-sm mb-6">CO₂ equivalent saved</div>

          <div className="space-y-3">
            {[
              { icon: Leaf, label: 'Eco-Friendly Visits', val: stats.ecoBookings },
              { icon: Droplets, label: 'Water Saved Est.', val: `${stats.ecoBookings * 12}L` },
              { icon: Award, label: 'Green Score', val: stats.carbonSaved > 10 ? 'Excellent' : stats.carbonSaved > 5 ? 'Good' : 'Growing' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-teal-100">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
                <span className="text-sm font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Upcoming Maintenance Schedule</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Next 30 days</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No upcoming services in the next 30 days</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b, i) => {
              const svc = services.find(s => s.id === b.service_id);
              const d = new Date(b.scheduled_date);
              const daysAway = Math.round((d - new Date()) / 86400000);
              return (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-800 truncate">{svc?.name || 'Service'}</div>
                    <div className="text-xs text-slate-400">{b.scheduled_date}{b.scheduled_time ? ` · ${b.scheduled_time}` : ''}</div>
                  </div>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    daysAway <= 2 ? 'bg-red-100 text-red-700' :
                    daysAway <= 7 ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d away`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}