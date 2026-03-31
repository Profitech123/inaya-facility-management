import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, MapPin, CreditCard, Pause, Play, XCircle, ArrowUpCircle,
  PlusCircle, ChevronDown, ChevronUp, CheckCircle2, Clock, Home
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  active:    { label: 'Active',    className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  paused:    { label: 'Paused',    className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
  expired:   { label: 'Expired',   className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function SubscriptionCard({ subscription, pkg, property, onPause, onResume, onCancel, onUpgrade, onAddProperty }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.expired;

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
  };

  const daysUntilBilling = () => {
    if (!subscription.next_billing_date) return null;
    try {
      const diff = Math.ceil((new Date(subscription.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
      return diff;
    } catch { return null; }
  };

  const days = daysUntilBilling();

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Color top bar */}
      <div className={`h-1.5 w-full ${subscription.status === 'active' ? 'bg-emerald-500' : subscription.status === 'paused' ? 'bg-yellow-400' : 'bg-slate-300'}`} />

      <CardContent className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl font-bold text-slate-900">{pkg?.name || 'Package'}</h3>
              <Badge className={`text-xs border ${statusCfg.className}`}>{statusCfg.label}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{property?.address || 'Property not found'}{property?.area ? `, ${property.area}` : ''}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-slate-900">AED {subscription.monthly_amount?.toLocaleString()}</div>
            <div className="text-xs text-slate-400">/month</div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Calendar className="w-3.5 h-3.5" />Started</div>
            <div className="text-sm font-semibold text-slate-800">{formatDate(subscription.start_date)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Clock className="w-3.5 h-3.5" />Next Billing</div>
            <div className={`text-sm font-semibold ${days !== null && days <= 7 ? 'text-amber-600' : 'text-slate-800'}`}>
              {formatDate(subscription.next_billing_date)}
              {days !== null && days >= 0 && <span className="block text-xs font-normal text-slate-400">in {days}d</span>}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><CreditCard className="w-3.5 h-3.5" />Payment</div>
            <div className="text-sm font-semibold text-slate-800 capitalize">{subscription.payment_method || 'Card'}</div>
          </div>
        </div>

        {/* Pause/cancel reason notice */}
        {(subscription.pause_reason || subscription.cancel_reason) && (
          <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <span className="font-medium">Reason: </span>
            {subscription.pause_reason || subscription.cancel_reason}
          </div>
        )}

        {/* Package features expandable */}
        {pkg?.features?.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'View'} package inclusions
          </button>
        )}
        {expanded && pkg?.features && (
          <ul className="mb-4 space-y-1.5 pl-1">
            {pkg.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {subscription.status === 'active' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onPause(subscription)}>
                <Pause className="w-3.5 h-3.5 mr-1.5" />Pause
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpgrade(subscription)}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />Upgrade Plan
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAddProperty(subscription)}
                className="text-blue-700 border-blue-200 hover:bg-blue-50">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />Add Property
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCancel(subscription)}
                className="text-red-600 border-red-200 hover:bg-red-50 ml-auto">
                <XCircle className="w-3.5 h-3.5 mr-1.5" />Cancel
              </Button>
            </>
          )}
          {subscription.status === 'paused' && (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onResume(subscription)}>
                <Play className="w-3.5 h-3.5 mr-1.5" />Resume Subscription
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCancel(subscription)}
                className="text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="w-3.5 h-3.5 mr-1.5" />Cancel
              </Button>
            </>
          )}
          {subscription.status === 'cancelled' && (
            <Button size="sm" variant="outline" onClick={() => onUpgrade(subscription)}>
              <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />Re-subscribe
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}