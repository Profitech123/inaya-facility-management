import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Heart, Star, ThumbsUp, ThumbsDown, TrendingUp, MessageCircle } from 'lucide-react';

const SENTIMENT_COLORS = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444' };

export default function CustomerSatisfactionTrends({ bookings, reviews, services, startDate, endDate }) {
  const [view, setView] = useState('overview');

  const data = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;

    // Monthly satisfaction from reviews
    const monthMap = {};
    reviews.filter(r => inRange(r.review_date || r.created_date?.split('T')[0])).forEach(r => {
      const m = (r.review_date || r.created_date?.split('T')[0])?.substring(0, 7);
      if (!m) return;
      if (!monthMap[m]) monthMap[m] = { ratings: [], positive: 0, neutral: 0, negative: 0 };
      monthMap[m].ratings.push(r.rating);
      if (r.rating >= 4) monthMap[m].positive++;
      else if (r.rating === 3) monthMap[m].neutral++;
      else monthMap[m].negative++;
    });

    const trendData = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => {
        const avg = d.ratings.reduce((a, b) => a + b, 0) / d.ratings.length;
        const total = d.positive + d.neutral + d.negative;
        return {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          'Avg Rating': Number(avg.toFixed(2)),
          'CSAT %': total > 0 ? Number(((d.positive / total) * 100).toFixed(1)) : 0,
          Reviews: d.ratings.length,
        };
      });

    // Overall stats
    const allRatings = reviews.filter(r => inRange(r.review_date || r.created_date?.split('T')[0])).map(r => r.rating);
    const avgRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
    const csat = allRatings.length > 0 ? (allRatings.filter(r => r >= 4).length / allRatings.length * 100) : 0;
    const nps = allRatings.length > 0 ? 
      (allRatings.filter(r => r === 5).length / allRatings.length * 100) - 
      (allRatings.filter(r => r <= 2).length / allRatings.length * 100) : 0;

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map(rating => ({
      rating: `${rating}★`,
      count: allRatings.filter(r => r === rating).length,
      pct: allRatings.length > 0 ? (allRatings.filter(r => r === rating).length / allRatings.length * 100) : 0,
    }));

    // Sentiment pie
    const sentimentPie = [
      { name: 'Positive (4-5★)', value: allRatings.filter(r => r >= 4).length },
      { name: 'Neutral (3★)', value: allRatings.filter(r => r === 3).length },
      { name: 'Negative (1-2★)', value: allRatings.filter(r => r <= 2).length },
    ].filter(s => s.value > 0);

    // Completion rate over time (another satisfaction signal)
    const completionMonths = {};
    bookings.filter(b => inRange(b.scheduled_date)).forEach(b => {
      const m = b.scheduled_date?.substring(0, 7);
      if (!m) return;
      if (!completionMonths[m]) completionMonths[m] = { total: 0, completed: 0, cancelled: 0 };
      completionMonths[m].total++;
      if (b.status === 'completed') completionMonths[m].completed++;
      if (b.status === 'cancelled') completionMonths[m].cancelled++;
    });

    const completionTrend = Object.entries(completionMonths)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'Completion %': d.total > 0 ? Number(((d.completed / d.total) * 100).toFixed(1)) : 0,
        'Cancellation %': d.total > 0 ? Number(((d.cancelled / d.total) * 100).toFixed(1)) : 0,
      }));

    // Per-service satisfaction
    const serviceRatings = {};
    reviews.filter(r => inRange(r.review_date || r.created_date?.split('T')[0])).forEach(r => {
      if (!r.booking_id) return;
      const booking = bookings.find(b => b.id === r.booking_id);
      if (!booking) return;
      const svc = services.find(s => s.id === booking.service_id);
      if (!svc) return;
      if (!serviceRatings[svc.name]) serviceRatings[svc.name] = [];
      serviceRatings[svc.name].push(r.rating);
    });

    const byService = Object.entries(serviceRatings)
      .map(([name, ratings]) => ({
        name,
        avg: Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)),
        count: ratings.length,
        csat: Number((ratings.filter(r => r >= 4).length / ratings.length * 100).toFixed(0)),
      }))
      .sort((a, b) => b.avg - a.avg);

    return { trendData, avgRating, csat, nps, distribution, sentimentPie, completionTrend, byService, totalReviews: allRatings.length };
  }, [bookings, reviews, services, startDate, endDate]);

  const ratingBarColors = ['#10b981', '#34d399', '#fbbf24', '#fb923c', '#ef4444'];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Customer Satisfaction Trends
            </CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Rating trends, CSAT, NPS, and service-level satisfaction</p>
          </div>
          <div className="flex gap-1">
            {['overview', 'by-service'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${view === v ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:text-slate-600'}`}>
                {v === 'overview' ? 'Overview' : 'By Service'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3.5 text-center border border-amber-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-2xl font-bold text-slate-900">{data.avgRating.toFixed(1)}</span>
            </div>
            <div className="text-[10px] text-amber-700 font-medium">Avg Rating</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3.5 text-center border border-emerald-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
              <span className="text-2xl font-bold text-slate-900">{data.csat.toFixed(0)}%</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">CSAT Score</div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3.5 text-center border border-violet-100">
            <span className={`text-2xl font-bold ${data.nps >= 50 ? 'text-emerald-600' : data.nps >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {data.nps >= 0 ? '+' : ''}{data.nps.toFixed(0)}
            </span>
            <div className="text-[10px] text-violet-700 font-medium">NPS Score</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3.5 text-center border border-blue-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-slate-900">{data.totalReviews}</span>
            </div>
            <div className="text-[10px] text-blue-700 font-medium">Total Reviews</div>
          </div>
        </div>

        {view === 'overview' ? (
          <>
            {/* Rating trend */}
            {data.trendData.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">CSAT & Rating Trend</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.trendData}>
                    <defs>
                      <linearGradient id="csatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="CSAT %" stroke="#10b981" strokeWidth={2} fill="url(#csatGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Rating distribution + Sentiment pie */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-3">Rating Distribution</div>
                <div className="space-y-2">
                  {data.distribution.map((d, i) => (
                    <div key={d.rating} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 w-6">{d.rating}</span>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${d.pct}%`, backgroundColor: ratingBarColors[i] }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-10 text-right">{d.pct.toFixed(0)}%</span>
                      <span className="text-[10px] text-slate-400 w-6 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {data.sentimentPie.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-3">Sentiment Breakdown</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={data.sentimentPie} dataKey="value" nameKey="name" cx="50%" cy="50%" 
                        outerRadius={55} innerRadius={30}>
                        {data.sentimentPie.map((entry, i) => (
                          <Cell key={i} fill={Object.values(SENTIMENT_COLORS)[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-1">
                    {data.sentimentPie.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: Object.values(SENTIMENT_COLORS)[i] }} />
                        <span className="text-[10px] text-slate-500">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Completion trend */}
            {data.completionTrend.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Completion & Cancellation Rate</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data.completionTrend}>
                    <defs>
                      <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cancGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Completion %" stroke="#10b981" fill="url(#compGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Cancellation %" stroke="#ef4444" fill="url(#cancGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-3">Satisfaction by Service</div>
            {data.byService.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No service-level review data</p>
            ) : (
              <div className="space-y-2">
                {data.byService.map((svc, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{svc.name}</div>
                      <div className="text-[10px] text-slate-400">{svc.count} reviews</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-slate-800">{svc.avg}</span>
                      </div>
                      <Badge className={svc.csat >= 80 ? 'bg-emerald-100 text-emerald-700' : svc.csat >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                        {svc.csat}% CSAT
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {data.trendData.length === 0 && data.completionTrend.length === 0 && view === 'overview' && (
          <p className="text-slate-400 text-center py-12">No review data in selected period</p>
        )}
      </CardContent>
    </Card>
  );
}