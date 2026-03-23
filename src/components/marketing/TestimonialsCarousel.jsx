import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Al-Mansouri",
    role: "Villa Owner",
    location: "Arabian Ranches",
    rating: 5,
    text: "INAYA transformed how we manage our villa. Their subscription plan covers everything — AC, pool, landscaping — and the team is always punctual and professional.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "James Peterson",
    role: "Apartment Owner",
    location: "Dubai Marina",
    rating: 5,
    text: "I was tired of calling different handymen. INAYA's one-stop service is a game changer. The app makes booking so easy, and the quality is consistently excellent.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Fatima Al-Rashidi",
    role: "Property Manager",
    location: "JBR",
    rating: 5,
    text: "Managing multiple units is effortless now. The real-time tracking and detailed reports keep my clients happy. Best FM partner we've worked with.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Raj Patel",
    role: "Townhouse Owner",
    location: "JVC",
    rating: 5,
    text: "Their Gold package is worth every dirham. Emergency response is lightning fast, and the technicians always go above and beyond expectations.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Claudia Bianchi",
    role: "Villa Owner",
    location: "Palm Jumeirah",
    rating: 5,
    text: "After trying three different companies, INAYA is the only one that delivers consistently. Exceptional attention to detail and a truly proactive approach.",
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
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Rich dark background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-emerald-600/8 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/6 rounded-full blur-[180px] translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-white/60 font-semibold text-[11px] tracking-[0.2em] uppercase">Client Stories</span>
          </div>
          <h2 className="font-display text-[2.75rem] lg:text-[3.5rem] font-bold text-white tracking-tight">
            What Our Customers Say
          </h2>
        </motion.div>

        {/* Testimonial card */}
        <div className="relative">
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-[2rem] p-10 lg:p-16 overflow-hidden">
            {/* Giant decorative quote */}
            <div className="absolute top-8 left-10 text-[10rem] leading-none font-display text-white/[0.04] select-none pointer-events-none">"</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                  ))}
                </div>

                <p className="font-display text-xl lg:text-2xl text-white/90 leading-relaxed mb-10 max-w-3xl mx-auto font-normal italic">
                  "{t.text}"
                </p>

                <div className="flex items-center justify-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg" />
                  <div className="text-left">
                    <p className="font-bold text-white text-[15px]">{t.name}</p>
                    <p className="text-sm text-white/40">{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 lg:-translate-x-7 w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 lg:translate-x-7 w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-400 ${idx === current ? 'bg-emerald-400 w-8' : 'bg-white/20 w-1.5 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}