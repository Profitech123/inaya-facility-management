import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gradeColor = { A: 'text-emerald-600', B: 'text-blue-600', C: 'text-amber-600', D: 'text-orange-600', F: 'text-red-600' };
const gradeRing = { A: 'ring-emerald-200', B: 'ring-blue-200', C: 'ring-amber-200', D: 'ring-orange-200', F: 'ring-red-200' };
const urgencyColor = { high: 'bg-red-50 border-red-200 text-red-700', medium: 'bg-amber-50 border-amber-200 text-amber-700', low: 'bg-blue-50 border-blue-200 text-blue-700' };

export default function PropertyHealthScore({ user, properties = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const calculate = async () => {
    setLoading(true);
    const pid = selectedProperty || properties[0]?.id;
    const res = await base44.functions.invoke('aiPropertyHealthScore', { property_id: pid });
    setData(res.data);
    setExpanded(true);
    setLoading(false);
  };

  const scoreColor = data ? (data.score >= 80 ? 'text-emerald-600' : data.score >= 60 ? 'text-amber-600' : 'text-red-600') : '';
  const scoreBg = data ? (data.score >= 80 ? 'bg-emerald-500' : data.score >= 60 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-300';

  return (
    <Card className="overflow-hidden border-slate-200">
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-400" />
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm text-slate-900">Property Health Score</span>
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50 ml-1">AI</Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={calculate} disabled={loading} className="gap-1 text-xs">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {data ? 'Refresh' : 'Calculate'}
          </Button>
        </div>

        {!data && !loading && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-3">Get an AI-powered health assessment of your property's maintenance status.</p>
            <Button size="sm" onClick={calculate} className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1">
              <Activity className="w-3 h-3" /> Calculate Score
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            Analyzing your property maintenance history...
          </div>
        )}

        {data && !loading && (
          <div>
            {/* Score circle + summary */}
            <div className="flex items-center gap-5 mb-4">
              <div className={`relative w-20 h-20 flex-shrink-0`}>
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                  <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7"
                    className={scoreBg.replace('bg-', 'stroke-')}
                    strokeDasharray={`${(data.score / 100) * 213.6} 213.6`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-extrabold ${scoreColor}`}>{data.score}</span>
                  <span className={`text-xs font-bold ${gradeColor[data.grade] || 'text-slate-600'}`}>{data.grade}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 font-medium mb-1">{data.summary}</p>
                {data.alerts?.filter(a => a.urgency === 'high').length > 0 && (
                  <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    {data.alerts.filter(a => a.urgency === 'high').length} urgent issue{data.alerts.filter(a => a.urgency === 'high').length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            {data.alerts?.length > 0 && (
              <div className="space-y-2 mb-3">
                {data.alerts.slice(0, expanded ? 10 : 2).map((alert, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${urgencyColor[alert.urgency] || urgencyColor.low}`}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{alert.service}: </span>
                      {alert.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.alerts?.length > 2 && (
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Show less' : `Show ${data.alerts.length - 2} more`}
              </button>
            )}

            {data.biggest_risk && (
              <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-100 text-xs text-red-700">
                <span className="font-semibold">⚠️ Biggest Risk: </span>{data.biggest_risk}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}