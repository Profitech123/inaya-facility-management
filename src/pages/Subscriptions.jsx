import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Puzzle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import PlanCards from '../components/subscriptions/PlanCards';
import ComparisonTable from '../components/subscriptions/ComparisonTable';
import PlanManagement from '../components/subscriptions/PlanManagement';
import AIPackageSuggestion from '../components/subscriptions/AIPackageSuggestion';

export default function Subscriptions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
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
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-700/20 rounded-full blur-[160px] -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-teal-800/15 rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }} />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-semibold text-[11px] tracking-[0.2em] uppercase">Subscription Plans</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl lg:text-6xl font-bold mb-5 tracking-tight"
              >
                Upgrade Your Comfort
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-slate-300 max-w-lg font-light leading-relaxed"
              >
                Professional home maintenance tailored to your needs. Choose a plan that ensures peace of mind for you and your family.
              </motion.p>
            </div>
            {currentPkg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 flex items-center gap-4 flex-shrink-0"
              >
                <CheckCircle className="w-7 h-7 text-emerald-400" />
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 tracking-wider mb-0.5">CURRENT PLAN</div>
                  <div className="font-bold text-white text-lg">{currentPkg.name}</div>
                  {currentSub?.end_date && (
                    <div className="text-xs text-slate-400 mt-0.5">Renewing {currentSub.end_date}</div>
                  )}
                </div>
              </motion.div>
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