import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Al-Mansouri",
    role: "Villa Owner, Arabian Ranches",
    rating: 5,
    text: "INAYA transformed how we manage our villa. Their subscription plan covers everything — AC, pool, landscaping — and the team is always punctual and professional.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "James Peterson",
    role: "Apartment Owner, Dubai Marina",
    rating: 5,
    text: "I was tired of calling different handymen. INAYA's one-stop service is a game changer. The app makes booking so easy, and the quality is consistently excellent.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Fatima Al-Rashidi",
    role: "Property Manager, JBR",
    rating: 5,
    text: "Managing multiple units is effortless now. The real-time tracking and detailed reports keep my clients happy. Best FM partner we've worked with.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Raj Patel",
    role: "Townhouse Owner, JVC",
    rating: 5,
    text: "Their Gold package is worth every dirham. Emergency response is lightning fast, and the technicians always go above and beyond expectations.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Claudia Bianchi",
    role: "Villa Owner, Palm Jumeirah",
    rating: 5,
    text: "After trying three different companies, INAYA is the only one that delivers consistently. Their attention to detail and proactive maintenance approach is outstanding.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
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
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-emerald-50/40 to-blue-50/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-5 py-2 mb-5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-amber-700 font-semibold text-xs uppercase tracking-widest">Testimonials</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">What Our Customers Say</h2>
        </motion.div>

        <div className="relative">
          <div className="bg-slate-50 rounded-[2rem] p-10 lg:p-14 border border-slate-100 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Large decorative quote */}
            <Quote className="absolute top-6 left-8 w-20 h-20 text-slate-100 -rotate-6" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10"
              >
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-lg lg:text-xl text-slate-700 leading-relaxed mb-8 max-w-2xl mx-auto font-medium">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                  <div className="text-left">
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <button onClick={() => go(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 lg:-translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:shadow-xl transition-all hover:-translate-y-1/2 hover:scale-105">
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button onClick={() => go(1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 lg:translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:shadow-xl transition-all hover:-translate-y-1/2 hover:scale-105">
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 mt-8">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-emerald-500 w-8' : 'bg-slate-300 w-2.5 hover:bg-slate-400'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}