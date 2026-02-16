import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Brain, Loader2, DollarSign, TrendingUp, TrendingDown, Sparkles, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export default function AIFinancialForecasting({ bookings, subscriptions, services, packages, startDate, endDate }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const financialData = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;

    // Monthly revenue breakdown
    const monthMap = {};
    bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date)).forEach(b => {
      const m = b.scheduled_date.substring(0, 7);
      if (!monthMap[m]) monthMap[m] = { bookingRev: 0, subRev: 0, addonRev: 0, bookingCount: 0 };
      monthMap[m].bookingRev += (b.total_amount || 0) - (b.addons_amount || 0);
      monthMap[m].addonRev += (b.addons_amount || 0);
      monthMap[m].bookingCount += 1;
    });

    subscriptions.filter(s => s.start_date && s.status === 'active').forEach(sub => {
      const start = sub.start_date.substring(0, 7);
      const end = sub.end_date ? sub.end_date.substring(0, 7) : endDate.substring(0, 7);
      let current = start;
      while (current <= end && current <= endDate.substring(0, 7) && current >= startDate.substring(0, 7)) {
        if (!monthMap[current]) monthMap[current] = { bookingRev: 0, subRev: 0, addonRev: 0, bookingCount: 0 };
        monthMap[current].subRev += (sub.monthly_amount || 0);
        const [y, mo] = current.split('-').map(Number);
        current = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`;
      }
    });

    const monthly = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'On-Demand': d.bookingRev,
        'Subscriptions': d.subRev,
        'Add-ons': d.addonRev,
        'Total': d.bookingRev + d.subRev + d.addonRev,
        bookings: d.bookingCount
      }));

    // Revenue by service category
    const serviceCategoryRev = {};
    bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date)).forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      serviceCategoryRev[name] = (serviceCategoryRev[name] || 0) + (b.total_amount || 0);
    });
    const serviceRevBreakdown = Object.entries(serviceCategoryRev)
      .map(([name, rev]) => ({ name, revenue: rev }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);

    // Subscription package revenue
    const packageRev = {};
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
      const pkg = packages.find(p => p.id === sub.package_id);
      const name = pkg?.name || 'Unknown';
      if (!packageRev[name]) packageRev[name] = { mrr: 0, count: 0 };
      packageRev[name].mrr += (sub.monthly_amount || 0);
      packageRev[name].count += 1;
    });
    const packageBreakdown = Object.entries(packageRev)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.mrr - a.mrr);

    // Totals
    const totalRevenue = monthly.reduce((s, m) => s + m['Total'], 0);
    const totalOnDemand = monthly.reduce((s, m) => s + m['On-Demand'], 0);
    const totalSub = monthly.reduce((s, m) => s + m['Subscriptions'], 0);
    const totalAddon = monthly.reduce((s, m) => s + m['Add-ons'], 0);
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + (sub.monthly_amount || 0), 0);
    const arr = mrr * 12;
    const avgBookingValue = bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date)).length > 0
      ? totalOnDemand / bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date)).length
      : 0;

    return { monthly, serviceRevBreakdown, packageBreakdown, totalRevenue, totalOnDemand, totalSub, totalAddon, mrr, arr, avgBookingValue };
  }, [bookings, subscriptions, services, packages, startDate, endDate]);

  const generateForecast = async () => {
    setLoading(true);

    const monthlyText = financialData.monthly.map(m =>
      `${m.month}: On-Demand AED ${m['On-Demand'].toLocaleString()}, Subscriptions AED ${m['Subscriptions'].toLocaleString()}, Add-ons AED ${m['Add-ons'].toLocaleString()}, Total AED ${m['Total'].toLocaleString()}, ${m.bookings} bookings`
    ).join('\n');

    const serviceRevText = financialData.serviceRevBreakdown.map(s =>
      `${s.name}: AED ${s.revenue.toLocaleString()}`
    ).join('\n');

    const packageText = financialData.packageBreakdown.map(p =>
      `${p.name}: ${p.count} subscribers, AED ${p.mrr.toLocaleString()}/mo`
    ).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior financial analyst for a facilities management company in Dubai, UAE. Analyze the financial data and provide comprehensive forecasting.

Period: ${startDate} to ${endDate}
Current MRR: AED ${financialData.mrr.toLocaleString()}
Current ARR: AED ${financialData.arr.toLocaleString()}
Total Revenue in Period: AED ${financialData.totalRevenue.toLocaleString()}
Average Booking Value: AED ${Math.round(financialData.avgBookingValue)}

Monthly Revenue Breakdown:
${monthlyText}

Revenue by Service:
${serviceRevText}

Subscription Packages:
${packageText}

Dubai Context: FM industry growing 8-12% annually, seasonal peaks in Q2/Q3 (AC demand).

Provide financial analysis and forecast:`,
      response_json_schema: {
        type: "object",
        properties: {
          revenue_forecast: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                predicted_on_demand: { type: "number" },
                predicted_subscriptions: { type: "number" },
                predicted_total: { type: "number" },
                growth_pct: { type: "number" }
              }
            }
          },
          profitability_analysis: {
            type: "object",
            properties: {
              estimated_gross_margin_pct: { type: "number" },
              most_profitable_services: { type: "array", items: { type: "string" } },
              least_profitable_services: { type: "array", items: { type: "string" } },
              margin_improvement_tips: { type: "array", items: { type: "string" } }
            }
          },
          revenue_optimization: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                estimated_impact_aed: { type: "number" },
                effort: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          subscription_health: {
            type: "object",
            properties: {
              assessment: { type: "string" },
              projected_mrr_3mo: { type: "number" },
              projected_mrr_6mo: { type: "number" },
              arpu_trend: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } }
            }
          },
          pricing_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service: { type: "string" },
                current_avg_price: { type: "number" },
                suggested_price: { type: "number" },
                rationale: { type: "string" }
              }
            }
          },
          kpi_targets: {
            type: "object",
            properties: {
              monthly_revenue_target: { type: "number" },
              target_mrr: { type: "number" },
              target_avg_booking_value: { type: "number" },
              target_bookings_per_month: { type: "number" }
            }
          },
          executive_summary: { type: "string" }
        }
      }
    });

    setAiInsights(result);
    setLoading(false);
  };

  const forecastChartData = useMemo(() => {
    if (!aiInsights?.revenue_forecast) return null;
    const historical = financialData.monthly.map(m => ({
      label: m.label,
      'On-Demand': m['On-Demand'],
      'Subscriptions': m['Subscriptions'],
      'Forecast': null
    }));
    const forecast = aiInsights.revenue_forecast.map(f => ({
      label: new Date(f.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      'On-Demand': null,
      'Subscriptions': null,
      'Forecast': f.predicted_total
    }));
    // Bridge
    if (historical.length > 0) {
      const last = historical[historical.length - 1];
      historical[historical.length - 1] = { ...last, 'Forecast': last['On-Demand'] + last['Subscriptions'] };
    }
    return [...historical, ...forecast];
  }, [financialData, aiInsights]);

  return (
    <Card className="border-blue-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              AI Financial Forecasting
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Revenue forecasting, profitability analysis & pricing optimization
            </p>
          </div>
          <Button
            onClick={generateForecast}
            disabled={loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiInsights ? 'Refresh' : 'Forecast'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Financial KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-700">AED {financialData.totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600">Period Revenue</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-700">AED {financialData.mrr.toLocaleString()}</div>
            <div className="text-[10px] text-blue-600">Current MRR</div>
          </div>
          <div className="bg-violet-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-violet-700">AED {financialData.arr.toLocaleString()}</div>
            <div className="text-[10px] text-violet-600">ARR</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-amber-700">AED {Math.round(financialData.avgBookingValue)}</div>
            <div className="text-[10px] text-amber-600">Avg Booking Value</div>
          </div>
        </div>

        {/* Revenue by service - pie chart */}
        {financialData.serviceRevBreakdown.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5" /> Revenue by Service
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={financialData.serviceRevBreakdown}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                  >
                    {financialData.serviceRevBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => [`AED ${v.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 min-w-[140px]">
                {financialData.serviceRevBreakdown.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 truncate flex-1">{s.name}</span>
                    <span className="font-medium text-slate-800">{(s.revenue / financialData.totalRevenue * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forecast Chart */}
        {forecastChartData && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Revenue — Historical & AI Forecast</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecastChartData}>
                <defs>
                  <linearGradient id="colGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => v != null ? [`AED ${v.toLocaleString()}`, undefined] : ['-', undefined]} />
                <Legend />
                <Area type="monotone" dataKey="On-Demand" stroke="#10b981" fill="url(#colGreen)" connectNulls={false} />
                <Area type="monotone" dataKey="Subscriptions" stroke="#6366f1" fill="url(#colBlue)" connectNulls={false} />
                <Area type="monotone" dataKey="Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" fill="none" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm font-medium">Running financial analysis...</p>
          </div>
        )}

        {aiInsights && !loading && (
          <>
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Financial Summary</span>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">{aiInsights.executive_summary}</p>
            </div>

            {/* KPI Targets */}
            {aiInsights.kpi_targets && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                  <div className="text-xs text-slate-400">Revenue Target</div>
                  <div className="text-sm font-bold text-slate-800">AED {aiInsights.kpi_targets.monthly_revenue_target?.toLocaleString()}/mo</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                  <div className="text-xs text-slate-400">MRR Target</div>
                  <div className="text-sm font-bold text-slate-800">AED {aiInsights.kpi_targets.target_mrr?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                  <div className="text-xs text-slate-400">Avg Booking Target</div>
                  <div className="text-sm font-bold text-slate-800">AED {aiInsights.kpi_targets.target_avg_booking_value}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                  <div className="text-xs text-slate-400">Bookings/Month</div>
                  <div className="text-sm font-bold text-slate-800">{aiInsights.kpi_targets.target_bookings_per_month}</div>
                </div>
              </div>
            )}

            {/* Subscription Health */}
            {aiInsights.subscription_health && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-800 mb-1">Subscription Health</div>
                <p className="text-xs text-indigo-700 mb-2">{aiInsights.subscription_health.assessment}</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-indigo-700">AED {aiInsights.subscription_health.projected_mrr_3mo?.toLocaleString()}</div>
                    <div className="text-[9px] text-indigo-500">3-mo MRR</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-indigo-700">AED {aiInsights.subscription_health.projected_mrr_6mo?.toLocaleString()}</div>
                    <div className="text-[9px] text-indigo-500">6-mo MRR</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-indigo-700">{aiInsights.subscription_health.arpu_trend}</div>
                    <div className="text-[9px] text-indigo-500">ARPU Trend</div>
                  </div>
                </div>
                {aiInsights.subscription_health.recommendations?.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {aiInsights.subscription_health.recommendations.map((r, i) => (
                      <div key={i} className="text-[10px] text-indigo-600 flex items-start gap-1">
                        <span>→</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Revenue Optimization */}
            {aiInsights.revenue_optimization?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Revenue Optimization Strategies
                </div>
                <div className="space-y-2">
                  {aiInsights.revenue_optimization.map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-800">{s.strategy}</span>
                        <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">
                          +AED {s.estimated_impact_aed?.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>Effort: <strong>{s.effort}</strong></span>
                        <span>Timeline: <strong>{s.timeline}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profitability */}
            {aiInsights.profitability_analysis && (
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="text-xs font-semibold text-green-800 mb-1">Most Profitable</div>
                  <div className="space-y-1">
                    {aiInsights.profitability_analysis.most_profitable_services?.map((s, i) => (
                      <div key={i} className="text-xs text-green-700 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="text-xs font-semibold text-red-800 mb-1">Least Profitable</div>
                  <div className="space-y-1">
                    {aiInsights.profitability_analysis.least_profitable_services?.map((s, i) => (
                      <div key={i} className="text-xs text-red-700 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Insights */}
            {aiInsights.pricing_insights?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Pricing Optimization</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-2 font-medium text-slate-500">Service</th>
                        <th className="text-right p-2 font-medium text-slate-500">Current</th>
                        <th className="text-right p-2 font-medium text-slate-500">Suggested</th>
                        <th className="text-left p-2 font-medium text-slate-500">Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiInsights.pricing_insights.map((p, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="p-2 font-medium text-slate-700">{p.service}</td>
                          <td className="p-2 text-right text-slate-600">AED {p.current_avg_price}</td>
                          <td className={`p-2 text-right font-semibold ${p.suggested_price > p.current_avg_price ? 'text-emerald-600' : 'text-red-600'}`}>
                            AED {p.suggested_price}
                          </td>
                          <td className="p-2 text-slate-500 max-w-[200px] truncate">{p.rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}