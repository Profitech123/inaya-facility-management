import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const plans = [
  {
    name: "Essential Care",
    description: "Ideal for apartments and studios.",
    price: "299",
    period: "/month",
    featured: false,
    features: [
      "2 AC Services per Year",
      "Emergency Plumbing Response",
      "24/7 Phone Support",
      "Annual Property Inspection",
    ],
  },
  {
    name: "Silver Shield",
    description: "Our most popular plan for villas.",
    price: "499",
    period: "/month",
    featured: true,
    badge: "Most Popular",
    features: [
      "3 AC Services per Year",
      "Full Electrical & Plumbing",
      "Unlimited Service Callouts",
      "Priority Same-Day Booking",
      "Dedicated Account Manager",
    ],
  },
  {
    name: "Gold Elite",
    description: "Comprehensive premium care.",
    price: "899",
    period: "/month",
    featured: false,
    features: [
      "4 AC Services per Year",
      "Complete MEP Coverage",
      "All Consumables Included",
      "Pool & Landscape Service",
      "Quarterly Deep Cleaning",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
              Annual Contracts
            </span>
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold"
            style={{ color: 'hsl(210,20%,10%)', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Transparent pricing,{' '}
            <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>no surprises.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: 'hsl(210,10%,46%)' }}
          >
            Flexible packages designed around your property's unique needs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-3xl p-8 lg:p-10 relative transition-all duration-300 ${
                plan.featured
                  ? 'bg-[hsl(210,20%,6%)] text-white md:-translate-y-4 shadow-2xl'
                  : 'bg-white border hover:shadow-xl'
              }`}
              style={!plan.featured ? { borderColor: 'hsl(40,10%,90%)' } : {}}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-8 text-xs font-semibold py-1.5 px-4 rounded-full tracking-wide" style={{ backgroundColor: 'hsl(160,60%,38%)', color: 'white' }}>
                  {plan.badge}
                </div>
              )}
              <h3 className={`text-xl font-bold ${plan.featured ? 'text-white' : ''}`} style={!plan.featured ? { color: 'hsl(210,20%,10%)' } : {}}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-2 ${plan.featured ? 'text-white/60' : ''}`} style={!plan.featured ? { color: 'hsl(210,10%,46%)' } : {}}>
                {plan.description}
              </p>
              <div className="mt-8 mb-8">
                <span className={`text-sm ${plan.featured ? 'text-white/40' : ''}`} style={!plan.featured ? { color: 'hsl(210,10%,46%)' } : {}}>AED</span>
                <span className={`text-5xl font-bold ml-1 ${plan.featured ? 'text-white' : ''}`} style={!plan.featured ? { color: 'hsl(210,20%,10%)' } : {}}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.featured ? 'text-white/40' : ''}`} style={!plan.featured ? { color: 'hsl(210,10%,46%)' } : {}}>
                  {plan.period}
                </span>
              </div>
              <ul className="flex flex-col gap-4 mb-10">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-start text-sm ${plan.featured ? 'text-white/80' : ''}`} style={!plan.featured ? { color: 'hsl(210,20%,30%)' } : {}}>
                    <Check className={`w-4 h-4 mt-0.5 mr-3 flex-shrink-0 ${plan.featured ? 'text-[hsl(160,60%,45%)]' : ''}`} style={!plan.featured ? { color: 'hsl(160,60%,38%)' } : {}} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl('Subscriptions')}>
                <Button
                  className={`w-full py-6 h-auto rounded-full font-semibold text-sm tracking-wide transition-all duration-300 ${
                    plan.featured
                      ? 'bg-white text-[hsl(210,20%,6%)] hover:bg-white/90'
                      : 'bg-[hsl(210,20%,6%)] text-white hover:bg-[hsl(210,20%,12%)]'
                  }`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
