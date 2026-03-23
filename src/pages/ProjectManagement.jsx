import React from 'react';
import { DollarSign, ClipboardList, Building, Users, Hammer, Paintbrush, Layers, RefreshCw } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Building, title: "Building Refurbishment", desc: "Full refurbishment of residential and commercial units to modern standards and client specifications.", color: "bg-purple-100 text-purple-600" },
  { icon: Layers, title: "Fit-Out Works", desc: "Office and retail interior fit-out projects delivered on time and within budget.", color: "bg-blue-100 text-blue-600" },
  { icon: RefreshCw, title: "Renovation Projects", desc: "Complex building reconfiguration, retrofit and renovation covering civil and MEP aspects.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Hammer, title: "Turnkey Solutions", desc: "End-to-end project delivery from design and planning through to handover.", color: "bg-orange-100 text-orange-600" },
  { icon: DollarSign, title: "Accurate Estimation", desc: "Precise cost estimation and transparent budgeting for every project scope.", color: "bg-amber-100 text-amber-600" },
  { icon: ClipboardList, title: "Cost Control", desc: "Rigorous budget management and progress reporting throughout the project lifecycle.", color: "bg-sky-100 text-sky-600" },
  { icon: Users, title: "Experienced Team", desc: "Specialists with vast experience across the UAE refurbishment and fit-out industry.", color: "bg-slate-100 text-slate-600" },
  { icon: Paintbrush, title: "Decorative & Painting", desc: "Internal and external painting, façade works, and decorative finishes to the highest quality.", color: "bg-rose-100 text-rose-600" },
];

const highlights = [
  "One-stop shop for all building services and project delivery",
  "Proven experience with UAE's top developers — Nakheel, Wasl, Emaar and more",
  "Projects ranging from single-unit refurbishments to complex multi-building programs",
  "Full civil and MEP coverage within every project scope",
  "Pre-execution planning to minimise disruption and delays",
  "Transparent cost control and real-time progress reporting",
  "EOL refurbishments for 4,000+ residential units delivered",
  "Strict quality assurance at every stage of delivery",
];

const description = [
  "INAYA has diversified into building refurbishment and project management as a natural progression — offering clients a true one-stop shop for all building services. From simple residential refurbishments to complex commercial reconfiguration, we deliver turnkey solutions tailored to your needs.",
  "We cover all building aspects including civil, MEP and decorative works, underpinned by accurate estimation, effective cost control and thorough pre-execution planning.",
];

const keyProjects = [
  "APCO Worldwide – Office Interior fit out, Media City",
  "Asma Majid Tower Abu Dhabi – Refurbishment works",
  "Dragon Mart 2 – Supply and installation of Hoarding works",
  "Golden Mile 1 & 2, Palm Jumeirah – Retail area re-design & reconfiguration",
  "Ibn Battuta Mall – Reconfiguration and renovation of washrooms",
  "Al Khail Gate community – Kitchen cabinet installations across 3,000+ units",
  "Crescent Wall Palm Jumeirah – Refurbishment & painting of 10km crescent wall",
  "Discovery Gardens – Exterior & façade painting of 63 OA managed buildings",
  "Discovery Gardens – Aluminium window shutters for 49 OA managed buildings",
  "EOL refurbishments of more than 4,000 residential units for Nakheel, Wasl and others",
];

const KeyProjectsSection = () => (
  <div className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-10">
    <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-8">Key Projects</h2>
    <div className="grid md:grid-cols-2 gap-3">
      {keyProjects.map((project, idx) => (
        <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
          <span className="text-slate-700 text-sm leading-relaxed">{project}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function ProjectManagement() {
  return (
    <ServicePageTemplate
      category="Facilities Management"
      title="Project Management"
      subtitle="From simple unit refurbishments to large-scale building reconfiguration — turnkey solutions delivered on time, within budget, and to the highest standard."
      heroImage="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="Why Trust INAYA for Your Project?"
      ctaLink="Contact"
      ctaLabel="Discuss Your Project"
      extraSection={<KeyProjectsSection />}
    />
  );
}