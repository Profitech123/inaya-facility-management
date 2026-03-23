import React from 'react';
import { Building2, BarChart3, Users, Clock, ShieldCheck, Layers, Headphones, Globe } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Building2, title: "Single-Source Delivery", desc: "All FM services — hard, soft and specialist — delivered under one contract and one management team.", color: "bg-emerald-100 text-emerald-600" },
  { icon: BarChart3, title: "Performance Management", desc: "Real-time KPI dashboards, SLA reporting and continuous improvement programmes.", color: "bg-blue-100 text-blue-600" },
  { icon: Users, title: "Dedicated Account Teams", desc: "Named account managers and on-site supervisors providing consistent, personalised service.", color: "bg-purple-100 text-purple-600" },
  { icon: Clock, title: "24/7 Helpdesk", desc: "Round-the-clock reactive support and emergency response across all service lines.", color: "bg-orange-100 text-orange-600" },
  { icon: ShieldCheck, title: "Compliance & Risk", desc: "Full regulatory compliance management including health, safety, fire and statutory inspections.", color: "bg-red-100 text-red-600" },
  { icon: Layers, title: "Asset Lifecycle Management", desc: "Strategic asset planning, PPM scheduling and lifecycle cost modelling.", color: "bg-amber-100 text-amber-600" },
  { icon: Headphones, title: "Helpdesk & CAFM", desc: "Technology-driven work order management via CAFM platforms for full transparency.", color: "bg-sky-100 text-sky-600" },
  { icon: Globe, title: "Portfolio-Wide Coverage", desc: "Scalable solutions covering individual buildings to entire community portfolios.", color: "bg-slate-100 text-slate-600" },
];

const highlights = [
  "Single point of accountability for all FM services",
  "Significant cost savings through integrated delivery",
  "Consistent service quality across entire portfolios",
  "Technology-driven CAFM and reporting transparency",
  "24/7 emergency response and helpdesk support",
  "ISO 9001, 14001 and 45001 certified operations",
  "Proven experience with UAE's largest developers",
  "Flexible contract structures to suit every client",
];

const description = [
  "INAYA's Integrated Facilities Management model brings together all hard and soft services under a single, unified delivery structure — reducing complexity, improving accountability, and delivering measurable cost savings.",
  "From asset lifecycle management and planned preventive maintenance to daily cleaning and security, we coordinate every aspect of your property's operation so you don't have to.",
];

export default function IntegratedFM() {
  return (
    <ServicePageTemplate
      category="Facilities Management"
      title="Integrated FM"
      subtitle="One contract. One team. Complete accountability — delivering seamless hard and soft services across your entire property portfolio."
      heroImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="The INAYA Integrated FM Advantage"
      ctaLink="Contact"
      ctaLabel="Discuss Your Requirements"
    />
  );
}