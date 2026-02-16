import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wrench, MapPin } from 'lucide-react';

export default function TechnicianUtilization({ providers, bookings, services }) {
  const data = useMemo(() => {
    if (!providers.length) return { chartData: [], summary: null };

    const serviceMap = {};
    services.forEach(s => { serviceMap[s.id] = s; });

    // Working hours assumption: 8h/day, ~22 working days/month = 176 hrs/month
    const MONTHLY_HOURS = 176;
    const TRAVEL_AVG_MIN = 35; // avg travel time per job in minutes

    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const techData = providers.filter(p => p.is_active !== false).map(p => {
      const techBookings = bookings.filter(b => 
        b.assigned_provider_id === p.id && 
        b.created_date && 
        new Date(b.created_date) >= monthAgo
      );

      const completedBookings = techBookings.filter(b => b.status === 'completed');
      const totalBookings = techBookings.length;

      // Calculate service hours
      let serviceMinutes = 0;
      completedBookings.forEach(b => {
        const svc = serviceMap[b.service_id];
        serviceMinutes += svc?.duration_minutes || 60;
      });

      const serviceHours = serviceMinutes / 60;
      const travelHours = (completedBookings.length * TRAVEL_AVG_MIN) / 60;
      const totalActiveHours = serviceHours + travelHours;
      const utilization = MONTHLY_HOURS > 0 ? Math.min(100, Math.round((totalActiveHours / MONTHLY_HOURS) * 100)) : 0;
      const travelPct = totalActiveHours > 0 ? Math.round((travelHours / totalActiveHours) * 100) : 0;
      const completionRate = totalBookings > 0 ? Math.round((completedBookings.length / totalBookings) * 100) : 0;

      return {
        name: p.full_name?.split(' ')[0] || 'Tech',
        fullName: p.full_name || 'Unknown',
        utilization,
        serviceHours: Math.round(serviceHours),
        travelHours: Math.round(travelHours),
        travelPct,
        totalJobs: totalBookings,
        completedJobs: completedBookings.length,
        completionRate,
        rating: p.average_rating || 0
      };
    });

    techData.sort((a, b) => b.utilization - a.utilization);

    const avgUtil = techData.length > 0 ? Math.round(techData.reduce((s, t) => s + t.utilization, 0) / techData.length) : 0;
    const avgTravel = techData.length > 0 ? Math.round(techData.reduce((s, t) => s + t.travelPct, 0) / techData.length) : 0;
    const overloaded = techData.filter(t => t.utilization > 85).length;
    const underutilized = techData.filter(t => t.utilization < 40).length;

    return {
      chartData: techData,
      summary: { avgUtil, avgTravel, overloaded, underutilized, total: techData.length }
    };
  }, [providers, bookings, services]);

  const getUtilColor = (val) => {
    if (val > 85) return '#ef4444';
    if (val > 70) return '#f59e0b';
    if (val > 40) return '#10b981';
    return '#94a3b8';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-600" />
          Technician Utilization (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {data.summary && (
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-slate-800">{data.summary.avgUtil}%</div>
              <div className="text-[9px] text-slate-500">Avg Utilization</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-slate-800">{data.summary.avgTravel}%</div>
              <div className="text-[9px] text-slate-500">Avg Travel Time</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-red-600">{data.summary.overloaded}</div>
              <div className="text-[9px] text-red-500">Overloaded (&gt;85%)</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-amber-600">{data.summary.underutilized}</div>
              <div className="text-[9px] text-amber-500">Under 40%</div>
            </div>
          </div>
        )}

        {/* Utilization bar chart */}
        {data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.chartData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                      <div className="font-semibold text-slate-800 mb-1">{d.fullName}</div>
                      <div className="space-y-0.5 text-slate-600">
                        <div>Utilization: <strong>{d.utilization}%</strong></div>
                        <div>Service: {d.serviceHours}h · Travel: {d.travelHours}h</div>
                        <div>Jobs: {d.completedJobs}/{d.totalJobs} · Completion: {d.completionRate}%</div>
                        <div>Rating: {d.rating > 0 ? `${d.rating.toFixed(1)} ★` : 'N/A'}</div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                {data.chartData.map((entry, idx) => (
                  <Cell key={idx} fill={getUtilColor(entry.utilization)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">No technician data available</div>
        )}

        {/* Travel efficiency breakdown */}
        {data.chartData.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3 h-3" /> Travel Time Efficiency
            </div>
            <div className="space-y-1.5">
              {data.chartData.map((tech, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 w-14 truncate">{tech.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div className="bg-emerald-400 h-full" style={{ width: `${100 - tech.travelPct}%` }} />
                      <div className="bg-orange-300 h-full" style={{ width: `${tech.travelPct}%` }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 w-12 text-right">{tech.travelPct}% travel</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2 justify-end">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /><span className="text-[9px] text-slate-400">Service</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-300" /><span className="text-[9px] text-slate-400">Travel</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}