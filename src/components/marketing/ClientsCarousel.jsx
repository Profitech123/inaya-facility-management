import React from 'react';
import { motion } from 'framer-motion';

const clients = [
  "https://www.inaya.ae/wp-content/uploads/2018/02/client24.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client23.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client22.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client26-1.jpg",
  "https://www.inaya.ae/wp-content/uploads/2019/06/badr.jpg",
  "https://www.inaya.ae/wp-content/uploads/2019/06/reel.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client1.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client2.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client3.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client4.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client5.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client25-1.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client8.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client16.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client15.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client14.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client12.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client11.jpg",
];

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144' height='96' fill='%23f8fafc'%3E%3Crect width='144' height='96'/%3E%3C/svg%3E";

export default function ClientsCarousel() {
  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-emerald-600 font-semibold text-xs uppercase tracking-widest mb-3">
            Trusted By Industry Leaders
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Our Clients</h2>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex animate-scroll-left gap-5 px-6">
          {[...clients, ...clients].map((src, idx) => (
            <div key={idx} className="flex-shrink-0 w-32 h-20 bg-white rounded-xl flex items-center justify-center p-3 border border-slate-100">
              <img
                src={src}
                alt="Client"
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-400"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </div>
          ))}
        </div>
        <div className="flex animate-scroll-right gap-5 px-6">
          {[...clients.slice().reverse(), ...clients.slice().reverse()].map((src, idx) => (
            <div key={idx} className="flex-shrink-0 w-32 h-20 bg-white rounded-xl flex items-center justify-center p-3 border border-slate-100">
              <img
                src={src}
                alt="Client"
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-400"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </div>
          ))}
        </div>
      </div>

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
    </section>
  );
}
