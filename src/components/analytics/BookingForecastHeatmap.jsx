import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, Clock } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

export default function BookingForecastHeatmap({ bookings, startDate, endDate }) {
  const [mode, setMode] = useState('heatmap');

  const data = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;
    const filtered = bookings.filter(b => inRange(b.scheduled_date));

    // Day-of-week / time heatmap
    const heatmap = {};
    DAYS.forEach(day => { heatmap[day] = {}; HOURS.forEach(h => { heatmap[day][h] = 0; }); });

    filtered.forEach(b => {
      const d = new Date(b.scheduled_date);
      const day = DAYS[d.getDay()];
      const timeStr = b.scheduled_time || '';
      const hour = parseInt(timeStr.split(':')[0] || timeStr.split('-')[0] || '9');
      const hourLabel = hour >= 12 ? `${hour === 12 ? 12 : hour - 12}pm` : `${hour}am`;
      if (heatmap[day] && heatmap[day][hourLabel] !== undefined) {
        heatmap[day][hourLabel]++;
      }
    });

    // Find max for scaling
    let maxVal = 0;
    DAYS.forEach(day => HOURS.forEach(h => { if (heatmap[day][h] > maxVal) maxVal = heatmap[day][h]; }));

    // Peak hours
    const hourTotals = {};
    HOURS.forEach(h => {
      hourTotals[h] = DAYS.reduce((s, d) => s + heatmap[d][h], 0);
    });
    const peakHour = Object.entries(hourTotals).sort(([, a], [, b]) => b - a)[0];

    // Peak day
    const dayTotals = {};
    DAYS.forEach(d => {
      dayTotals[d] = HOURS.reduce((s, h) => s + heatmap[d][h], 0);
    });
    const peakDay = Object.entries(dayTotals).sort(([, a], [, b]) => b - a)[0];

    // Monthly forecast (simple trend)
    const monthMap = {};
    filtered.forEach(b => {
      const m = b.scheduled_date.substring(0, 7);
      monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const months = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
    const trend = months.length >= 2 
      ? ((months[months.length - 1][1] - months[months.length - 2][1]) / Math.max(1, months[months.length - 2][1]) * 100)
      : 0;

    return { heatmap, maxVal, peakHour, peakDay, totalBookings: filtered.length, trend: trend.toFixed(1), months };
  }, [bookings, startDate, endDate]);

  const getHeatColor = (val) => {
    if (data.maxVal === 0) return 'bg-slate-50';
    const pct = val / data.maxVal;
    if (pct >= 0.8) return 'bg-emerald-600 text-white';
    if (pct >= 0.6) return 'bg-emerald-500 text-white';
    if (pct >= 0.4) return 'bg-emerald-400 text-white';
    if (pct >= 0.2) return 'bg-emerald-200 text-emerald-800';
    if (pct > 0) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-50 text-slate-300';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Booking Patterns & Forecast
            </CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Demand heatmap by day and time</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={Number(data.trend) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {data.trend}% trend
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
            <div className="text-lg font-bold text-blue-700">{data.totalBookings}</div>
            <div className="text-[10px] text-blue-600 font-medium">Total Bookings</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-lg font-bold text-emerald-700">{data.peakHour?.[0] || '—'}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Peak Hour</div>
          </div>
          <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
            <div className="text-lg font-bold text-violet-700">{data.peakDay?.[0] || '—'}</div>
            <div className="text-[10px] text-violet-600 font-medium">Busiest Day</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-[10px] text-slate-400 font-medium text-left py-1 pr-2 w-10" />
                {HOURS.map(h => (
                  <th key={h} className="text-[9px] text-slate-400 font-medium text-center py-1 px-0.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="text-[10px] text-slate-500 font-medium pr-2 py-0.5">{day}</td>
                  {HOURS.map(hour => (
                    <td key={hour} className="p-0.5">
                      <div className={`w-full h-7 rounded-md flex items-center justify-center text-[9px] font-semibold transition-colors ${getHeatColor(data.heatmap[day][hour])}`}>
                        {data.heatmap[day][hour] > 0 ? data.heatmap[day][hour] : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[9px] text-slate-400">Less</span>
          {['bg-slate-50', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'].map((c, i) => (
            <div key={i} className={`w-4 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[9px] text-slate-400">More</span>
        </div>
      </CardContent>
    </Card>
  );
}