import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { CheckCircle, Puzzle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PlanCards from '../components/subscriptions/PlanCards';
import ComparisonTable from '../components/subscriptions/ComparisonTable';
import PlanManagement from '../components/subscriptions/PlanManagement';
import AIPackageSuggestion from '../components/subscriptions/AIPackageSuggestion';
import { STATIC_PACKAGES } from '@/data/services';

export default function Subscriptions() {
  const [user, setUser] = useState(null);
  useEffect(() => { clientAuth.me().then(setUser).catch(() => {}); }, []);

  const { data: packages = [] } = useQuery({
    queryKey: ['subscriptionPackages'],
    queryFn: async () => { try { return (await base44.entities.SubscriptionPackage.list()).filter(pkg => pkg.is_active); } catch { return []; } },
    initialData: []
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['userSubscriptions', user?.id],
    queryFn: async () => { if (!user?.id) return []; try { return (await base44.entities.Subscription.list()).filter(sub => sub.customer_id === user.id && sub.status === 'active'); } catch { return []; } },
    enabled: !!user?.id, initialData: []
  });

  const displayPackages = packages.length > 0 ? packages : STATIC_PACKAGES;
  const currentSub = subscriptions[0];
  const currentPkg = currentSub ? displayPackages.find(p => p.id === currentSub.package_id) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Hero */}
      <div className="bg-white border-b border-[hsl(40,10%,90%)]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <p className="text-[hsl(160,60%,38%)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Subscription Packages</p>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[hsl(210,20%,10%)] mb-4 leading-tight">
                Upgrade your <em className="text-[hsl(160,60%,38%)] not-italic">comfort</em>
              </h1>
              <p className="text-[hsl(210,10%,55%)] text-lg max-w-lg leading-relaxed">
                Professional home maintenance tailored to your needs. Choose a plan that ensures peace of mind.
              </p>
            </div>
            {currentPkg && (
              <div className="bg-[hsl(40,15%,96%)] rounded-2xl border border-[hsl(40,10%,90%)] p-5 flex items-center gap-4 flex-shrink-0">
                <CheckCircle className="w-7 h-7 text-[hsl(160,60%,38%)]" />
                <div>
                  <div className="text-[10px] font-bold text-[hsl(160,60%,38%)] tracking-[0.15em] uppercase">Current Plan</div>
                  <div className="font-bold text-[hsl(210,20%,10%)]">{currentPkg.name}</div>
                  {currentSub?.end_date && <div className="text-xs text-[hsl(210,10%,55%)]">Renewing {currentSub.end_date}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Package Builder */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-10">
        <div className="rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Puzzle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Build Your Own Package</h3>
              <p className="text-white/70 text-sm">Mix and match services, set frequencies, and save custom plans.</p>
            </div>
          </div>
          <Link to={createPageUrl('PackageBuilder')}>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-[hsl(160,60%,30%)] rounded-full text-sm font-semibold hover:shadow-lg transition-all">
              Start Building <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-8">
        <AIPackageSuggestion packages={displayPackages} />
      </div>

      {/* Plan Cards */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <PlanCards packages={displayPackages} currentPkgId={currentPkg?.id} />
      </div>

      {/* Comparison Table */}
      <div className="bg-white border-y border-[hsl(40,10%,90%)]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <ComparisonTable packages={displayPackages} />
        </div>
      </div>

      {/* Plan Management */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <PlanManagement />
      </div>
    </div>
  );
}
