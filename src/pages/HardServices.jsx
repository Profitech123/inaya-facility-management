import React from 'react';
import { Wind, Zap, Droplets, Wrench, Flame, Gauge, Paintbrush, MoveVertical } from 'lucide-react';
import ServicePageTemplate from '../components/services/ServicePageTemplate';

const subServices = [
  { icon: Wind, title: "HVAC Maintenance", desc: "Complete air conditioning and ventilation system maintenance, repair and installation for optimal indoor climate control.", color: "bg-sky-100 text-sky-600" },
  { icon: Zap, title: "Electrical Services", desc: "Full electrical maintenance including lighting, power distribution, panel boards, and emergency systems.", color: "bg-yellow-100 text-yellow-600" },
  { icon: Droplets, title: "Plumbing Services", desc: "Comprehensive plumbing covering water supply, drainage, sanitary fittings and water heaters.", color: "bg-blue-100 text-blue-600" },
  { icon: Wrench, title: "MEP Maintenance", desc: "Preventive and corrective maintenance for all mechanical, electrical and plumbing systems.", color: "bg-orange-100 text-orange-600" },
  { icon: Flame, title: "Fire & Life Safety", desc: "Fire alarm systems, fire fighting equipment, sprinklers, smoke detectors, and emergency evacuation systems.", color: "bg-red-100 text-red-600" },
  { icon: Gauge, title: "BMS & Controls", desc: "Building Management System monitoring, maintenance and optimization for energy efficiency.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Paintbrush, title: "Civil & Painting Works", desc: "Structural repairs, masonry, waterproofing, tiling, plastering and internal/external painting.", color: "bg-purple-100 text-purple-600" },
  { icon: MoveVertical, title: "Elevator & Escalator", desc: "Lift and escalator maintenance, modernization and emergency rescue services.", color: "bg-slate-100 text-slate-600" },
];

const highlights = [
  "24/7 emergency response team on standby",
  "Certified and experienced technicians for every discipline",
  "Scheduled preventive maintenance programs",
  "Energy efficiency optimization across all systems",
  "Full compliance with Dubai & UAE local codes",
  "Comprehensive reporting & digital analytics",
  "Rapid fault diagnosis and same-day rectification",
  "Trusted by Dubai's leading developers and communities",
];

const description = [
  "Our Hard Services cover all aspects of building maintenance including MEP systems, HVAC, electrical, plumbing, fire safety and civil works. We ensure your property's technical systems operate at peak performance year-round.",
  "With certified technicians across every discipline and a 24/7 emergency response capability, INAYA delivers hard services that protect the value and functionality of your assets.",
];

export default function HardServices() {
  return (
    <ServicePageTemplate
      category="Facilities Management"
      title="Hard Services"
      subtitle="Expert technical maintenance for all building systems — MEP, HVAC, electrical, plumbing, fire safety and civil works — by ISO-certified professionals."
      heroImage="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80"
      description={description}
      subServices={subServices}
      highlights={highlights}
      highlightsTitle="Why Choose Our Hard Services?"
      ctaLink="OnDemandServices"
      ctaLabel="Book a Hard Service"
    />
  );
}