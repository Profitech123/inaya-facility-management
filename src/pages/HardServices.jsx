import React from 'react';
import { Wrench, Wind, Zap, Flame, Droplets, ShieldCheck, Settings, AlertTriangle } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Wind, title: "AC & HVAC Maintenance", desc: "Preventive and corrective maintenance of all air conditioning and ventilation systems.", color: "bg-blue-100 text-blue-600" },
  { icon: Zap, title: "Electrical Services", desc: "Planned preventive and reactive electrical maintenance, testing, and compliance.", color: "bg-yellow-100 text-yellow-600" },
  { icon: Flame, title: "Fire & Life Safety", desc: "Inspection, testing and maintenance of fire alarm, suppression and evacuation systems.", color: "bg-red-100 text-red-600" },
  { icon: Droplets, title: "Plumbing & Drainage", desc: "Routine upkeep, leak detection, drainage clearance and pump maintenance.", color: "bg-cyan-100 text-cyan-600" },
  { icon: Wrench, title: "Mechanical Services", desc: "Maintenance of pumps, motors, BMS and all mechanical building plant.", color: "bg-slate-100 text-slate-600" },
  { icon: Settings, title: "Lifts & Escalators", desc: "Scheduled inspection and maintenance of vertical transportation equipment.", color: "bg-purple-100 text-purple-600" },
  { icon: ShieldCheck, title: "Planned Preventive Maintenance", desc: "Structured PPM programmes designed to maximise asset life and minimise downtime.", color: "bg-emerald-100 text-emerald-600" },
  { icon: AlertTriangle, title: "Reactive Maintenance", desc: "24/7 rapid-response breakdown and corrective maintenance across all disciplines.", color: "bg-orange-100 text-orange-600" },
];

const highlights = [
  "Fully qualified engineers across MEP disciplines",
  "24/7 emergency reactive response available",
  "Structured PPM programmes extending asset lifespan",
  "CAFM-driven work order management and reporting",
  "Regulatory compliance and asset register management",
  "Performance SLA tracking and KPI reporting",
  "Serving residential, commercial and mixed-use portfolios",
  "Fully integrated with soft services for seamless delivery",
];

const description = [
  "INAYA's Hard Services division delivers comprehensive mechanical, electrical and plumbing maintenance across the UAE. Our certified engineers manage everything from routine preventive programmes to complex reactive callouts.",
  "We ensure your building's critical infrastructure operates reliably, safely and in full regulatory compliance — maximising asset life and reducing unplanned downtime.",
];

export default function HardServices() {
  return (
    <ServicePageTemplate
      category="Hard Services"
      title="Hard Services"
      subtitle="Expert MEP maintenance — keeping your building's critical infrastructure running safely, efficiently, and in full compliance."
      heroImage="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="Why Choose INAYA for Hard Services?"
      ctaLink="OnDemandServices"
      ctaLabel="Book a Service"
    />
  );
}