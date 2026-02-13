import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
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
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-500 font-bold text-sm uppercase tracking-wider"
          >
            Common Questions
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-slate-900 mt-2"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            {topFaqs.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-slate-200 last:border-0">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-100 text-left font-semibold text-slate-900 text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-slate-600 leading-relaxed">
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
          className="text-center mt-8"
        >
          <Link to={createPageUrl('FAQ')}>
            <Button variant="link" className="text-emerald-600 font-semibold gap-2">
              View All FAQs <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
