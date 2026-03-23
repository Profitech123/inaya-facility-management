import React from 'react';
import { Sparkles, Leaf, Shield, Bug, Trash2, Wind, Clipboard, Star } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Sparkles, title: "Cleaning Services", desc: "Daily janitorial, deep cleaning and specialised cleaning for all property types.", color: "bg-blue-100 text-blue-600" },
  { icon: Leaf, title: "Landscaping & Horticulture", desc: "Garden design, maintenance, irrigation management and seasonal planting.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Shield, title: "Security Services", desc: "Trained security officers and CCTV monitoring for residential and commercial assets.", color: "bg-slate-100 text-slate-600" },
  { icon: Bug, title: "Pest Control", desc: "Preventive and reactive pest management using safe, approved treatment methods.", color: "bg-amber-100 text-amber-600" },
  { icon: Trash2, title: "Waste Management", desc: "Compliant waste collection, segregation, recycling and disposal services.", color: "bg-orange-100 text-orange-600" },
  { icon: Wind, title: "Duct & Chiller Cleaning", desc: "Professional AC duct sanitisation and chiller cleaning for improved air quality.", color: "bg-sky-100 text-sky-600" },
  { icon: Clipboard, title: "Housekeeping Management", desc: "Dedicated housekeeping supervision and quality audit programmes.", color: "bg-purple-100 text-purple-600" },
  { icon: Star, title: "Concierge & Front-of-House", desc: "Premium front-of-house staffing for residential communities and commercial lobbies.", color: "bg-rose-100 text-rose-600" },
];

const highlights = [
  "Professionally trained and uniformed staff",
  "ISO-certified quality and environmental management",
  "Flexible service schedules — daily, weekly or ad hoc",
  "Eco-friendly products and sustainable practices",
  "Digital attendance tracking and quality audits",
  "Integrated delivery alongside hard services",
  "Serving 1,500+ households and commercial clients",
  "Dedicated account management and SLA compliance",
];

const description = [
  "INAYA's Soft Services division provides a complete range of facility support services — from daily cleaning and landscaping to security, pest control and waste management.",
  "Our trained teams operate to rigorous quality standards, ensuring every property we manage is presented, protected and maintained to the highest level every day.",
];

export default function SoftServices() {
  return (
    <ServicePageTemplate
      category="Soft Services"
      title="Soft Services"
      subtitle="Professional facility support services — cleaning, security, landscaping and more — delivered to the highest standards every day."
      heroImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="Why Choose INAYA for Soft Services?"
      ctaLink="OnDemandServices"
      ctaLabel="Book a Service"
    />
  );
}