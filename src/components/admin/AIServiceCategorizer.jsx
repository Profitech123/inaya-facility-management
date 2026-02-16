import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Check, Tag } from 'lucide-react';

export default function AIServiceCategorizer({ serviceName, serviceDescription, categories, onApply }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const analyze = async () => {
    if (!serviceName && !serviceDescription) return;
    setLoading(true);
    setSuggestion(null);

    const catList = categories.map(c => `${c.id}|${c.name}|${c.slug}`).join('; ');

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI assistant for INAYA Facilities Management in Dubai (UAE).

Given a new service being added to the catalog, suggest:
1. The best matching category from the existing list
2. Relevant tags/keywords for this service
3. A suggested duration in minutes
4. Suggested features (inclusions) list

Service Name: "${serviceName}"
Service Description: "${serviceDescription}"

Available categories: ${catList}

If no category matches well, suggest "none" for category_id and explain what new category should be created.`,
      response_json_schema: {
        type: "object",
        properties: {
          category_id: { type: "string", description: "Best matching category ID from the list, or 'none'" },
          category_name: { type: "string", description: "Name of matched category" },
          new_category_suggestion: { type: "string", description: "If none matched, suggest a new category name" },
          tags: { type: "array", items: { type: "string" }, description: "Relevant tags/keywords" },
          suggested_duration: { type: "number", description: "Estimated duration in minutes" },
          suggested_features: { type: "array", items: { type: "string" }, description: "Suggested features/inclusions" },
          confidence: { type: "string", description: "high, medium, or low" },
          reasoning: { type: "string", description: "Brief explanation of categorization" }
        }
      }
    });
    setSuggestion(res);
    setLoading(false);
  };

  const confidenceColors = {
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-red-100 text-red-700'
  };

  if (!serviceName && !serviceDescription) return null;

  return (
    <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-slate-800">AI Auto-Categorize & Tag</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={analyze}
          disabled={loading || (!serviceName && !serviceDescription)}
          className="gap-1.5 text-violet-700 border-violet-300 hover:bg-violet-100"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {suggestion && (
        <div className="space-y-3">
          {/* Category suggestion */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Suggested Category</div>
              <div className="text-sm font-medium text-slate-900">
                {suggestion.category_id === 'none'
                  ? <span className="text-amber-700">New: {suggestion.new_category_suggestion}</span>
                  : suggestion.category_name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-[10px] ${confidenceColors[suggestion.confidence] || confidenceColors.medium}`}>
                {suggestion.confidence} confidence
              </Badge>
              {suggestion.category_id !== 'none' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                  onClick={() => onApply({ category_id: suggestion.category_id })}
                >
                  <Check className="w-3 h-3 mr-1" /> Apply
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {suggestion.tags?.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {suggestion.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] bg-white">
                    <Tag className="w-2.5 h-2.5 mr-1" />{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          {suggestion.suggested_duration && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Suggested Duration</div>
                <div className="text-sm text-slate-900">{suggestion.suggested_duration} minutes</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                onClick={() => onApply({ duration_minutes: suggestion.suggested_duration })}
              >
                <Check className="w-3 h-3 mr-1" /> Apply
              </Button>
            </div>
          )}

          {/* Features */}
          {suggestion.suggested_features?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-slate-500">Suggested Features</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                  onClick={() => onApply({ features: suggestion.suggested_features.join('\n') })}
                >
                  <Check className="w-3 h-3 mr-1" /> Apply All
                </Button>
              </div>
              <ul className="space-y-0.5">
                {suggestion.suggested_features.map((f, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reasoning */}
          <p className="text-[11px] text-slate-400 italic">{suggestion.reasoning}</p>
        </div>
      )}
    </div>
  );
}