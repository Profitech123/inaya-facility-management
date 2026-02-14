import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function TechnicianReviewsList({ providerId }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['providerReviews', providerId],
    queryFn: () => base44.entities.ProviderReview.filter({ provider_id: providerId }, '-created_date'),
    enabled: !!providerId,
    initialData: []
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const all = await base44.entities.Provider.list();
      return all.find(p => p.id === providerId);
    },
    enabled: !!providerId
  });

  if (isLoading) return <div className="text-sm text-slate-400 text-center py-8">Loading reviews...</div>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {provider?.profile_image ? (
                <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-emerald-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{provider?.full_name || 'Technician'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-slate-900">{avgRating}</span>
                <span className="text-sm text-slate-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
              {provider?.specialization?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {provider.specialization.map(s => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden sm:block space-y-1">
              {ratingDist.map(d => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-slate-500">{d.star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-slate-400 w-6">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {review.review_date ? format(new Date(review.review_date), 'MMM d, yyyy') : format(new Date(review.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
                {review.comment ? (
                  <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No comment provided</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No reviews yet</p>
        </div>
      )}
    </div>
  );
}