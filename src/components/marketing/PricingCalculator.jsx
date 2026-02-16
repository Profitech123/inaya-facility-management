import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Check, TrendingDown } from 'lucide-react';
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
    <section className="py-28 bg-white relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2 mb-5">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold text-xs uppercase tracking-widest">Pricing Calculator</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">See How Much You Save</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 rounded-3xl border border-slate-100 p-8 lg:p-10"
        >
          {/* Property type */}
          <div className="mb-8">
            <label className="text-sm font-bold text-slate-700 mb-3 block uppercase tracking-wider">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => setPropertyIdx(idx)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    idx === propertyIdx
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <label className="text-sm font-bold text-slate-700 mb-3 block uppercase tracking-wider">Select Services</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICES.map(svc => {
                const isSelected = selected.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggle(svc.id)}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 text-left ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {isSelected
                      ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>
                      : <span className="text-base flex-shrink-0">{svc.emoji}</span>}
                    {svc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          {selected.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.15em] font-bold mb-2">On-Demand / Year</p>
                <p className="text-2xl font-extrabold text-slate-300 line-through">AED {annualOnDemand.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-center text-white shadow-xl shadow-slate-900/20">
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.15em] font-bold mb-2">Subscription / Year</p>
                <p className="text-2xl font-extrabold">AED {annualSubscription.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
                <p className="text-[11px] text-emerald-600 uppercase tracking-[0.15em] font-bold mb-2 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" />You Save</p>
                <p className="text-2xl font-extrabold text-emerald-600">AED {savings.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to={createPageUrl('Subscriptions')}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-10 gap-2 rounded-xl font-semibold shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5">
                View Subscription Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}