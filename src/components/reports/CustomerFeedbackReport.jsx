import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import ExportButtons from './ExportButtons';

const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981'];

export default function CustomerFeedbackReport({ reviews, providers, bookings, services, startDate, endDate }) {
  const data = useMemo(() => {
    const filtered = reviews.filter(r => {
      const d = r.review_date || (r.created_date || '').substring(0, 10);
      return d >= startDate && d <= endDate;
    });

    const totalReviews = filtered.length;
    const avgRating = totalReviews > 0 ? filtered.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews : 0;
    const positive = filtered.filter(r => r.rating >= 4).length;
    const negative = filtered.filter(r => r.rating <= 2).length;
    const neutral = filtered.filter(r => r.rating === 3).length;
    const satisfactionRate = totalReviews > 0 ? (positive / totalReviews * 100) : 0;

    // Rating distribution
    const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} Star`,
      count: filtered.filter(r => r.rating === rating).length,
      color: RATING_COLORS[rating - 1]
    }));

    // Sentiment pie
    const sentimentData = [
      { name: 'Positive (4-5★)', value: positive, color: '#10b981' },
      { name: 'Neutral (3★)', value: neutral, color: '#eab308' },
      { name: 'Negative (1-2★)', value: negative, color: '#ef4444' },
    ].filter(s => s.value > 0);

    // Rating trends over time (by month)
    const monthMap = {};
    filtered.forEach(r => {
      const d = r.review_date || (r.created_date || '').substring(0, 10);
      const m = d.substring(0, 7);
      if (!monthMap[m]) monthMap[m] = { total: 0, sum: 0, count: 0 };
      monthMap[m].sum += (r.rating || 0);
      monthMap[m].count += 1;
    });
    const ratingTrend = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        avgRating: d.count > 0 ? +(d.sum / d.count).toFixed(2) : 0,
        reviewCount: d.count
      }));

    // Top-rated technicians
    const techMap = {};
    filtered.forEach(r => {
      if (!techMap[r.provider_id]) techMap[r.provider_id] = { sum: 0, count: 0 };
      techMap[r.provider_id].sum += (r.rating || 0);
      techMap[r.provider_id].count += 1;
    });
    const topTechnicians = Object.entries(techMap)
      .map(([id, d]) => {
        const prov = providers.find(p => p.id === id);
        return {
          name: prov?.full_name || 'Unknown',
          avgRating: +(d.sum / d.count).toFixed(2),
          reviewCount: d.count
        };
      })
      .filter(t => t.reviewCount >= 1)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);

    // Lowest-rated technicians
    const lowestTechnicians = Object.entries(techMap)
      .map(([id, d]) => {
        const prov = providers.find(p => p.id === id);
        return {
          name: prov?.full_name || 'Unknown',
          avgRating: +(d.sum / d.count).toFixed(2),
          reviewCount: d.count
        };
      })
      .filter(t => t.reviewCount >= 1)
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 5);

    // Feedback by service type
    const svcMap = {};
    filtered.forEach(r => {
      const booking = bookings.find(b => b.id === r.booking_id);
      if (booking) {
        const svc = services.find(s => s.id === booking.service_id);
        const name = svc?.name || 'Unknown';
        if (!svcMap[name]) svcMap[name] = { sum: 0, count: 0 };
        svcMap[name].sum += (r.rating || 0);
        svcMap[name].count += 1;
      }
    });
    const feedbackByService = Object.entries(svcMap)
      .map(([name, d]) => ({
        name: name.length > 18 ? name.substring(0, 18) + '…' : name,
        avgRating: +(d.sum / d.count).toFixed(2),
        reviewCount: d.count
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 10);

    // Recent reviews with comments
    const recentComments = filtered
      .filter(r => r.comment && r.comment.trim().length > 0)
      .sort((a, b) => (b.review_date || b.created_date || '').localeCompare(a.review_date || a.created_date || ''))
      .slice(0, 8)
      .map(r => {
        const prov = providers.find(p => p.id === r.provider_id);
        return {
          rating: r.rating,
          comment: r.comment,
          provider: prov?.full_name || 'Unknown',
          date: r.review_date || (r.created_date || '').substring(0, 10)
        };
      });

    const exportRows = filtered.map(r => {
      const prov = providers.find(p => p.id === r.provider_id);
      const booking = bookings.find(b => b.id === r.booking_id);
      const svc = booking ? services.find(s => s.id === booking.service_id) : null;
      return [
        r.review_date || (r.created_date || '').substring(0, 10),
        prov?.full_name || '',
        svc?.name || '',
        r.rating,
        r.comment || ''
      ];
    });

    return {
      totalReviews, avgRating, positive, negative, neutral, satisfactionRate,
      ratingDist, sentimentData, ratingTrend, topTechnicians, lowestTechnicians,
      feedbackByService, recentComments, exportRows
    };
  }, [reviews, providers, bookings, services, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: MessageSquare, label: 'Total Reviews', value: data.totalReviews, color: 'text-slate-900' },
          { icon: Star, label: 'Avg Rating', value: data.avgRating.toFixed(1), color: 'text-yellow-600' },
          { icon: ThumbsUp, label: 'Positive', value: data.positive, color: 'text-emerald-600' },
          { icon: ThumbsDown, label: 'Negative', value: data.negative, color: 'text-red-600' },
          { icon: TrendingUp, label: 'Satisfaction', value: `${data.satisfactionRate.toFixed(0)}%`, color: data.satisfactionRate >= 80 ? 'text-emerald-600' : 'text-orange-600' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rating Trend + Sentiment */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rating Trend Over Time</CardTitle>
            <ExportButtons title="Rating_Trend" headers={['Month', 'Avg Rating', 'Reviews']} rows={data.ratingTrend.map(r => [r.month, r.avgRating, r.reviewCount])} />
          </CardHeader>
          <CardContent>
            {data.ratingTrend.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No review data in selected period</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgRating" stroke="#eab308" strokeWidth={2} name="Avg Rating" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="reviewCount" stroke="#3b82f6" strokeWidth={2} name="# Reviews" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sentiment Breakdown</CardTitle></CardHeader>
          <CardContent>
            {data.sentimentData.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                    {data.sentimentData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution + Service Feedback */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.ratingDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Reviews" radius={[4, 4, 0, 0]}>
                  {data.ratingDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Feedback by Service</CardTitle>
            <ExportButtons title="Feedback_By_Service" headers={['Service', 'Avg Rating', 'Reviews']} rows={data.feedbackByService.map(r => [r.name, r.avgRating, r.reviewCount])} />
          </CardHeader>
          <CardContent>
            {data.feedbackByService.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.feedbackByService}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avgRating" fill="#8b5cf6" name="Avg Rating" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top & Lowest Technicians */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top-Rated Technicians</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topTechnicians.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">{idx + 1}</div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">{t.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({t.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {t.avgRating}
                  </span>
                </div>
              ))}
              {data.topTechnicians.length === 0 && <p className="text-slate-500 text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Needs Improvement</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowestTechnicians.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">{idx + 1}</div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">{t.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({t.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-sm text-red-600">
                    <Star className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                    {t.avgRating}
                  </span>
                </div>
              ))}
              {data.lowestTechnicians.length === 0 && <p className="text-slate-500 text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Comments */}
      <Card>
        <CardHeader><CardTitle>Recent Customer Comments</CardTitle></CardHeader>
        <CardContent>
          {data.recentComments.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No comments in selected period</p>
          ) : (
            <div className="space-y-3">
              {data.recentComments.map((c, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= c.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-600">for {c.provider}</span>
                    </div>
                    <span className="text-xs text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <ExportButtons title="Customer_Feedback" headers={['Date', 'Technician', 'Service', 'Rating', 'Comment']} rows={data.exportRows} />
      </div>
    </div>
  );
}