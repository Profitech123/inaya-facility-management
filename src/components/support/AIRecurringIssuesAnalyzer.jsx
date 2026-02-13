import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

export default function AIRecurringIssuesAnalyzer({ tickets }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (tickets.length < 3) return;
    setLoading(true);

    const ticketSummaries = tickets.slice(0, 80).map(t => ({
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      date: t.created_date?.split('T')[0],
      description: (t.description || '').slice(0, 200)
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a customer support analytics AI for INAYA Facilities Management (Dubai-based property maintenance).

Analyze these ${ticketSummaries.length} support tickets and identify patterns:

${JSON.stringify(ticketSummaries, null, 1)}

Provide:
1. Top 3-5 recurring issue themes with frequency count estimates
2. Trends — are any categories increasing?
3. Actionable recommendations to reduce ticket volume (specific to facilities management)
4. FAQ gaps — topics customers ask about that aren't covered in existing FAQs
5. Overall health score (1-10) where 10 = very few issues

Be specific and data-driven. Reference actual ticket subjects where relevant.`,
      response_json_schema: {
        type: "object",
        properties: {
          recurring_issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme: { type: "string" },
                count_estimate: { type: "number" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                example_subjects: { type: "array", items: { type: "string" } }
              }
            }
          },
          trends: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          faq_gaps: { type: "array", items: { type: "string" } },
          health_score: { type: "number" },
          summary: { type: "string" }
        }
      }
    });

    setAnalysis(result);
    setLoading(false);
  };

  const sevColor = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            AI Issue Pattern Analysis
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={runAnalysis}
            disabled={loading || tickets.length < 3}
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="w-3.5 h-3.5" /> {analysis ? 'Re-analyze' : 'Analyze Tickets'}</>
            )}
          </Button>
        </div>
        {tickets.length < 3 && (
          <p className="text-xs text-slate-400">Need at least 3 tickets to analyze patterns</p>
        )}
      </CardHeader>

      {analysis && (
        <CardContent className="space-y-5">
          {/* Health Score */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
              analysis.health_score >= 7 ? 'bg-green-100 text-green-700' :
              analysis.health_score >= 4 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {analysis.health_score}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">Support Health Score</div>
              <p className="text-xs text-slate-500">{analysis.summary}</p>
            </div>
          </div>

          {/* Recurring Issues */}
          {analysis.recurring_issues?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Recurring Issues
              </h4>
              <div className="space-y-2">
                {analysis.recurring_issues.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800">{issue.theme}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">~{issue.count_estimate} tickets</Badge>
                        <Badge className={`text-[10px] ${sevColor[issue.severity] || sevColor.medium}`}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                    {issue.example_subjects?.length > 0 && (
                      <p className="text-[11px] text-slate-400 truncate">e.g. {issue.example_subjects.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          {analysis.trends?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Trends
              </h4>
              <ul className="space-y-1">
                {analysis.trends.map((t, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <BarChart3 className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-500" /> Recommendations
              </h4>
              <ul className="space-y-1.5">
                {analysis.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQ Gaps */}
          {analysis.faq_gaps?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">📚 Suggested FAQ Additions</h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.faq_gaps.map((g, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-slate-600">{g}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}