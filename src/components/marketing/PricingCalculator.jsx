import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const propertyTypes = [
  { label: "Studio / 1BR Apartment", baseMultiplier: 0.7 },
  { label: "2BR Apartment", baseMultiplier: 1 },
  { label: "3BR Apartment", baseMultiplier: 1.3 },
  { label: "3BR Villa / Townhouse", baseMultiplier: 1.6 },
  { label: "4BR Villa", baseMultiplier: 2 },
  { label: "5+ BR Villa", baseMultiplier: 2.5 },
];

const serviceOptions = [
  { label: "AC Maintenance", monthlyPrice: 80, id: "ac" },
  { label: "Plumbing Coverage", monthlyPrice: 60, id: "plumbing" },
  { label: "Electrical Coverage", monthlyPrice: 55, id: "electrical" },
  { label: "Pest Control", monthlyPrice: 40, id: "pest" },
  { label: "General Cleaning", monthlyPrice: 120, id: "cleaning" },
  { label: "Pool Maintenance", monthlyPrice: 150, id: "pool" },
];

export default function PricingCalculator() {
  const [propertyIndex, setPropertyIndex] = useState(1);
  const [selectedServices, setSelectedServices] = useState(["ac", "plumbing"]);

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const { onDemandCost, subscriptionCost, savings } = useMemo(() => {
    const multiplier = propertyTypes[propertyIndex].baseMultiplier;
    const monthlyOnDemand = serviceOptions
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.monthlyPrice * multiplier * 1.4, 0);
    const monthlySub = serviceOptions
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.monthlyPrice * multiplier, 0);

    return {
      onDemandCost: Math.round(monthlyOnDemand * 12),
      subscriptionCost: Math.round(monthlySub * 12),
      savings: Math.round((monthlyOnDemand - monthlySub) * 12),
    };
  }, [propertyIndex, selectedServices]);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-wider"
          >
            <Calculator className="w-4 h-4" />
            Savings Calculator
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-slate-900 mt-2"
          >
            Calculate Your Annual Savings
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-500"
          >
            See how much you could save by switching to a subscription plan.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
        >
          {/* Property Type */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Property Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {propertyTypes.map((pt, i) => (
                <button
                  key={i}
                  onClick={() => setPropertyIndex(i)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    i === propertyIndex
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Select Services You Need
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    selectedServices.includes(s.id)
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    selectedServices.includes(s.id) ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                  }`}>
                    {selectedServices.includes(s.id) && <Check className="w-3 h-3" />}
                  </div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {selectedServices.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-slate-500 mb-1">On-Demand (Annual)</p>
                  <p className="text-2xl font-bold text-slate-400 line-through">AED {onDemandCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Subscription (Annual)</p>
                  <p className="text-2xl font-bold text-emerald-600">AED {subscriptionCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">You Save</p>
                  <p className="text-2xl font-bold text-emerald-500">AED {savings.toLocaleString()}/yr</p>
                </div>
              </div>
              <div className="text-center mt-6">
                <Link to={createPageUrl('Subscriptions')}>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 h-auto rounded-xl font-bold shadow-lg shadow-emerald-200 gap-2">
                    View Subscription Plans <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {selectedServices.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">
              Select at least one service to see your estimated savings.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
