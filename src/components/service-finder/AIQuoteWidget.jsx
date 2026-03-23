import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ArrowRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const urgencyConfig = {
  immediate:    { label: 'Needs Immediate Attention', color: 'bg-red-100 text-red-700 border-red-200',    icon: AlertTriangle },
  within_week:  { label: 'Book Within a Week',         color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  routine:      { label: 'Routine Service',             color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
};

export default function AIQuoteWidget() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getQuote = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('aiQuoteAssistant', { description });
    setResult(res.data);
    setLoading(false);
  };

  const urgency = result ? (urgencyConfig[result.urgency] || urgencyConfig.routine) : null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">AI Instant Quote</h3>
          <p className="text-xs text-slate-500">Describe your issue, get an instant estimate</p>
        </div>
      </div>

      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="e.g. 'My AC is making a loud noise and not cooling properly, villa in JBR with 4 bedrooms' or 'Pool water looks green and pump is running loud'"
        className="mb-3 text-sm bg-white border-emerald-200 focus:ring-emerald-500 resize-none"
        rows={3}
      />

      <Button
        onClick={getQuote}
        disabled={!description.trim() || loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 text-sm"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Get Instant Quote</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Diagnosis */}
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-sm text-slate-700 font-medium">🔍 {result.diagnosis}</p>
            </div>

            {/* Urgency */}
            {urgency && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${urgency.color}`}>
                <urgency.icon className="w-3.5 h-3.5" />
                {urgency.label}
              </div>
            )}

            {/* Services + prices */}
            {result.matched_services?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide">Recommended Services</div>
                {result.matched_services.map((svc, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{svc.service_name}</div>
                      <div className="text-xs text-slate-500">{svc.reason}</div>
                    </div>
                    <span className="text-sm font-bold text-emerald-700 flex-shrink-0 ml-2">AED {svc.estimated_price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total range */}
            <div className="bg-emerald-600 text-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs opacity-75 mb-0.5">Estimated Total</div>
                <div className="text-2xl font-extrabold tracking-tight">AED {result.total_min}–{result.total_max}</div>
                {result.estimated_duration_hours && (
                  <div className="text-xs opacity-75 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{result.estimated_duration_hours}h estimated
                  </div>
                )}
              </div>
              <Link to={createPageUrl('ServiceFinder')}>
                <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 gap-1 text-xs font-bold">
                  Book Now <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            {result.suggest_subscription && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                💡 <strong>Save with a subscription:</strong> {result.subscription_reason}
                <Link to={createPageUrl('Subscriptions')} className="ml-1 underline font-semibold">View plans →</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}