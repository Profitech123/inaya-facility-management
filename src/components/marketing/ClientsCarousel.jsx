import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Building2 } from 'lucide-react';

const clients = [
  "Emaar",
  "DAMAC",
  "Nakheel",
  "Meraas",
  "Dubai Properties",
  "Meydan",
  "Aldar",
  "Azizi",
  "Select Group",
  "Omniyat",
  "Sobha",
  "Deyaar",
  "Union Properties",
  "Belhasa Group",
  "Wasl",
  "Dubai Holding",
  "MAG Group",
  "Reportage",
];

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144' height='96' fill='%23f1f5f9'%3E%3Crect width='144' height='96'/%3E%3C/svg%3E";

export default function ClientsCarousel() {
  return (
    <div className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-2 mb-5">
            <Handshake className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Our Partners</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Trusted By Industry Leaders</h2>
        </motion.div>
      </div>

      {/* Scrolling rows */}
      <div className="space-y-5">
        <div className="flex animate-scroll-left gap-6 px-6">
          {[...clients, ...clients].map((src, idx) => (
            <div key={idx} className="flex-shrink-0 w-40 h-24 bg-white rounded-2xl flex items-center justify-center p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <img src={src} alt="Client" loading="lazy" decoding="async" className="max-w-full max-h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500" onError={(e) => { e.target.src = PLACEHOLDER; }} />
            </div>
          ))}
        </div>
        <div className="flex animate-scroll-right gap-6 px-6">
          {[...clients.slice().reverse(), ...clients.slice().reverse()].map((src, idx) => (
            <div key={idx} className="flex-shrink-0 w-40 h-24 bg-white rounded-2xl flex items-center justify-center p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <img src={src} alt="Client" loading="lazy" decoding="async" className="max-w-full max-h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500" onError={(e) => { e.target.src = PLACEHOLDER; }} />
            </div>
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scrollLeft 40s linear infinite;
        }
        .animate-scroll-right {
          animation: scrollRight 45s linear infinite;
        }
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}