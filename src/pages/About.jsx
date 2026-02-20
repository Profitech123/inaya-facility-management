import React from 'react';
import { Shield, Award, Heart, Users, Target, TrendingUp } from 'lucide-react';

const coreValues = [
  { icon: Heart, title: "Honesty", desc: "We always tell the entire truth, are sincere, and refrain from withholding important information in relationships of trust." },
  { icon: Shield, title: "Integrity", desc: "We firmly adhere to a standard of values and consistently honour what we say, becoming a trustworthy partner." },
  { icon: Target, title: "Accountability", desc: "We take responsibility for our performance in all decisions and actions, owning up to any shortcomings." },
  { icon: Award, title: "Reliability", desc: "We are a dependable service provider who can be relied upon to deliver the desired outcomes." },
  { icon: Users, title: "Customer Focus", desc: "We listen to our customers, understand their needs and continually focus on delivering what they truly value." }
];

const stats = [
  { value: '700+', label: 'Team Members', color: 'hsl(160,60%,38%)' },
  { value: '24/7', label: 'Support', color: 'hsl(210,80%,55%)' },
  { value: 'ISO', label: 'Certified', color: 'hsl(40,80%,50%)' },
  { value: '549+', label: 'Hectares Managed', color: 'hsl(270,60%,55%)' },
];

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Hero */}
      <div className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[hsl(160,60%,45%)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">About INAYA</p>
          <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">Facilities management, <em className="text-[hsl(160,60%,45%)] not-italic">elevated</em></h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            Part of Belhasa Group, one of the UAE's most established group of companies, with the resources and solid financial base to offer leading expertise.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[hsl(40,10%,90%)] p-6 text-center shadow-xl shadow-black/[0.03]">
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-[hsl(210,10%,55%)] uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[hsl(210,20%,10%)] mb-6">Leading FM company in the UAE</h2>
            <div className="space-y-4 text-[hsl(210,10%,45%)] leading-relaxed">
              <p>INAYA Facilities Management Services develops, manages and executes FM strategies to maximise the performance and lifecycle of client assets. From residential and commercial through to large-scale retail properties, we offer maintenance, cleaning and specialist services with best-in-class service delivery and sustainability performance.</p>
              <p>We understand how buildings are designed and the systems that make them work smoothly. Our management team has a solid body of knowledge built from working with some of the most respected FM firms regionally and internationally.</p>
              <p>We pride ourselves on our honesty, dependability, accountability and accessibility. The relationships we forge with our clients are meaningful and enduring, integrating people and processes and setting the regional benchmark in service delivery.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[hsl(40,10%,90%)] p-8 lg:p-10">
            <h3 className="text-xl font-serif font-bold text-[hsl(210,20%,10%)] mb-4">Technical Excellence</h3>
            <div className="space-y-4 text-[hsl(210,10%,45%)] leading-relaxed text-sm">
              <p>Our on-the-ground technical team stays completely up-to-date with emerging international practices and technologies, working with clients and end users at every stage to ensure FM requirements are met to the last detail.</p>
              <p>Through our ongoing energy management programmes, we gain complete efficiency from the buildings we maintain, providing our clients with real cost savings in the longer-term.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-20" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[hsl(160,60%,45%)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">What We Stand For</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Our core values</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {coreValues.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[hsl(160,60%,38%)]/30 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300" style={{ backgroundColor: 'hsl(160,60%,38%,0.1)' }}>
                    <Icon className="w-6 h-6 text-[hsl(160,60%,45%)]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{value.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
