import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
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
    badge: "Best Value",
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
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-600 text-sm font-bold tracking-[0.15em] uppercase">Pricing</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">Simple, Transparent Plans</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Choose a plan that fits your property. All plans include certified technicians and satisfaction guarantee.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.featured
                  ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-100/50 md:-mt-4 md:mb-4'
                  : 'bg-white border border-slate-200 hover:shadow-lg'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />{plan.badge}
                </Badge>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-400 mb-5">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-slate-400">AED</span>
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-400 text-sm">/mo</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl('Subscriptions')}>
                <Button className={`w-full h-11 gap-2 ${
                  plan.featured ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white'
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