import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDraftResponse({ ticket, onUseResponse }) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const generateDraft = async () => {
    setLoading(true);
    setEditing(false);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional customer support agent at INAYA Facilities Management, a Dubai-based property maintenance company.

Generate a helpful, empathetic, and professional response for this support ticket:

Subject: "${ticket.subject}"
Category: ${ticket.category}
Priority: ${ticket.priority}
Customer Description: "${ticket.description}"

Guidelines:
- Be warm and professional, use the customer's concern as context
- Acknowledge their issue clearly
- Provide concrete next steps or resolution
- If it's a billing issue, mention the team will review their account
- If scheduling, offer alternative options
- If service quality, apologize and offer a resolution
- Keep it concise (3-5 sentences)
- Sign off as "INAYA Support Team"
- Do NOT invent specific details like dates or amounts
- Use AED as currency if relevant`
    });

    setDraft(result);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/30 mt-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI Draft Response</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={generateDraft}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
            ) : draft ? (
              <><RefreshCw className="w-3 h-3" /> Regenerate</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Generate Draft</>
            )}
          </Button>
        </div>

        {draft && (
          <div className="space-y-2">
            {editing ? (
              <Textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={5}
                className="text-sm bg-white"
              />
            ) : (
              <div
                className="bg-white rounded-lg p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap cursor-pointer border border-indigo-100"
                onClick={() => setEditing(true)}
              >
                {draft}
                <p className="text-[10px] text-slate-400 mt-2 italic">Click to edit</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onUseResponse(draft)}
              >
                <Check className="w-3 h-3" /> Use as Resolution
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}