import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, ThumbsUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIFeedbackSummarizer({ reviews = [], tickets = [], bookings = [] }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);

    const recentReviews = reviews.slice(0, 30).map(r => ({
      rating: r.rating,
      comment: r.comment?.slice(0, 200) || '',
      date: r.review_date
    }));

    const recentTickets = tickets.slice(0, 20).map(t => ({
      category: t.category,
      priority: t.priority,
      status: t.status,
      subject: t.subject?.slice(0, 100) || ''
    }));

    const bookingStats = {
      total: bookings.length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      pending: bookings.filter(b => b.status === 'pending').length,
    };

    const prompt = `You are an expert business analyst for INAYA Facilities Management in Dubai.

Analyze the following customer data and provide actionable insights:

CUSTOMER REVIEWS (${recentReviews.length} recent):
${JSON.stringify(recentReviews)}

SUPPORT TICKETS (${recentTickets.length} recent):
${JSON.stringify(recentTickets)}

BOOKING STATS:
${JSON.stringify(bookingStats)}

Provide a comprehensive summary with:
1. Overall customer sentiment (positive/neutral/negative) with a score 1-10
2. Top 3 things customers love
3. Top 3 pain points or complaints
4. 3 actionable recommendations to improve customer satisfaction
5. Any urgent issues that need immediate attention
6. A brief trend analysis (improving/declining/stable)

Be specific, data-driven, and concise. Use bullet points.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_score: { type: "number", description: "1-10 sentiment score" },
            sentiment_label: { type: "string", description: "positive, neutral, or negative" },
            trend: { type: "string", description: "improving, stable, or declining" },
            summary_markdown: { type: "string", description: "Full analysis in markdown format with sections for loves, pain points, recommendations, and urgent issues" },
            urgent_count: { type: "number", description: "Number of urgent issues identified" },
            top_positive: { type: "string", description: "Single most praised thing" },
            top_negative: { type: "string", description: "Single biggest complaint" },
          }
        }
      });
      setSummary(res);
    } catch {
      setSummary({ error: true });
    }
    setLoading(false);
  };

  const sentimentColor = (label) => {
    if (label === 'positive') return 'bg-emerald-100 text-emerald-800';
    if (label === 'negative') return 'bg-red-100 text-red-800';
    return 'bg-amber-100 text-amber-800';
  };

  const trendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <TrendingUp className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Feedback Summary</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Powered by AI · Analyzes reviews, tickets & bookings</p>
            </div>
          </div>
          <Button
            onClick={generateSummary}
            disabled={loading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
            ) : summary ? (
              <><RefreshCw className="w-3.5 h-3.5" /> Refresh</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Generate Summary</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <div className="text-center py-8 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-300" />
            <p className="text-sm">Click "Generate Summary" to get AI-powered insights from customer feedback</p>
            <p className="text-xs mt-1">Analyzes {reviews.length} reviews, {tickets.length} tickets, and {bookings.length} bookings</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Analyzing customer feedback patterns...</p>
          </div>
        )}

        {summary && !summary.error && (
          <div className="space-y-5">
            {/* Sentiment overview */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Sentiment:</span>
                <Badge className={sentimentColor(summary.sentiment_label)}>
                  {summary.sentiment_label} ({summary.sentiment_score}/10)
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Trend:</span>
                {trendIcon(summary.trend)}
                <span className="text-sm font-medium capitalize">{summary.trend}</span>
              </div>
              {summary.urgent_count > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">{summary.urgent_count} urgent issue{summary.urgent_count > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Quick highlights */}
            <div className="grid sm:grid-cols-2 gap-3">
              {summary.top_positive && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Top Praise</span>
                  </div>
                  <p className="text-sm text-emerald-800">{summary.top_positive}</p>
                </div>
              )}
              {summary.top_negative && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-semibold text-red-700">Top Complaint</span>
                  </div>
                  <p className="text-sm text-red-800">{summary.top_negative}</p>
                </div>
              )}
            </div>

            {/* Full analysis */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>{summary.summary_markdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {summary?.error && (
          <div className="text-center py-8 text-red-400">
            <p className="text-sm">Failed to generate summary. Please try again.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}