import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PlanCards({ packages, currentPkgId }) {
  // Sort packages by price
  const sorted = [...packages].sort((a, b) => (a.monthly_amount || 0) - (b.monthly_amount || 0));

  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      {sorted.map((pkg, index) => {
        const isPopular = pkg.popular;
        const isCurrent = pkg.id === currentPkgId;

        return (
          <div
            key={pkg.id}
            className={`relative rounded-2xl border-2 bg-white p-6 transition-all ${isPopular
                ? 'border-emerald-500 shadow-xl shadow-emerald-100/50 scale-[1.03] z-10'
                : 'border-slate-200 hover:border-slate-300'
              }`}
          >
            {/* Popular badge */}
            {isPopular && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-emerald-500 text-white px-3 py-1 text-[10px] font-bold tracking-wider">
                  VALUE
                </Badge>
              </div>
            )}

            {/* Plan name & price */}
            <h3 className="text-lg font-bold text-slate-900 mb-3">{pkg.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-sm text-slate-400">AED</span>
              <span className={`text-4xl font-bold ${isPopular ? 'text-emerald-600' : 'text-slate-900'}`}>
                {pkg.monthly_amount}
              </span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
            <p className="text-sm text-slate-500 mb-5 min-h-[40px]">
              {pkg.description || 'Professional home maintenance plan.'}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {(pkg.features || []).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
              {/* Show a "not included" item for cheapest plan if no negative features present */}
              {index === 0 && (pkg.features || []).length < 5 && (
                <li className="flex items-start gap-2 text-sm">
                  <X className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400">No Handyman services</span>
                </li>
              )}
            </ul>

            {/* CTA */}
            {isCurrent ? (
              <Button variant="outline" className="w-full rounded-full" disabled>
                Current Plan
              </Button>
            ) : isPopular ? (
              <Link to={createPageUrl('SubscribePackage') + '?package=' + pkg.id}>
                <Button className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                  Upgrade Now
                </Button>
              </Link>
            ) : (
              <Link to={createPageUrl('SubscribePackage') + '?package=' + pkg.id}>
                <Button variant="outline" className="w-full rounded-full">
                  Select Plan
                </Button>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}