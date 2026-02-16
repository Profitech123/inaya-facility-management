import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import { Brain, Loader2, TrendingUp, Calendar, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function AIDemandPredictor({ bookings, services, providers, subscriptions }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const historicalData = useMemo(() => {
    const monthMap = {};
    const serviceMonthMap = {};

    bookings.forEach(b => {
      const date = b.scheduled_date || b.created_date;
      if (!date) return;
      const m = date.substring(0, 7);
      if (!monthMap[m]) monthMap[m] = { total: 0, revenue: 0, completed: 0, cancelled: 0 };
      monthMap[m].total += 1;
      monthMap[m].revenue += (b.total_amount || 0);
      if (b.status === 'completed') monthMap[m].completed += 1;
      if (b.status === 'cancelled') monthMap[m].cancelled += 1;

      const svc = services.find(s => s.id === b.service_id);
      if (svc) {
        const key = `${m}|${svc.name}`;
        serviceMonthMap[key] = (serviceMonthMap[key] || 0) + 1;
      }
    });

    const sorted = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ...d
      }));

    // Service breakdown per month
    const serviceBreakdown = {};
    Object.entries(serviceMonthMap).forEach(([key, count]) => {
      const [month, svcName] = key.split('|');
      if (!serviceBreakdown[svcName]) serviceBreakdown[svcName] = {};
      serviceBreakdown[svcName][month] = count;
    });

    return { monthly: sorted, serviceBreakdown };
  }, [bookings, services]);

  const generateAIInsights = async () => {
    setLoading(true);
    const now = new Date();
    const currentMonth = now.toLocaleString('en', { month: 'long', year: 'numeric' });

    const monthlyStats = historicalData.monthly.map(m => 
      `${m.month}: ${m.total} bookings, AED ${m.revenue.toLocaleString()} revenue, ${m.completed} completed, ${m.cancelled} cancelled`
    ).join('\n');

    const serviceNames = services.map(s => s.name).join(', ');
    const activeTechs = providers.filter(p => p.is_active !== false).length;
    const activeSubs = subscriptions.filter(s => s.status === 'active').length;
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + (sub.monthly_amount || 0), 0);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert facilities management demand analyst in Dubai, UAE. Analyze the following historical data and provide detailed predictions.

Current date: ${currentMonth}
Active technicians: ${activeTechs}
Active subscriptions: ${activeSubs} (MRR: AED ${mrr.toLocaleString()})
Available services: ${serviceNames}

Monthly Booking History:
${monthlyStats}

Dubai Seasonal Context:
- Jan-Mar: Mild weather, outdoor work peak, annual maintenance cycles
- Apr-May: Pre-summer rush for AC services, water tank cleaning surge
- Jun-Sep: Peak AC demand, indoor-focused services, pest control surge
- Oct-Nov: Post-summer maintenance, outdoor restoration
- Dec: Year-end deep cleaning, reduced demand mid-month (holidays)

