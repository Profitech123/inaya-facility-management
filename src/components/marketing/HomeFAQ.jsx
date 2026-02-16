import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: "What areas do you service in the UAE?",
    a: "We cover all major communities in Dubai including Marina, JBR, Downtown, Palm Jumeirah, Arabian Ranches, JVC, and more. We also service select areas in Abu Dhabi. Contact us for availability in your area."
  },
  {
    q: "How quickly can a technician arrive?",
    a: "For on-demand bookings, our technicians can typically arrive within 2-4 hours for same-day requests. Emergency services are available 24/7 with a target response time of under 60 minutes."
  },
  {
    q: "Do you offer emergency services?",
    a: "Yes! Our 24/7 Customer Service Centre handles emergency requests around the clock. Call 6005-INAYA (6005-46292) for immediate assistance with plumbing leaks, electrical failures, AC breakdowns, and more."
  },
  {
    q: "Can I build a custom maintenance package?",
    a: "Absolutely. Our Custom Package Builder lets you mix and match services, choose frequencies, and get instant pricing. You can also request a personalized quote from our team for bespoke solutions."
  },
];

export default function HomeFAQ() {
  return (
    <section className="py-28 bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2 mb-5 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Common Questions</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="bg-white border border-slate-100 rounded-2xl px-7 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="text-left font-bold text-slate-900 hover:no-underline py-5 text-[15px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="text-center mt-10">
          <Link to={createPageUrl('FAQ')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5 transition-colors">
            View all FAQs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}