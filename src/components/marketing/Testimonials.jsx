import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: "Sarah Al-Mansouri",
    role: "Villa Owner, Arabian Ranches",
    rating: 5,
    text: "INAYA transformed our villa maintenance experience. Their Gold package covers everything from AC servicing to pool maintenance. We haven't had a single worry since subscribing.",
  },
  {
    name: "James Peterson",
    role: "Apartment Resident, Dubai Marina",
    rating: 5,
    text: "Booked an emergency plumbing fix through the app at 11pm and a technician arrived within 2 hours. Professional, clean, and fixed the issue on the spot. Incredible service.",
  },
  {
    name: "Fatima Al-Rashidi",
    role: "Property Manager, Downtown Dubai",
    rating: 5,
    text: "Managing 30+ units is effortless with INAYA's subscription plans. Their dashboard lets me track every service request and the technicians are always punctual and thorough.",
  },
  {
    name: "Raj Patel",
    role: "Townhouse Owner, JVC",
    rating: 4,
    text: "Great value with the Silver Shield plan. The AC servicing alone saves us thousands of dirhams per year. The booking system is smooth and the team is responsive.",
  },
  {
    name: "Claudia Bianchi",
    role: "Villa Owner, Palm Jumeirah",
    rating: 5,
    text: "From electrical work to landscaping, INAYA handles everything for our property. Their team is reliable, professional, and always available when we need them.",
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
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-500 font-bold text-sm uppercase tracking-wider"
          >
            What Our Clients Say
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-slate-900 mt-2"
          >
            Trusted by Thousands in Dubai
          </motion.h2>
        </div>

        <div className="relative bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <Quote className="absolute top-6 left-6 w-10 h-10 text-emerald-100" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 max-w-2xl mx-auto">
                {`"${t.text}"`}
              </p>
              <div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {t.name.charAt(0)}
                </div>
                <p className="font-bold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
