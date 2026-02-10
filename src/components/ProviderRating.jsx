import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderRating({ booking, provider, onComplete }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async (data) => {
      const review = await base44.entities.ProviderReview.create(data);
      
      const reviews = await base44.entities.ProviderReview.filter({ provider_id: provider.id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await base44.entities.Provider.update(provider.id, {
        ...provider,
        average_rating: avgRating
      });
      
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['providerReviews']);
      toast.success('Thank you for your feedback!');
      if (onComplete) onComplete();
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    submitReviewMutation.mutate({
      provider_id: provider.id,
      booking_id: booking.id,
      customer_id: booking.customer_id,
      rating,
      comment,
      review_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Service</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-sm text-slate-600 mb-3">How was your experience with {provider.full_name}?</div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience (optional)"
          rows={4}
          className="mb-4"
        />

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={submitReviewMutation.isPending}
        >
          {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
}