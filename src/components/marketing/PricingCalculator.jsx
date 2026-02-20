import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const propertyTypes = [
  { label: "Studio / 1BR", baseMultiplier: 0.7 },
  { label: "2BR Apt", baseMultiplier: 1 },
  { label: "3BR Apt", baseMultiplier: 1.3 },
  { label: "3BR Villa", baseMultiplier: 1.6 },
  { label: "4BR Villa", baseMultiplier: 2 },
  { label: "5+ BR Villa", baseMultiplier: 2.5 },
];

const serviceOptions = [
  { label: "AC Maintenance", monthlyPrice: 80, id: "ac" },
  { label: "Plumbing", monthlyPrice: 60, id: "plumbing" },
  { label: "Electrical", monthlyPrice: 55, id: "electrical" },
  { label: "Pest Control", monthlyPrice: 40, id: "pest" },
  { label: "Cleaning", monthlyPrice: 120, id: "cleaning" },
  { label: "Pool Care", monthlyPrice: 150, id: "pool" },
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
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Calculator className="w-4 h-4" style={{ color: 'hsl(160,60%,38%)' }} />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
              Savings Calculator
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold"
            style={{ color: 'hsl(210,20%,10%)', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Calculate your{' '}
            <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>savings.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border p-8 lg:p-10 shadow-sm"
          style={{ borderColor: 'hsl(40,10%,90%)' }}
        >
          {/* Property Type */}
          <div className="mb-10">
            <label className="block text-sm font-semibold mb-4" style={{ color: 'hsl(210,20%,10%)' }}>
              Property Type
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {propertyTypes.map((pt, i) => (
                <button
                  key={i}
                  onClick={() => setPropertyIndex(i)}
                  className="px-3 py-3 rounded-xl text-xs font-medium transition-all duration-300"
                  style={{
                    backgroundColor: i === propertyIndex ? 'hsl(210,20%,6%)' : 'transparent',
                    color: i === propertyIndex ? 'white' : 'hsl(210,10%,46%)',
                    border: i === propertyIndex ? 'none' : '1px solid hsl(40,10%,90%)',
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-10">
            <label className="block text-sm font-semibold mb-4" style={{ color: 'hsl(210,20%,10%)' }}>
              Select Services
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 text-left"
                  style={{
                    backgroundColor: selectedServices.includes(s.id) ? 'hsl(160,60%,95%)' : 'transparent',
                    color: selectedServices.includes(s.id) ? 'hsl(160,60%,28%)' : 'hsl(210,10%,46%)',
                    border: selectedServices.includes(s.id) ? '2px solid hsl(160,60%,38%)' : '1px solid hsl(40,10%,90%)',
                  }}
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{
                    backgroundColor: selectedServices.includes(s.id) ? 'hsl(160,60%,38%)' : 'hsl(40,10%,90%)',
                    color: 'white',
                  }}>
                    {selectedServices.includes(s.id) && <Check className="w-3 h-3" />}
                  </div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {selectedServices.length > 0 && (
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'hsl(40,20%,98%)', border: '1px solid hsl(40,10%,90%)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'hsl(210,10%,46%)' }}>On-Demand (Annual)</p>
                  <p className="text-2xl font-bold line-through" style={{ color: 'hsl(210,10%,70%)' }}>AED {onDemandCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'hsl(210,10%,46%)' }}>Subscription (Annual)</p>
                  <p className="text-2xl font-bold" style={{ color: 'hsl(160,60%,38%)' }}>AED {subscriptionCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'hsl(210,10%,46%)' }}>You Save</p>
                  <p className="text-2xl font-bold" style={{ color: 'hsl(160,60%,30%)' }}>AED {savings.toLocaleString()}/yr</p>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to={createPageUrl('Subscriptions')}>
                  <Button className="text-white px-10 py-5 h-auto rounded-full font-semibold text-sm tracking-wide transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: 'hsl(160,60%,38%)' }}>
                    View Plans <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {selectedServices.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'hsl(210,10%,60%)' }}>
              Select at least one service to see your estimated savings.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
