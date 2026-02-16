import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PROPERTY_TYPES = [
  { label: "Studio", multiplier: 0.6 },
  { label: "1 BR Apt", multiplier: 0.8 },
  { label: "2 BR Apt", multiplier: 1 },
  { label: "3 BR Apt", multiplier: 1.3 },
  { label: "3 BR Villa", multiplier: 1.6 },
  { label: "4 BR Villa", multiplier: 2 },
  { label: "5+ BR Villa", multiplier: 2.5 },
];

const SERVICES = [
  { id: "ac", label: "AC Maintenance", basePrice: 150, emoji: "❄️" },
  { id: "plumbing", label: "Plumbing", basePrice: 120, emoji: "🔧" },
  { id: "electrical", label: "Electrical", basePrice: 130, emoji: "⚡" },
  { id: "pest", label: "Pest Control", basePrice: 100, emoji: "🐜" },
  { id: "cleaning", label: "Cleaning", basePrice: 200, emoji: "✨" },
  { id: "pool", label: "Pool Maintenance", basePrice: 180, emoji: "🏊" },
];

export default function PricingCalculator() {
  const [propertyIdx, setPropertyIdx] = useState(2);
  const [selected, setSelected] = useState(["ac", "cleaning"]);

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const multiplier = PROPERTY_TYPES[propertyIdx].multiplier;
  const annualOnDemand = selected.reduce((sum, id) => {
    const svc = SERVICES.find(s => s.id === id);
    return sum + (svc ? Math.round(svc.basePrice * multiplier * 12) : 0);
  }, 0);
  const annualSubscription = Math.round(annualOnDemand * 0.65);
  const savings = annualOnDemand - annualSubscription;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" /> Pricing Calculator
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">See How Much You Save</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 rounded-3xl border border-slate-200 p-8 lg:p-10"
        >
          {/* Property type */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => setPropertyIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    idx === propertyIdx ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Select Services</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SERVICES.map(svc => {
                const isSelected = selected.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggle(svc.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      isSelected ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <span className="text-base flex-shrink-0">{svc.emoji}</span>}
                    {svc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          {selected.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">On-Demand / Year</p>
                <p className="text-2xl font-bold text-slate-400 line-through">AED {annualOnDemand.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-600 rounded-2xl p-5 text-center text-white shadow-lg">
                <p className="text-xs text-emerald-200 uppercase tracking-wider mb-1">Subscription / Year</p>
                <p className="text-2xl font-bold">AED {annualSubscription.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center">
                <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">You Save</p>
                <p className="text-2xl font-bold text-emerald-600">AED {savings.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to={createPageUrl('Subscriptions')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-8 gap-2">
                View Subscription Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}