import React from 'react';
import { Wrench, Sparkles, Link2, Headphones, BarChart2, Shield, Settings, Phone } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Wrench, title: "Hard Services", desc: "MEP maintenance, HVAC, electrical, plumbing, civil and painting works.", color: "bg-orange-100 text-orange-600" },
  { icon: Sparkles, title: "Soft Services", desc: "Large-scale cleaning, security, waste management, landscaping and pest control.", color: "bg-blue-100 text-blue-600" },
  { icon: Link2, title: "Project Management", desc: "Building refurbishment, fit-out, renovation and turnkey solutions.", color: "bg-purple-100 text-purple-600" },
  { icon: Headphones, title: "24/7 Contact Centre", desc: "A dedicated communications touchpoint 365 days a year for exemplary service.", color: "bg-green-100 text-green-600" },
  { icon: BarChart2, title: "Performance Monitoring", desc: "Integrated systems to continuously track and evaluate service delivery KPIs.", color: "bg-amber-100 text-amber-600" },
  { icon: Shield, title: "Compliance & Safety", desc: "Full compliance with local codes and international health & safety standards.", color: "bg-red-100 text-red-600" },
  { icon: Settings, title: "Asset Management", desc: "Lifecycle management of building assets to maximise performance and value.", color: "bg-teal-100 text-teal-600" },
  { icon: Phone, title: "Emergency Response", desc: "Rapid response teams available around the clock for any critical incident.", color: "bg-rose-100 text-rose-600" },
];

const highlights = [
  "Single-source provider for all FM services",
  "Solid buying power through strategic supplier partnerships",
  "24/7 / 365 customer service contact centre",
  "Performance monitoring via integrated management systems",
  "Experienced management team with regional & international expertise",
  "Proven track record with UAE's top developers and communities",
  "Strict supplier evaluation and compliance frameworks",
  "Scalable solutions for any property size or portfolio",
];

const description = [
  "Our Integrated Facilities Management offering provides the most comprehensive range of both 'hard' maintenance and 'soft' cleaning/specialised services. We understand how buildings are designed and the systems that make them work smoothly.",
  "Through building strong working relationships we maintain solid buying power and secure reliable, high-quality services within a cost-competitive framework — giving our clients real long-term value.",
];

export default function IntegratedFM() {
  return (
    <ServicePageTemplate
      category="Comprehensive Solutions"
      title="Integrated Facilities Management"
      subtitle="Dubai's most complete FM service — hard maintenance, soft services, and specialist solutions under one roof, backed by ISO-certified standards."
      heroImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="Why Choose INAYA Integrated FM?"
      ctaLink="OnDemandServices"
      ctaLabel="Book a Service"
    />
  );
}