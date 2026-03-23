import React from 'react';
import { Sparkles, Shield, Trash2, TreePine, Bug, Waves } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Sparkles, title: "Cleaning Services", desc: "Large-scale residential and commercial cleaning including deep cleaning, regular maintenance and specialist cleaning.", color: "bg-sky-100 text-sky-600" },
  { icon: Shield, title: "Security Services", desc: "Comprehensive security solutions including manned guarding, CCTV monitoring, access control and security audits.", color: "bg-slate-100 text-slate-600" },
  { icon: Trash2, title: "Waste Management", desc: "Complete waste management including collection, segregation, recycling and environmentally responsible disposal.", color: "bg-amber-100 text-amber-600" },
  { icon: TreePine, title: "Landscaping & Irrigation", desc: "Full landscaping maintenance including garden care, tree trimming, irrigation systems and seasonal planting.", color: "bg-green-100 text-green-600" },
  { icon: Bug, title: "Pest Control Management", desc: "Integrated pest management covering inspection, treatment and long-term prevention for all property types.", color: "bg-orange-100 text-orange-600" },
  { icon: Waves, title: "Swimming Pool Maintenance", desc: "Complete pool maintenance including water treatment, cleaning, equipment checks and chemical balancing.", color: "bg-blue-100 text-blue-600" },
];

const highlights = [
  "Trained and certified cleaning professionals",
  "Eco-friendly cleaning products and methods",
  "Customized service schedules to suit your property",
  "Regular quality inspections and performance reports",
  "HACCP-certified food safety standards",
  "International best practice protocols",
  "Comprehensive infection control measures",
  "Dedicated customer service team",
];

const description = [
  "Our Soft Services include large-scale cleaning, security, waste management, landscaping and irrigation, pest control and swimming pool maintenance — all delivered to the highest international standards.",
  "We tailor every service schedule to the unique needs of your property, ensuring a clean, safe, and well-maintained environment for residents and visitors alike.",
];

export default function SoftServices() {
  return (
    <ServicePageTemplate
      category="Facilities Management"
      title="Soft Services"
      subtitle="Professional cleaning, security, landscaping, pest control and pool maintenance — delivered by trained specialists with eco-friendly methods."
      heroImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="Our Soft Services Approach"
      ctaLink="OnDemandServices"
      ctaLabel="Book a Soft Service"
    />
  );
}