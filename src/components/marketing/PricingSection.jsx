import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const plans = [
  {
    name: "Essential Care",
    description: "Basic coverage for apartments.",
    price: "AED 299",
    period: "/month",
    featured: false,
    features: [
      "2 AC Services/Year",
      "Emergency Plumbing",
      "24/7 Call Support",
    ],
  },
  {
    name: "Silver Shield",
    description: "Most popular for Villas.",
    price: "AED 499",
    period: "/month",
    featured: true,
    badge: "Best Value",
    features: [
      "3 AC Services/Year",
      "Electrical & Plumbing",
      "Unlimited Callouts",
      "Priority Booking",
    ],
  },
  {
    name: "Gold Elite",
    description: "Comprehensive premium care.",
    price: "AED 899",
    period: "/month",
    featured: false,
    features: [
      "4 AC Services/Year",
      "Full MEP Coverage",
      "Consumables Included",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-500 font-bold text-sm uppercase tracking-wider"
          >
            Annual Contracts
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-slate-900 mt-2"
          >
            Choose Your Maintenance Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-500"
          >
            Flexible packages designed for your peace of mind.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-2xl p-8 relative ${
                plan.featured
                  ? 'border-2 border-emerald-500 shadow-xl md:-translate-y-4'
                  : 'border border-slate-200 hover:border-emerald-500/30'
              } transition-colors`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider shadow-sm">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              <ul className="flex flex-col gap-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-start text-sm ${plan.featured ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('Subscriptions')}>
                <Button
                  className={`w-full py-3 rounded-xl font-bold ${
                    plan.featured
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                      : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  {plan.featured ? `Select ${plan.name.split(' ')[0]}` : 'Choose Plan'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
