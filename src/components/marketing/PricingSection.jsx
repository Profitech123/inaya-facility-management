import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: "Essential Care",
    price: 299,
    desc: "Basic apartment coverage with core maintenance essentials.",
    featured: false,
    features: [
      "Monthly AC filter cleaning",
      "Quarterly pest control",
      "Basic plumbing check-up",
      "Email support",
      "10% off on-demand services",
    ],
  },
  {
    name: "Silver Shield",
    price: 499,
    desc: "Comprehensive care for apartments and townhouses.",
    featured: true,
    badge: "Most Popular",
    features: [
      "Monthly AC deep servicing",
      "Bi-monthly pest control",
      "Plumbing & electrical checks",
      "Priority scheduling",
      "15% off on-demand services",
      "Dedicated account manager",
    ],
  },
  {
    name: "Gold Elite",
    price: 899,
    desc: "Premium all-inclusive for villas and large properties.",
    featured: false,
    features: [
      "Weekly AC & MEP check-ups",
      "Monthly pest control & landscaping",
      "Full plumbing, electrical & civil",
      "24/7 priority emergency response",
      "20% off on-demand services",
      "Personal maintenance concierge",
      "Pool maintenance included",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-28 bg-slate-50/50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-50/50 to-blue-50/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2 mb-5 shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Pricing</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Simple, Transparent Plans</h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto text-lg font-light">Choose a plan that fits your property. All plans include certified technicians and satisfaction guarantee.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-3xl p-8 lg:p-9 transition-all duration-500 ${
                plan.featured
                  ? 'bg-slate-900 text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] md:-mt-6 md:mb-6 ring-1 ring-white/10'
                  : 'bg-white border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-1.5 text-xs font-bold border-0 shadow-lg shadow-emerald-500/25">
                  <Sparkles className="w-3 h-3 mr-1.5" />{plan.badge}
                </Badge>
              )}

              <h3 className={`text-xl font-extrabold mb-1 tracking-tight ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.featured ? 'text-slate-400' : 'text-slate-400'}`}>{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-sm ${plan.featured ? 'text-slate-500' : 'text-slate-400'}`}>AED</span>
                <span className={`text-5xl font-extrabold tracking-tight ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                <span className={`text-sm ${plan.featured ? 'text-slate-500' : 'text-slate-400'}`}>/mo</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.featured ? 'bg-emerald-500/20' : 'bg-emerald-50'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.featured ? 'text-emerald-400' : 'text-emerald-600'}`} strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl('Subscriptions')}>
                <Button className={`w-full h-12 gap-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10'
                }`}>
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}