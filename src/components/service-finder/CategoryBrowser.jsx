import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Wrench, Zap, Droplets, Bug, TreePine, 
  Shield, Wind, Paintbrush, Flame, Waves 
} from 'lucide-react';

const CATEGORIES = [
  { label: "AC & HVAC", icon: Wind, query: "AC maintenance and HVAC servicing", color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" },
  { label: "Cleaning", icon: Sparkles, query: "Deep cleaning and regular cleaning", color: "bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100" },
  { label: "Plumbing", icon: Droplets, query: "Plumbing repair and water systems", color: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100" },
  { label: "Electrical", icon: Zap, query: "Electrical repair and wiring", color: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" },
  { label: "Pest Control", icon: Bug, query: "Pest control and fumigation", color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
  { label: "Landscaping", icon: TreePine, query: "Landscaping garden and irrigation", color: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" },
  { label: "Pool Care", icon: Waves, query: "Pool maintenance and cleaning", color: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100" },
  { label: "Painting", icon: Paintbrush, query: "Painting and wall repair", color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" },
  { label: "Fire Systems", icon: Flame, query: "Fire safety and firefighting systems", color: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" },
  { label: "Security", icon: Shield, query: "Security services and CCTV", color: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200" },
  { label: "Handyman", icon: Wrench, query: "General handyman repair and maintenance", color: "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100" },
];

export default function CategoryBrowser({ onSelect }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Or browse by category</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelect(cat.query)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${cat.color}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold text-center leading-tight">{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}