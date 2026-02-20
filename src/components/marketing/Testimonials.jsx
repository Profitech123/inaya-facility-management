import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: "Sarah Al-Mansouri",
    role: "Villa Owner, Arabian Ranches",
    rating: 5,
    text: "INAYA transformed our villa maintenance experience. Their Gold package covers everything from AC servicing to pool maintenance. We haven't had a single worry since subscribing.",
    initials: "SA",
  },
  {
    name: "James Peterson",
    role: "Apartment Resident, Dubai Marina",
    rating: 5,
    text: "Booked an emergency plumbing fix through the app at 11pm and a technician arrived within 2 hours. Professional, clean, and fixed the issue on the spot. Incredible service.",
    initials: "JP",
  },
  {
    name: "Fatima Al-Rashidi",
    role: "Property Manager, Downtown Dubai",
    rating: 5,
    text: "Managing 30+ units is effortless with INAYA's subscription plans. Their dashboard lets me track every service request and the technicians are always punctual and thorough.",
    initials: "FA",
  },
  {
    name: "Raj Patel",
    role: "Townhouse Owner, JVC",
    rating: 4,
    text: "Great value with the Silver Shield plan. The AC servicing alone saves us thousands of dirhams per year. The booking system is smooth and the team is responsive.",
    initials: "RP",
  },
  {
    name: "Claudia Bianchi",
    role: "Villa Owner, Palm Jumeirah",
    rating: 5,
    text: "From electrical work to landscaping, INAYA handles everything for our property. Their team is reliable, professional, and always available when we need them.",
    initials: "CB",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
              Testimonials
            </span>
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold"
            style={{ color: 'hsl(210,20%,10%)', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Loved by{' '}
            <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>thousands.</span>
          </motion.h2>
        </div>

        <div className="relative bg-white rounded-3xl p-10 md:p-16 shadow-sm border" style={{ borderColor: 'hsl(40,10%,92%)' }}>
          {/* Large quote mark */}
          <div className="absolute top-8 left-10 text-8xl font-serif leading-none select-none" style={{ color: 'hsl(160,60%,90%)' }}>
            {'"'}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-[hsl(40,10%,90%)]'}`}
                  />
                ))}
              </div>
              <p className="text-xl md:text-2xl leading-relaxed mb-10 max-w-3xl mx-auto" style={{ color: 'hsl(210,20%,20%)', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {t.text}
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: 'hsl(160,60%,38%)' }}>
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm" style={{ color: 'hsl(210,20%,10%)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'hsl(210,10%,46%)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t" style={{ borderColor: 'hsl(40,10%,92%)' }}>
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:shadow-md"
              style={{ borderColor: 'hsl(40,10%,90%)', color: 'hsl(210,20%,10%)' }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i === current ? 'hsl(160,60%,38%)' : 'hsl(40,10%,85%)' }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:shadow-md"
              style={{ borderColor: 'hsl(40,10%,90%)', color: 'hsl(210,20%,10%)' }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
