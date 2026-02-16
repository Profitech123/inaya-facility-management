import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Banknote, Sparkles, Star, Package, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

function ServiceResultCard({ item, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
    >
      <Card className="border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 border-emerald-200 bg-emerald-50">
                  {item.category || 'Service'}
                </Badge>
                {item.match_score >= 90 && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] gap-1">
                    <Star className="w-3 h-3" /> Best Match
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                {item.service_name}
              </h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.ai_reason}</p>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {item.estimated_price && (
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{item.estimated_price}</span>
                  </div>
                )}
                {item.estimated_duration && (
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{item.estimated_duration}</span>
                  </div>
                )}
              </div>
            </div>

            <Link to={createPageUrl('BookService') + '?service=' + item.service_id}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 whitespace-nowrap">
                Book Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PackageResultCard({ pkg, idx }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
    >
      <Card className="border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all group overflow-hidden bg-gradient-to-br from-purple-50/50 to-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] gap-1">
                  <Package className="w-3 h-3" /> Subscription Package
                </Badge>
                {pkg.savings && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                    Save {pkg.savings}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.package_name}</h3>
              <p className="text-sm text-slate-500 mb-3">{pkg.ai_reason}</p>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                  <Banknote className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">{pkg.monthly_price}</span>
                  <span className="text-slate-400">/month</span>
                </div>
              </div>
            </div>

            <Link to={createPageUrl('Subscriptions')}>
              <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-1.5 whitespace-nowrap">
                View Plan <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ServiceFinderResults({ results }) {
  if (!results) return null;

  const { services = [], packages = [], summary, suggest_quote } = results;

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-900 mb-0.5">AI Recommendation</p>
            <p className="text-sm text-emerald-800 leading-relaxed">{summary}</p>
          </div>
        </motion.div>
      )}

      {/* Matched Services */}
      {services.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-900">Matching Services</h3>
            <span className="text-sm text-slate-400">({services.length} found)</span>
          </div>
          <div className="space-y-3">
            {services.map((item, idx) => (
              <ServiceResultCard key={idx} item={item} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Package Suggestions */}
      {packages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-slate-900">Recommended Packages</h3>
          </div>
          <div className="space-y-3">
            {packages.map((pkg, idx) => (
              <PackageResultCard key={idx} pkg={pkg} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Quote suggestion */}
      {suggest_quote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
        >
          <p className="text-sm text-amber-800 mb-2">
            <strong>Need something more specific?</strong> Your request may benefit from a custom quote.
          </p>
          <p className="text-xs text-amber-600 mb-0">
            Use the form below to tell us more about your requirements.
          </p>
        </motion.div>
      )}
    </div>
  );
}