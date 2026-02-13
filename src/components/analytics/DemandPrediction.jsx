import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, Users as UsersIcon, AlertTriangle } from 'lucide-react';

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function DemandPrediction({ bookings, services, providers }) {
  const [view, setView] = useState('monthly');

  const prediction = useMemo(() => {
    // Monthly bookings trend
    const monthlyMap = {};
    const serviceMonthly = {};
    
    bookings.forEach(b => {
      if (!b.created_date) return;
      const key = view === 'monthly' ? getMonthKey(b.scheduled_date || b.created_date) : getWeekKey(b.scheduled_date || b.created_date);
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
      
      if (b.service_id) {
        if (!serviceMonthly[b.service_id]) serviceMonthly[b.service_id] = {};
        serviceMonthly[b.service_id][key] = (serviceMonthly[b.service_id][key] || 0) + 1;
      }
    });

    const sorted = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b));
    const historicalData = sorted.map(([period, count]) => ({ period, actual: count }));

    // Simple linear regression for forecast
    const n = historicalData.length;
    if (n < 2) return { chartData: historicalData, forecast: [], staffingNeeds: [], topGrowing: [] };

    const xValues = historicalData.map((_, i) => i);
    const yValues = historicalData.map(d => d.actual);
    const xMean = xValues.reduce((s, v) => s + v, 0) / n;
    const yMean = yValues.reduce((s, v) => s + v, 0) / n;
    
    let ssXY = 0, ssXX = 0;
    for (let i = 0; i < n; i++) {
      ssXY += (xValues[i] - xMean) * (yValues[i] - yMean);
      ssXX += (xValues[i] - xMean) ** 2;
    }
    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = yMean - slope * xMean;

    // Forecast next 3 periods
    const forecastPeriods = 3;
    const lastPeriod = sorted[sorted.length - 1][0];
    const forecast = [];

    for (let i = 1; i <= forecastPeriods; i++) {
      const predicted = Math.max(0, Math.round(intercept + slope * (n - 1 + i)));
      let label;
      if (view === 'monthly') {
        const parts = lastPeriod.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1 + i, 1);
        label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        label = `+${i}w`;
      }
      forecast.push({ period: label, predicted });
    }

    // Combine for chart
    const chartData = [
      ...historicalData.map(d => ({ ...d, predicted: null })),
      // Bridge point
      { period: historicalData[historicalData.length - 1].period, actual: historicalData[historicalData.length - 1].actual, predicted: historicalData[historicalData.length - 1].actual },
      ...forecast.map(d => ({ period: d.period, actual: null, predicted: d.predicted }))
    ];

    // Staffing needs: avg bookings per active tech per day
    const activeTechs = providers.filter(p => p.is_active !== false).length || 1;
    const avgMonthlyPerTech = n > 0 ? yValues[yValues.length - 1] / activeTechs : 0;
    const predictedDemand = forecast.length > 0 ? forecast[forecast.length - 1].predicted : (yValues[yValues.length - 1] || 0);
    const techsNeeded = Math.ceil(predictedDemand / Math.max(avgMonthlyPerTech, 1));
    const gap = techsNeeded - activeTechs;

    // Top growing services
    const serviceGrowth = Object.entries(serviceMonthly).map(([sid, months]) => {
      const entries = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
      if (entries.length < 2) return { sid, growth: 0 };
      const recent = entries.slice(-2);
      const growth = recent.length === 2 ? recent[1][1] - recent[0][1] : 0;
      return { sid, growth, recent: recent[recent.length - 1][1] };
    }).sort((a, b) => b.growth - a.growth).slice(0, 5);

    const topGrowing = serviceGrowth.map(sg => {
      const svc = services.find(s => s.id === sg.sid);
      return { name: svc?.name || `Service #${sg.sid?.slice(-5)}`, growth: sg.growth, recent: sg.recent };
    });

    return { chartData, forecast, staffing: { activeTechs, techsNeeded, gap, avgMonthlyPerTech: Math.round(avgMonthlyPerTech) }, topGrowing, trend: slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable', slopePerMonth: slope };
  }, [bookings, services, providers, view]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            Demand Forecast & Staffing
          </CardTitle>
          <div className="flex gap-1">
            {['weekly', 'monthly'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 text-[10px] rounded-full font-medium transition-colors ${view === v ? 'bg-violet-100 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend chart */}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={prediction.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="#c084fc" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 2 }} name="Predicted" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>

        {/* Staffing card */}
        {prediction.staffing && (
          <div className={`rounded-lg p-3 border ${prediction.staffing.gap > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {prediction.staffing.gap > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <UsersIcon className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm font-semibold text-slate-800">Staffing Outlook</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">{prediction.staffing.activeTechs}</div>
                <div className="text-[10px] text-slate-500">Active Techs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-violet-700">{prediction.staffing.techsNeeded}</div>
                <div className="text-[10px] text-slate-500">Predicted Need</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${prediction.staffing.gap > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {prediction.staffing.gap > 0 ? `+${prediction.staffing.gap}` : prediction.staffing.gap === 0 ? '✓' : prediction.staffing.gap}
                </div>
                <div className="text-[10px] text-slate-500">{prediction.staffing.gap > 0 ? 'Hire Needed' : 'Sufficient'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Top growing services */}
        {prediction.topGrowing?.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1.5">Trending Services</div>
            <div className="space-y-1">
              {prediction.topGrowing.filter(s => s.growth !== 0).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2.5 py-1.5">
                  <span className="text-slate-700 truncate max-w-[60%]">{s.name}</span>
                  <Badge className={s.growth > 0 ? 'bg-green-100 text-green-700 text-[9px]' : 'bg-red-100 text-red-700 text-[9px]'}>
                    {s.growth > 0 ? '+' : ''}{s.growth} this period
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}