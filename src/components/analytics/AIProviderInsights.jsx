import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { Brain, Loader2, Star, Award, AlertCircle, Sparkles, Users, TrendingUp } from 'lucide-react';

export default function AIProviderInsights({ providers, bookings, reviews, services, startDate, endDate }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const providerStats = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;

    return providers.filter(p => p.is_active !== false).map(p => {
      const pBookings = bookings.filter(b => b.assigned_provider_id === p.id && inRange(b.scheduled_date));
      const completed = pBookings.filter(b => b.status === 'completed');
      const cancelled = pBookings.filter(b => b.status === 'cancelled');
      const delayed = pBookings.filter(b => b.status === 'delayed');
      const pReviews = reviews.filter(r => r.provider_id === p.id);
      const avgRating = pReviews.length > 0 ? pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length : 0;
      const revenue = completed.reduce((s, b) => s + (b.total_amount || 0), 0);

      // Completion times
      const completionTimes = completed.map(b => {
        if (b.started_at && b.completed_at) {
          return (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60);
        }
        const svc = services.find(s => s.id === b.service_id);
        return svc?.duration_minutes || 60;
      });
      const avgTime = completionTimes.length > 0 ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 0;

      const serviceTypes = [...new Set(pBookings.map(b => {
        const svc = services.find(s => s.id === b.service_id);
        return svc?.name;
      }).filter(Boolean))];

      return {
        id: p.id,
        name: p.full_name,
        email: p.email,
        specialization: p.specialization || [],
        totalJobs: pBookings.length,
        completed: completed.length,
        cancelled: cancelled.length,
        delayed: delayed.length,
        completionRate: pBookings.length > 0 ? (completed.length / pBookings.length * 100) : 0,
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: pReviews.length,
        revenue,
        avgCompletionTime: Math.round(avgTime),
        serviceTypes,
        recentReviews: pReviews.slice(0, 3).map(r => ({ rating: r.rating, comment: r.comment }))
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [providers, bookings, reviews, services, startDate, endDate]);

  const generateInsights = async () => {
    setLoading(true);

    const statsText = providerStats.map(p =>
      `${p.name}: ${p.totalJobs} jobs (${p.completed} completed, ${p.cancelled} cancelled, ${p.delayed} delayed), ${p.completionRate.toFixed(0)}% rate, ${p.avgRating}★ (${p.reviewCount} reviews), AED ${p.revenue.toLocaleString()} revenue, avg ${p.avgCompletionTime}min completion, services: ${p.serviceTypes.join(', ')}, recent reviews: ${p.recentReviews.map(r => `${r.rating}★ "${r.comment || 'no comment'}"`).join('; ')}`
    ).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert facilities management operations analyst. Analyze technician performance data and provide actionable insights.

Period: ${startDate} to ${endDate}
Total active technicians: ${providerStats.length}

Technician Performance Data:
${statsText}

Provide detailed analysis:`,
      response_json_schema: {
        type: "object",
        properties: {
          top_performers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                strength: { type: "string" },
                score: { type: "number" }
              }
            }
          },
          improvement_needed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                issue: { type: "string" },
                recommendation: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          team_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                category: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          workload_balance: {
            type: "object",
            properties: {
              assessment: { type: "string" },
              overloaded: { type: "array", items: { type: "string" } },
              underutilized: { type: "array", items: { type: "string" } },
              recommendation: { type: "string" }
            }
          },
          training_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                target_technicians: { type: "array", items: { type: "string" } },
                reason: { type: "string" }
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

  // Radar data for top 5
  const radarData = useMemo(() => {
    const top5 = providerStats.slice(0, 5);
    if (top5.length === 0) return [];

    const maxJobs = Math.max(...top5.map(p => p.totalJobs), 1);
    const maxRev = Math.max(...top5.map(p => p.revenue), 1);

    return ['Completion Rate', 'Rating', 'Volume', 'Revenue', 'Speed'].map(metric => {
      const entry = { metric };
      top5.forEach(p => {
        let val = 0;
        if (metric === 'Completion Rate') val = p.completionRate;
        else if (metric === 'Rating') val = (p.avgRating / 5) * 100;
        else if (metric === 'Volume') val = (p.totalJobs / maxJobs) * 100;
        else if (metric === 'Revenue') val = (p.revenue / maxRev) * 100;
        else if (metric === 'Speed') val = p.avgCompletionTime > 0 ? Math.max(0, 100 - (p.avgCompletionTime / 3)) : 50;
        entry[p.name.split(' ')[0]] = Math.round(Math.min(100, Math.max(0, val)));
      });
      return entry;
    });
  }, [providerStats]);

  const radarNames = providerStats.slice(0, 5).map(p => p.name.split(' ')[0]);
  const radarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <Card className="border-emerald-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              AI Provider Performance Insights
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              AI analysis of technician metrics, strengths & improvement areas
            </p>
          </div>
          <Button
            onClick={generateInsights}
            disabled={loading}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiInsights ? 'Refresh' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Radar Chart */}
        {radarData.length > 0 && radarNames.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Top 5 Technician Comparison</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                {radarNames.map((name, i) => (
                  <Radar key={name} name={name} dataKey={name} stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.1} strokeWidth={2} />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-1">
              {radarNames.map((name, i) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: radarColors[i] }} />
                  <span className="text-[10px] text-slate-500">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm font-medium">Analyzing performance data...</p>
          </div>
        )}

        {aiInsights && !loading && (
          <>
            {/* Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">AI Summary</span>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">{aiInsights.executive_summary}</p>
            </div>

            {/* Top Performers */}
            {aiInsights.top_performers?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Top Performers
                </div>
                <div className="space-y-2">
                  {aiInsights.top_performers.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-amber-50/50 border border-amber-100 rounded-lg px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{p.strength}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{p.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Needed */}
            {aiInsights.improvement_needed?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Areas for Improvement
                </div>
                <div className="space-y-2">
                  {aiInsights.improvement_needed.map((item, i) => (
                    <div key={i} className={`rounded-lg p-3 border-l-4 ${
                      item.priority === 'high' ? 'bg-red-50 border-red-500' :
                      item.priority === 'medium' ? 'bg-amber-50 border-amber-500' :
                      'bg-slate-50 border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-800">{item.name}</span>
                        <Badge className={
                          item.priority === 'high' ? 'bg-red-100 text-red-700 text-[9px]' :
                          item.priority === 'medium' ? 'bg-amber-100 text-amber-700 text-[9px]' :
                          'bg-slate-100 text-slate-600 text-[9px]'
                        }>{item.priority}</Badge>
                      </div>
                      <div className="text-[10px] text-slate-600">{item.issue}</div>
                      <div className="text-[10px] text-emerald-700 mt-1 font-medium">→ {item.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workload Balance */}
            {aiInsights.workload_balance && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-800 mb-1">Workload Balance</div>
                <p className="text-xs text-blue-700 mb-2">{aiInsights.workload_balance.assessment}</p>
                {aiInsights.workload_balance.overloaded?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="text-[10px] text-red-600 font-medium">Overloaded:</span>
                    {aiInsights.workload_balance.overloaded.map((n, i) => (
                      <Badge key={i} className="bg-red-100 text-red-700 text-[9px]">{n}</Badge>
                    ))}
                  </div>
                )}
                {aiInsights.workload_balance.underutilized?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-amber-600 font-medium">Underutilized:</span>
                    {aiInsights.workload_balance.underutilized.map((n, i) => (
                      <Badge key={i} className="bg-amber-100 text-amber-700 text-[9px]">{n}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-blue-600 mt-2 font-medium">→ {aiInsights.workload_balance.recommendation}</p>
              </div>
            )}

            {/* Training Recommendations */}
            {aiInsights.training_recommendations?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Training Recommendations</div>
                <div className="space-y-2">
                  {aiInsights.training_recommendations.map((tr, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg px-3 py-2">
                      <div className="text-xs font-medium text-slate-800">{tr.topic}</div>
                      <div className="text-[10px] text-slate-500">{tr.reason}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tr.target_technicians?.map((t, j) => (
                          <Badge key={j} variant="outline" className="text-[9px]">{t}</Badge>
                        ))}
                      </div>
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