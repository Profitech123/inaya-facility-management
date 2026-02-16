import React from 'react';
import { ArrowLeft, Puzzle, Shield, Clock, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const HIGHLIGHTS = [
  { icon: Shield, label: "Certified Technicians" },
  { icon: Clock, label: "Flexible Scheduling" },
  { icon: Percent, label: "Up to 15% Savings" },
];

export default function PackageBuilderHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-14 md:py-16">
        <Link to={createPageUrl('Subscriptions')} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-400/20">
            <Puzzle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Custom Package Builder</h1>
            <p className="text-emerald-300/80 text-sm mt-0.5">Build your perfect maintenance plan</p>
          </div>
        </div>
        <p className="text-slate-300 max-w-lg mt-2 text-sm leading-relaxed">
          Mix and match services, choose your frequency, and get instant pricing. Save your custom package or request a tailored quote from our team.
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Icon className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}