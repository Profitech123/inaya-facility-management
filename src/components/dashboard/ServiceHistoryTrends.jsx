import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Home, TrendingUp, Clock, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

// Recommended service intervals in days
const SERVICE_INTERVALS = {
  'ac': { label: 'AC Maintenance', days: 90, urgentAt: 120 },
  'pest': { label: 'Pest Control', days: 90, urgentAt: 120 },
  'clean': { label: 'Cleaning', days: 14, urgentAt: 30 },
  'plumb': { label: 'Plumbing', days: 180, urgentAt: 240 },
  'electr': { label: 'Electrical', days: 365, urgentAt: 450 },
  'paint': { label: 'Painting', days: 730, urgentAt: 900 },
  'garden': { label: 'Gardening', days: 30, urgentAt: 45 },
  'pool': { label: 'Pool', days: 30, urgentAt: 45 },
  'security': { label: 'Security', days: 180, urgentAt: 240 },
};

function getServiceInterval(serviceName = '') {
  const name = serviceName.toLowerCase();
  for (const [key, val] of Object.entries(SERVICE_INTERVALS)) {
    if (name.includes(key)) return val;
  }
  return { label: serviceName, days: 180, urgentAt: 270 };
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        <p className="text-emerald-600">{payload[0]?.value} visit{payload[0]?.value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function ServiceHistoryTrends({ bookings, services, properties }) {
  const [expandedProperty, setExpandedProperty] = useState(null);

  // Per-property stats
  const propertyStats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed');

    return properties.map(property => {
      const propBookings = completed.filter(b => b.property_id === property.id);

      // Service frequency: count per service type
      const byService = {};
      for (const b of propBookings) {
        const svc = services.find(s => s.id === b.service_id);
        if (!svc) continue;
        if (!byService[svc.id]) byService[svc.id] = { name: svc.name, count: 0, lastDate: null };
        byService[svc.id].count++;
        if (!byService[svc.id].lastDate || b.scheduled_date > byService[svc.id].lastDate) {
          byService[svc.id].lastDate = b.scheduled_date;
        }
      }

      // Monthly frequency (last 6 months)
      const now = new Date();
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const label = d.toLocaleString('default', { month: 'short' });
        const visits = propBookings.filter(b => {
          const bd = new Date(b.scheduled_date);
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
        }).length;
        return { month: label, visits };
      });

      // Interval suggestions
      const suggestions = Object.values(byService).map(svc => {
        const interval = getServiceInterval(svc.name);
        const sinceLastVisit = daysSince(svc.lastDate);
        const recommended = interval.days;
        const overdue = sinceLastVisit !== null && sinceLastVisit > interval.urgentAt;
        const dueSoon = sinceLastVisit !== null && sinceLastVisit > recommended && !overdue;
        const nextDueDate = svc.lastDate
          ? new Date(new Date(svc.lastDate).getTime() + recommended * 86400000)
            .toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })
          : null;
        return {
          name: svc.name,
          count: svc.count,
          lastDate: svc.lastDate,
          sinceLastVisit,
          recommended,
          overdue,
          dueSoon,
          nextDueDate,
        };
      }).sort((a, b) => {
        // Sort: overdue first, then due soon, then ok
        if (a.overdue && !b.overdue) return -1;
        if (!a.overdue && b.overdue) return 1;
        if (a.dueSoon && !b.dueSoon) return -1;
        if (!a.dueSoon && b.dueSoon) return 1;
        return 0;
      });

      const overdueCount = suggestions.filter(s => s.overdue).length;
      const dueSoonCount = suggestions.filter(s => s.dueSoon).length;

      return {
        property,
        totalVisits: propBookings.length,
        byService,
        monthlyData,
        suggestions,
        overdueCount,
        dueSoonCount,
      };
    }).filter(p => p.totalVisits > 0 || p.property); // show all properties
  }, [bookings, services, properties]);

  // Top services across all properties (for bar chart)
  const topServicesChart = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed');
    const counts = {};
    for (const b of completed) {
      const svc = services.find(s => s.id === b.service_id);
      if (!svc) continue;
      counts[svc.name] = (counts[svc.name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, visits]) => ({ name, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);
  }, [bookings, services]);

  const BAR_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  if (properties.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Service History & Trends</h2>
        <p className="text-sm text-slate-500">Maintenance frequency per property with smart interval suggestions</p>
      </div>

      {/* Top Services Bar Chart */}
      {topServicesChart.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Most Used Services</h3>
              <p className="text-xs text-slate-400">Completed visits, all properties</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 px-3 py-1 rounded-full font-semibold">
              <TrendingUp className="w-3 h-3" />
              All time
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topServicesChart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v}
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visits" radius={[6, 6, 0, 0]}>
                {topServicesChart.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-Property Cards */}
      <div className="space-y-3">
        {propertyStats.map(({ property, totalVisits, monthlyData, suggestions, overdueCount, dueSoonCount }) => {
          const isExpanded = expandedProperty === property.id;
          const alertCount = overdueCount + dueSoonCount;

          return (
            <div key={property.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Property Header */}
              <button
                onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 truncate">
                      {property.address}
                    </div>
                    <div className="text-xs text-slate-400 capitalize">
                      {property.area ? `${property.area} · ` : ''}{property.property_type}
                      {property.bedrooms ? ` · ${property.bedrooms} bed` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {totalVisits} visit{totalVisits !== 1 ? 's' : ''}
                    </span>
                    {overdueCount > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                        {overdueCount} overdue
                      </span>
                    )}
                    {dueSoonCount > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                        {dueSoonCount} due soon
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 space-y-5">
                  {/* Mini monthly freq chart */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">Visits per Month (Last 6 Months)</span>
                    </div>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={monthlyData} margin={{ top: 2, right: 5, bottom: 0, left: -25 }} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Interval suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">Service Interval Suggestions</span>
                      </div>
                      <div className="space-y-2">
                        {suggestions.map(sug => (
                          <div
                            key={sug.name}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                              sug.overdue
                                ? 'bg-red-50 border-red-200'
                                : sug.dueSoon
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {sug.overdue ? (
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              ) : sug.dueSoon ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800 truncate">{sug.name}</div>
                                <div className="text-xs text-slate-400">
                                  {sug.count} visit{sug.count !== 1 ? 's' : ''} ·{' '}
                                  {sug.lastDate
                                    ? `Last: ${new Date(sug.lastDate).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}`
                                    : 'No visits yet'}
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              {sug.overdue ? (
                                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap">
                                  {sug.sinceLastVisit}d overdue
                                </span>
                              ) : sug.dueSoon ? (
                                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full whitespace-nowrap">
                                  Due soon
                                </span>
                              ) : sug.nextDueDate ? (
                                <span className="text-xs text-slate-500 whitespace-nowrap">
                                  Next: {sug.nextDueDate}
                                </span>
                              ) : null}
                              <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                                Rec. every {sug.recommended}d
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-400">
                      No completed services yet for this property.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}