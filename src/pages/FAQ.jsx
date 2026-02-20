import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageSquare, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const faqs = [
  {
    category: "General",
    items: [
      { q: "What is INAYA Facilities Management?", a: "INAYA is a leading facilities management company based in Dubai, part of the Belhasa Group. We provide comprehensive hard and soft services including AC maintenance, plumbing, electrical, cleaning, pest control, landscaping, and more for residential and commercial properties." },
      { q: "What areas in the UAE do you serve?", a: "We primarily serve Dubai and Abu Dhabi, with coverage across major communities including Dubai Marina, JBR, Downtown Dubai, Palm Jumeirah, Arabian Ranches, JVC, and many more." },
      { q: "Are your technicians certified and vetted?", a: "Yes. All our technicians are fully certified, background-checked, and undergo rigorous training. We follow international best practices and maintain the highest safety standards." },
      { q: "Do you offer emergency services?", a: "Yes, we operate a 24/7 customer service contact centre. For emergencies, call our toll-free number 6005-INAYA (6005-46292) for immediate assistance." },
    ]
  },
  {
    category: "On-Demand Services",
    items: [
      { q: "How do I book an on-demand service?", a: "Simply browse our Services page, select the service you need, choose your property and preferred time slot, and confirm your booking. You will receive a confirmation email with all the details." },
      { q: "How soon can a technician arrive?", a: "We offer same-day availability for most services. Depending on demand and your location, a technician can typically be at your property within a few hours of booking." },
      { q: "Can I reschedule or cancel a booking?", a: "Yes, you can reschedule or cancel a booking through your dashboard. We ask for at least 4 hours notice for cancellations to avoid any charges." },
      { q: "What payment methods do you accept?", a: "We accept credit/debit cards (Visa, Mastercard) and bank transfers. Cash payment is also available upon request." },
    ]
  },
  {
    category: "Subscription Packages",
    items: [
      { q: "What subscription packages do you offer?", a: "We offer Essential, Silver, and Gold packages tailored to different property sizes and needs. Each package includes scheduled visits for various services at discounted rates." },
      { q: "Can I customise my subscription package?", a: "Yes! Our custom package option lets you choose specific services, frequencies, and schedules that match your property's unique needs." },
      { q: "How do I cancel or pause my subscription?", a: "You can manage your subscription from your dashboard. Cancellations require 30 days notice as per our terms. You can also pause temporarily." },
      { q: "Is there a minimum contract duration?", a: "Our packages typically come in 3, 6, or 12-month durations. Longer commitments offer greater discounts." },
    ]
  },
  {
    category: "Account & Support",
    items: [
      { q: "How do I create an account?", a: "Click 'Create Account' in the navigation, enter your details, and verify your email. Once registered, you can add properties and start booking." },
      { q: "How can I track my service requests?", a: "After logging in, go to your Dashboard to see all upcoming and past bookings, their status, and assigned technician details." },
      { q: "How do I add or manage my properties?", a: "Go to 'My Properties' in your dashboard to add new properties or update existing ones. Each property can have its own subscription." },
      { q: "Who do I contact for billing issues?", a: "Create a support ticket under the 'Billing' category, or call our customer service at +971 4 815 7300." },
    ]
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Hero */}
      <div className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[hsl(160,60%,45%)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6">Frequently asked questions</h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">Find answers to common questions about our services, subscriptions, and how INAYA can help.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 space-y-12">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xl font-serif font-bold text-[hsl(210,20%,10%)] mb-5">{section.category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {section.items.map((item, idx) => (
                <AccordionItem key={idx} value={`${section.category}-${idx}`} className="bg-white rounded-xl border border-[hsl(40,10%,90%)] overflow-hidden data-[state=open]:border-[hsl(160,60%,38%)]/20 transition-colors">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-[hsl(40,15%,97%)] text-left font-medium text-sm text-[hsl(210,20%,10%)]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-sm text-[hsl(210,10%,45%)] leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Still have questions? */}
        <div className="rounded-2xl p-8 lg:p-10 text-center" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
          <h2 className="text-2xl font-serif font-bold text-white mb-3">Still have questions?</h2>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">Our support team is here to help. Reach out via chat, phone, or create a support ticket.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl('Contact')}>
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                <MessageSquare className="w-4 h-4" /> Contact Us
              </button>
            </Link>
            <a href="tel:600546292">
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white/70 border border-white/10 hover:border-white/30 transition-all">
                <Phone className="w-4 h-4" /> 6005-INAYA
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
