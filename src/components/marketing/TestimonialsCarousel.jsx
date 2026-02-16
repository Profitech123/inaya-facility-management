import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Al-Mansouri",
    role: "Villa Owner, Arabian Ranches",
    rating: 5,
    text: "INAYA transformed how we manage our villa. Their subscription plan covers everything — AC, pool, landscaping — and the team is always punctual and professional.",
  },
  {
    name: "James Peterson",
    role: "Apartment Owner, Dubai Marina",
    rating: 5,
    text: "I was tired of calling different handymen. INAYA's one-stop service is a game changer. The app makes booking so easy, and the quality is consistently excellent.",
  },
  {
    name: "Fatima Al-Rashidi",
    role: "Property Manager, JBR",
    rating: 5,
    text: "Managing multiple units is effortless now. The real-time tracking and detailed reports keep my clients happy. Best FM partner we've worked with.",
  },
  {
    name: "Raj Patel",
    role: "Townhouse Owner, JVC",
    rating: 4,
    text: "Their Gold package is worth every dirham. Emergency response is lightning fast, and the technicians always go above and beyond expectations.",
  },
  {
    name: "Claudia Bianchi",
    role: "Villa Owner, Palm Jumeirah",
    rating: 5,
    text: "After trying three different companies, INAYA is the only one that delivers consistently. Their attention to detail and proactive maintenance approach is outstanding.",
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir) => setCurrent(prev => (prev + dir + testimonials.length) % testimonials.length);
  const t = testimonials[current];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-emerald-600 text-sm font-bold tracking-[0.15em] uppercase">Testimonials</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">What Our Customers Say</h2>
        </motion.div>

        <div className="relative">
          <div className="bg-white rounded-3xl p-10 lg:p-14 border border-slate-200 shadow-sm min-h-[260px] flex flex-col items-center justify-center text-center">
            <Quote className="w-10 h-10 text-emerald-200 mb-6" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex justify-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-lg lg:text-xl text-slate-700 leading-relaxed mb-6 max-w-2xl mx-auto italic">
                  "{t.text}"
                </p>
                <p className="font-bold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-400">{t.role}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <button onClick={() => go(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-10 h-10 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={() => go(1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-10 h-10 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? 'bg-emerald-500 w-7' : 'bg-slate-300'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}