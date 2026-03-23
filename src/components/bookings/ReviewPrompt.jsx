import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ReviewPrompt({ booking, provider, userId, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    await base44.entities.ProviderReview.create({
      provider_id: booking.assigned_provider_id,
      booking_id: booking.id,
      customer_id: userId,
      rating,
      comment: comment.trim() || undefined,
      review_date: new Date().toISOString().split('T')[0],
    });
    // Update provider average rating
    const reviews = await base44.entities.ProviderReview.filter({ provider_id: booking.assigned_provider_id });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await base44.entities.Provider.update(booking.assigned_provider_id, {
      average_rating: Math.round(avg * 10) / 10,
    });
    toast.success('Thank you for your review!');
    setDone(true);
    setSubmitting(false);
    if (onDone) onDone();
  };

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-emerald-800">Review submitted — thank you!</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
      <div>
        <p className="font-bold text-slate-900 text-sm">How did we do?</p>
        {provider && <p className="text-xs text-slate-500 mt-0.5">Rate your experience with {provider.full_name}</p>}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hovered || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-medium text-slate-600">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      <Textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share any comments (optional)…"
        rows={2}
        className="text-sm bg-white"
      />

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Review
        </Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone} className="text-slate-500 text-sm">
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}