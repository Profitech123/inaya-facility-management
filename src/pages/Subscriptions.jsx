import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Puzzle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PlanCards from '../components/subscriptions/PlanCards';
import ComparisonTable from '../components/subscriptions/ComparisonTable';
import PlanManagement from '../components/subscriptions/PlanManagement';
import AIPackageSuggestion from '../components/subscriptions/AIPackageSuggestion';

export default function Subscriptions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    clientAuth.me().then(setUser).catch(() => {});
  }, []);

  const { data: packages = [] } = useQuery({
    queryKey: ['subscriptionPackages'],
    queryFn: async () => {
      try {
        const allPackages = await base44.entities.SubscriptionPackage.list();
        return allPackages.filter(pkg => pkg.is_active === true);
      } catch (error) {
        console.error('Error fetching packages:', error);
        return [];
      }
    },
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['userSubscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const allSubs = await base44.entities.Subscription.list();
        return allSubs.filter(sub => sub.customer_id === user.id && sub.status === 'active');
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    initialData: []
  });

  const currentSub = subscriptions[0];
  const currentPkg = currentSub ? packages.find(p => p.id === currentSub.package_id) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                Upgrade Your Comfort
              </h1>
              <p className="text-slate-500 max-w-lg text-lg">
                Professional home maintenance tailored to your needs. Choose a plan that ensures peace of mind for you and your family.
              </p>
            </div>

            {/* Current plan badge */}
            {currentPkg && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3 flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 tracking-wider">CURRENT PLAN</div>
                  <div className="font-bold text-slate-900">{currentPkg.name}</div>
                  {currentSub?.end_date && (
                    <div className="text-xs text-slate-400">Renewing {currentSub.end_date}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Package Builder CTA */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-0">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Puzzle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Build Your Own Package</h3>
              <p className="text-emerald-100 text-sm">Mix & match services, set frequencies, and save custom plans tailored to your home.</p>
            </div>
          </div>
          <Link to={createPageUrl('PackageBuilder')}>
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold gap-2 px-6 shadow-md">
              Start Building <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Package Suggestion */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-0">
        <AIPackageSuggestion packages={packages} />
      </div>

      {/* Plan Cards */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        {packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg mb-2">Subscription packages coming soon!</p>
            <p className="text-slate-400">We're preparing exclusive plans for homeowners.</p>
          </div>
        ) : (
          <PlanCards packages={packages} currentPkgId={currentPkg?.id} />
        )}
      </div>

      {/* Comparison Table */}
      {packages.length > 0 && (
        <div className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <ComparisonTable packages={packages} />
          </div>
        </div>
      )}

      {/* Plan Management / FAQ */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <PlanManagement />
      </div>
    </div>
  );
}
