import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const topFaqs = [
  {
    q: "What areas in the UAE do you serve?",
    a: "We primarily serve Dubai and Abu Dhabi, with coverage across major communities including Dubai Marina, JBR, Downtown Dubai, Palm Jumeirah, Arabian Ranches, JVC, and many more.",
  },
  {
    q: "How quickly can a technician arrive?",
    a: "We offer same-day availability for most services. Depending on demand and your location, a technician can typically be at your property within a few hours of booking.",
  },
  {
    q: "Do you offer emergency services?",
    a: "Yes, we operate a 24/7 customer service contact centre. For emergencies, call our toll-free number 6005-INAYA (6005-46292) for immediate assistance.",
  },
  {
    q: "Can I customise my subscription package?",
    a: "Yes! Our custom package builder lets you choose specific services, frequencies, and schedules that match your property's unique needs. Visit our Packages page to get started.",
  },
];

export default function HomeFAQ() {
  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
              FAQ
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
            Common{' '}
            <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>questions.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {topFaqs.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-white rounded-2xl border px-6 overflow-hidden data-[state=open]:shadow-sm transition-all"
                style={{ borderColor: 'hsl(40,10%,92%)' }}
              >
                <AccordionTrigger className="py-5 hover:no-underline text-left font-semibold text-base" style={{ color: 'hsl(210,20%,10%)' }}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 leading-relaxed" style={{ color: 'hsl(210,10%,46%)' }}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link to={createPageUrl('FAQ')} className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: 'hsl(160,60%,38%)' }}>
            View all questions <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
