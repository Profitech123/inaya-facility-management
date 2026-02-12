import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const faqs = [
  {
    category: "General",
    items: [
      { q: "What is INAYA Facilities Management?", a: "INAYA is a leading facilities management company based in Dubai, part of the Belhasa Group. We provide comprehensive hard and soft services including AC maintenance, plumbing, electrical, cleaning, pest control, landscaping, and more for residential and commercial properties." },
      { q: "What areas in the UAE do you serve?", a: "We primarily serve Dubai and Abu Dhabi, with coverage across major communities including Dubai Marina, JBR, Downtown Dubai, Palm Jumeirah, Arabian Ranches, JVC, and many more. Contact us to confirm service availability in your area." },
      { q: "Are your technicians certified and vetted?", a: "Yes. All our technicians are fully certified, background-checked, and undergo rigorous training. We follow international best practices and maintain the highest safety standards." },
      { q: "Do you offer emergency services?", a: "Yes, we operate a 24/7 customer service contact centre. For emergencies, call our toll-free number 6005-INAYA (6005-46292) for immediate assistance." },
    ]
  },
  {
    category: "On-Demand Services",
    items: [
      { q: "How do I book an on-demand service?", a: "Simply browse our Services page, select the service you need, choose your property and preferred time slot, and confirm your booking. You'll receive a confirmation email with all the details." },
      { q: "How soon can a technician arrive?", a: "We offer same-day availability for most services. Depending on demand and your location, a technician can typically be at your property within a few hours of booking." },
      { q: "Can I reschedule or cancel a booking?", a: "Yes, you can reschedule or cancel a booking through your dashboard. We ask for at least 4 hours notice for cancellations to avoid any charges." },
      { q: "What payment methods do you accept?", a: "We accept credit/debit cards (Visa, Mastercard) and bank transfers. Cash payment is also available upon request." },
    ]
  },
  {
    category: "Subscription Packages",
    items: [
      { q: "What subscription packages do you offer?", a: "We offer Essential, Silver, and Gold packages tailored to different property sizes and needs. Each package includes scheduled visits for various services at discounted rates compared to on-demand pricing." },
      { q: "Can I customise my subscription package?", a: "Yes! Our custom package option lets you choose specific services, frequencies, and schedules that match your property's unique needs. Contact us for a tailored quote." },
      { q: "How do I cancel or pause my subscription?", a: "You can manage your subscription from your dashboard. Cancellations require 30 days notice as per our terms. You can also pause your subscription temporarily if needed." },
      { q: "Is there a minimum contract duration?", a: "Our packages typically come in 3, 6, or 12-month durations. Longer commitments offer greater discounts. Check each package's details for specific terms." },
    ]
  },
  {
    category: "Account & Support",
    items: [
      { q: "How do I create an account?", a: "Click 'Create Account' in the top navigation, enter your details, and verify your email. Once registered, you can add your properties and start booking services." },
      { q: "How can I track my service requests?", a: "After logging in, go to your Dashboard to see all upcoming and past bookings, their status, and assigned technician details." },
      { q: "How do I add or manage my properties?", a: "Go to 'My Properties' in your dashboard to add new properties or update existing ones. Each property can have its own subscription and booking history." },
      { q: "Who do I contact for billing issues?", a: "For billing inquiries, create a support ticket under the 'Billing' category from your Support page, or call our customer service at +971 4 815 7300." },
    ]
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Find answers to common questions about our services, subscriptions, and how INAYA can help maintain your property.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.category}</h2>
            <Accordion type="single" collapsible className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {section.items.map((item, idx) => (
                <AccordionItem key={idx} value={`${section.category}-${idx}`} className="border-b last:border-0">
                  <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left font-medium text-slate-900">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-slate-600 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Still have questions? */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Still have questions?</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Our support team is here to help. Reach out via chat, phone, or create a support ticket.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <MessageSquare className="w-4 h-4" /> Contact Us
              </Button>
            </Link>
            <a href="tel:600546292">
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" /> 6005-INAYA (46292)
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}