import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Brain, Loader2, Sparkles, TrendingUp, Users, DollarSign, Lightbulb, Target, AlertTriangle } from 'lucide-react';

export default function AIInsightsHub({ bookings, subscriptions, services, providers, packages, reviews, startDate, endDate }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    const inRange = (d) => d && d >= startDate && d <= endDate;
    const paidBookings = bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date));
    const totalRevenue = paidBookings.reduce((s, b) => s + (b.total_amount || 0), 0);
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const mrr = activeSubs.reduce((s, sub) => s + (sub.monthly_amount || 0), 0);
    const completedBookings = bookings.filter(b => b.status === 'completed' && inRange(b.scheduled_date));
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled' && inRange(b.scheduled_date));
    const allRatings = reviews.map(r => r.rating);
    const avgRating = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : 'N/A';

    const monthlyBookings = {};
    bookings.filter(b => inRange(b.scheduled_date)).forEach(b => {
      const m = b.scheduled_date?.substring(0, 7);
      if (m) monthlyBookings[m] = (monthlyBookings[m] || 0) + 1;
    });

    const svcPopularity = {};
    paidBookings.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      if (svc) svcPopularity[svc.name] = (svcPopularity[svc.name] || 0) + 1;
    });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior business strategist analyzing a facilities management company (INAYA) in Dubai, UAE. 

Key Metrics (${startDate} to ${endDate}):
- Total Revenue: AED ${totalRevenue.toLocaleString()}
- MRR: AED ${mrr.toLocaleString()} (${activeSubs.length} active subscriptions)
- Total Bookings: ${bookings.filter(b => inRange(b.scheduled_date)).length}
- Completed: ${completedBookings.length}, Cancelled: ${cancelledBookings.length}
- Average Rating: ${avgRating} (${reviews.length} reviews)
- Active Technicians: ${providers.filter(p => p.is_active !== false).length}

Monthly Booking Volume: ${Object.entries(monthlyBookings).sort(([a],[b]) => a.localeCompare(b)).map(([m,c]) => `${m}: ${c}`).join(', ')}

Top Services: ${Object.entries(svcPopularity).sort(([,a],[,b]) => b - a).slice(0, 5).map(([n,c]) => `${n} (${c})`).join(', ')}

Cancelled subscriptions: ${subscriptions.filter(s => s.status === 'cancelled').length}
Paused subscriptions: ${subscriptions.filter(s => s.status === 'paused').length}

Provide a comprehensive, actionable executive briefing:`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_wins: { type: "array", items: { type: "object", properties: { title: { type: "string" }, detail: { type: "string" } } } },
          growth_opportunities: { type: "array", items: { type: "object", properties: { opportunity: { type: "string" }, estimated_impact: { type: "string" }, effort_level: { type: "string" }, priority: { type: "string" } } } },
          risk_alerts: { type: "array", items: { type: "object", properties: { risk: { type: "string" }, severity: { type: "string" }, action: { type: "string" } } } },
          recommended_actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, timeline: { type: "string" }, expected_outcome: { type: "string" } } } },
          performance_score: { type: "number" },
          health_indicators: { type: "object", properties: { revenue_health: { type: "string" }, customer_health: { type: "string" }, operations_health: { type: "string" }, growth_trajectory: { type: "string" } } }
        }
      }
    });

    setInsights(result);
    setLoading(false);
  };

  const healthColor = (val) => val === 'excellent' || val === 'strong' ? 'text-emerald-600 bg-emerald-50' : val === 'good' || val === 'moderate' ? 'text-blue-600 bg-blue-50' : val === 'needs_attention' || val === 'weak' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <Card className="border-2 border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              AI Business Intelligence
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Executive-level AI analysis with actionable recommendations</p>
          </div>
          <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2 shadow-lg shadow-violet-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {insights ? 'Refresh Analysis' : 'Generate AI Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping opacity-20" />
            </div>
            <p className="text-sm font-medium text-slate-600 mt-4">Analyzing your business data...</p>
            <p className="text-xs text-slate-400 mt-1">This may take 15-20 seconds</p>
          </div>
        )}

        {!insights && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">AI Business Intelligence</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Get an executive-level analysis of your business performance including growth opportunities, 
              risk alerts, and actionable recommendations powered by AI.
            </p>
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-6">
            {/* Performance Score */}
            <div className="flex items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
              <div className="relative">
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#a78bfa" strokeWidth="8" 
                    strokeDasharray={`${(insights.performance_score || 0) * 2.64} 264`} 
                    strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{insights.performance_score || 0}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Business Health Score</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            </div>

            {/* Health Indicators */}
            {insights.health_indicators && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(insights.health_indicators).map(([key, val]) => (
                  <div key={key} className={`rounded-xl p-3 text-center ${healthColor(val)}`}>
                    <div className="text-xs font-bold capitalize mb-0.5">{key.replace(/_/g, ' ')}</div>
                    <div className="text-sm font-semibold capitalize">{val?.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Wins */}
            {insights.key_wins?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-emerald-500" /> Key Wins
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {insights.key_wins.map((w, i) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="text-sm font-semibold text-emerald-800 mb-1">{w.title}</div>
                      <div className="text-xs text-emerald-600">{w.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Opportunities */}
            {insights.growth_opportunities?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Growth Opportunities
                </div>
                <div className="space-y-2.5">
                  {insights.growth_opportunities.map((g, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-800">{g.opportunity}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="bg-blue-100 text-blue-700 text-[10px]">Impact: {g.estimated_impact}</Badge>
                            <Badge className="bg-slate-100 text-slate-600 text-[10px]">Effort: {g.effort_level}</Badge>
                          </div>
                        </div>
                        <Badge className={g.priority === 'high' ? 'bg-red-100 text-red-700' : g.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                          {g.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Alerts */}
            {insights.risk_alerts?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Alerts
                </div>
                <div className="space-y-2">
                  {insights.risk_alerts.map((r, i) => (
                    <div key={i} className={`rounded-xl p-4 border-l-4 ${
                      r.severity === 'high' ? 'bg-red-50 border-red-500' : r.severity === 'medium' ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="text-sm font-semibold text-slate-800">{r.risk}</div>
                      <div className="text-xs text-slate-600 mt-1">→ {r.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {insights.recommended_actions?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-violet-500" /> Recommended Actions
                </div>
                <div className="space-y-2">
                  {insights.recommended_actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 bg-violet-50/50 border border-violet-100 rounded-xl p-4">
                      <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800">{a.action}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-slate-500">Timeline: <strong>{a.timeline}</strong></span>
                          <span className="text-[10px] text-emerald-600">Expected: {a.expected_outcome}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}