Provide a comprehensive analysis:`,
      response_json_schema: {
        type: "object",
        properties: {
          demand_forecast: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                predicted_bookings: { type: "number" },
                predicted_revenue: { type: "number" },
                confidence: { type: "string" },
                key_driver: { type: "string" }
              }
            }
          },
          seasonal_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                impact: { type: "string" },
                action: { type: "string" }
              }
            }
          },
          service_predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service_name: { type: "string" },
                trend: { type: "string" },
                next_month_change_pct: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          staffing_recommendation: {
            type: "object",
            properties: {
              current_capacity_pct: { type: "number" },
              recommended_techs: { type: "number" },
              hire_urgency: { type: "string" },
              specializations_needed: { type: "array", items: { type: "string" } }
            }
          },
          risk_alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                severity: { type: "string" },
                mitigation: { type: "string" }
              }
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
    if (!aiInsights?.demand_forecast) return historicalData.monthly;
    const historical = historicalData.monthly.map(m => ({
      label: m.label,
      actual: m.total,
      predicted: null,
      revenue_actual: m.revenue,
      revenue_predicted: null
    }));
    const forecast = aiInsights.demand_forecast.map(f => ({
      label: new Date(f.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      actual: null,
      predicted: f.predicted_bookings,
      revenue_actual: null,
      revenue_predicted: f.predicted_revenue
    }));
    // Bridge
    if (historical.length > 0) {
      const last = historical[historical.length - 1];
      historical[historical.length - 1] = { ...last, predicted: last.actual, revenue_predicted: last.revenue_actual };
    }
    return [...historical, ...forecast];
  }, [historicalData, aiInsights]);

  return (
    <Card className="border-violet-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              AI Demand Predictor
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Seasonal analysis, service predictions & staffing recommendations
            </p>
          </div>
          <Button
            onClick={generateAIInsights}
            disabled={loading}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiInsights ? 'Refresh' : 'Generate Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Forecast Chart - always visible */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">
            Booking Volume — Historical {aiInsights ? '& Predicted' : ''}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Actual" connectNulls={false} />
              {aiInsights && (
                <Line type="monotone" dataKey="predicted" stroke="#c084fc" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="AI Predicted" connectNulls={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Analyzing historical patterns & seasonal data...</p>
            <p className="text-xs text-slate-400">This may take 10-15 seconds</p>
          </div>
        )}

        {aiInsights && !loading && (
          <>
            {/* Executive Summary */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-800">AI Summary</span>
              </div>
              <p className="text-sm text-violet-700 leading-relaxed">{aiInsights.executive_summary}</p>
            </div>

            {/* Forecast Table */}
            {aiInsights.demand_forecast?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Monthly Forecast
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-2 font-medium text-slate-500">Month</th>
                        <th className="text-right p-2 font-medium text-slate-500">Bookings</th>
                        <th className="text-right p-2 font-medium text-slate-500">Revenue</th>
                        <th className="text-center p-2 font-medium text-slate-500">Confidence</th>
                        <th className="text-left p-2 font-medium text-slate-500">Driver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiInsights.demand_forecast.map((f, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="p-2 font-medium text-slate-700">{f.month}</td>
                          <td className="p-2 text-right font-semibold text-violet-700">{f.predicted_bookings}</td>
                          <td className="p-2 text-right text-slate-700">AED {f.predicted_revenue?.toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <Badge className={
                              f.confidence === 'high' ? 'bg-green-100 text-green-700' :
                              f.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }>{f.confidence}</Badge>
                          </td>
                          <td className="p-2 text-slate-500 max-w-[160px] truncate">{f.key_driver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Service Predictions */}
            {aiInsights.service_predictions?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Service Demand Shifts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiInsights.service_predictions.map((sp, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-700 truncate">{sp.service_name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{sp.reason}</div>
                      </div>
                      <Badge className={
                        sp.trend === 'growing' ? 'bg-green-100 text-green-700 ml-2' :
                        sp.trend === 'declining' ? 'bg-red-100 text-red-700 ml-2' :
                        'bg-slate-100 text-slate-600 ml-2'
                      }>
                        {sp.next_month_change_pct > 0 ? '+' : ''}{sp.next_month_change_pct}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staffing Recommendation */}
            {aiInsights.staffing_recommendation && (
              <div className={`rounded-xl p-4 border ${
                aiInsights.staffing_recommendation.hire_urgency === 'high' ? 'bg-red-50 border-red-200' :
                aiInsights.staffing_recommendation.hire_urgency === 'medium' ? 'bg-amber-50 border-amber-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    aiInsights.staffing_recommendation.hire_urgency === 'high' ? 'text-red-600' :
                    aiInsights.staffing_recommendation.hire_urgency === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`} />
                  <span className="text-sm font-semibold text-slate-800">Staffing Recommendation</span>
                  <Badge className={
                    aiInsights.staffing_recommendation.hire_urgency === 'high' ? 'bg-red-100 text-red-700' :
                    aiInsights.staffing_recommendation.hire_urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }>{aiInsights.staffing_recommendation.hire_urgency} urgency</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center mt-3">
                  <div className="bg-white/70 rounded-lg p-2">
                    <div className="text-lg font-bold text-slate-800">{aiInsights.staffing_recommendation.current_capacity_pct}%</div>
                    <div className="text-[10px] text-slate-500">Current Capacity</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2">
                    <div className="text-lg font-bold text-violet-700">{aiInsights.staffing_recommendation.recommended_techs}</div>
                    <div className="text-[10px] text-slate-500">Recommended Techs</div>
                  </div>
                </div>
                {aiInsights.staffing_recommendation.specializations_needed?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-500 mr-1">Needed skills:</span>
                    {aiInsights.staffing_recommendation.specializations_needed.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[9px]">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Risk Alerts */}
            {aiInsights.risk_alerts?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Risk Alerts</div>
                <div className="space-y-2">
                  {aiInsights.risk_alerts.map((r, i) => (
                    <div key={i} className={`rounded-lg px-3 py-2 border-l-4 ${
                      r.severity === 'high' ? 'bg-red-50 border-red-500' :
                      r.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="text-xs font-medium text-slate-800">{r.risk}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Mitigation: {r.mitigation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}