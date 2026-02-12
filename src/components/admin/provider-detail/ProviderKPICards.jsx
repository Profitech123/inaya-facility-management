import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Star, Clock, ThumbsUp } from 'lucide-react';

export default function ProviderKPICards({ provider, bookings, reviews }) {
  const totalJobs = provider.total_jobs_completed || bookings.filter(b => b.status === 'completed').length || 0;
  const avgRating = provider.average_rating || 0;

  const completedOnTime = bookings.filter(b => b.status === 'completed').length;
  const totalCompleted = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length;
  const onTimeRate = totalCompleted > 0 ? Math.round((completedOnTime / totalCompleted) * 100) : 0;

  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const csatScore = reviews.length > 0 ? Math.round((positiveReviews / reviews.length) * 100) : 0;

  const cards = [
    {
      label: 'TOTAL JOBS',
      value: totalJobs.toLocaleString(),
      trend: '+12%',
      trendUp: true,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'AVG RATING',
      value: `${avgRating.toFixed(1)}/5`,
      trend: '+0.1',
      trendUp: true,
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'ON-TIME RATE',
      value: `${onTimeRate}%`,
      trend: 'Excellent',
      trendUp: true,
      icon: Clock,
      color: 'text-emerald-600'
    },
    {
      label: 'CSAT SCORE',
      value: `${csatScore}%`,
      trend: reviews.length > 0 ? `${reviews.length} reviews` : 'No reviews',
      trendUp: csatScore >= 90,
      icon: ThumbsUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <div className={`text-xs mt-1 ${card.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                {card.trend}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}