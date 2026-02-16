import React from 'react';
import { Shield, Award, Heart, Users, Target, TrendingUp } from 'lucide-react';

const coreValues = [
  {
    icon: Heart,
    title: "Honesty",
    desc: "We'll always tell the entire truth, be sincere and refrain from withholding important information in relationships of trust. We will always do things that are ethical and beneficial to our stakeholders."
  },
  {
    icon: Shield,
    title: "Integrity",
    desc: "We'll firmly adhere to a standard of values. We will only say things that we mean and consistently honour what we say. In doing so, we will become a trustworthy partner to our associates."
  },
  {
    icon: Target,
    title: "Accountability",
    desc: "We'll take responsibility for our performance in all our decisions and actions. We will continuously strive to deliver what we promised, owning up to any of our shortcomings."
  },
  {
    icon: Award,
    title: "Reliability",
    desc: "We'll be a dependable service provider who can be relied upon to provide the solutions sought, implement the necessary actions and deliver the desired outcomes to our customers."
  },
  {
    icon: Users,
    title: "Customer Focus",
    desc: "We'll listen to our customers, understand their needs and continually focus on delivering what they truly value. Our relationships will be built on trust, confidence and loyalty."
  }
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">INAYA Facilities Management Services</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Part of Belhasa Group, one of the UAE's most established group of companies, we have both the resources and solid financial base to offer our leading expertise.
          </p>
        </div>
      </div>

      {/* Company Overview */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Leading FM Company in UAE</h2>
              <p className="text-lg text-slate-600 mb-4">
                INAYA Facilities Management Services develops, manages and executes FM strategies to maximise the performance and lifecycle of client assets. From residential and commercial through to large-scale retail properties, we offer maintenance, cleaning and specialist services with best-in-class service delivery and sustainability performance.
              </p>
              <p className="text-lg text-slate-600 mb-4">
                We understand how buildings are designed and the systems that make them work smoothly for their intended use. Our management team has a solid body of knowledge built from working with some of the most respected FM firms regionally and internationally.
              </p>
              <p className="text-lg text-slate-600">
                We pride ourselves on our honesty, dependability, accountability and accessibility. The relationships we forge with our clients are meaningful and enduring, integrating people and processes and setting the regional benchmark in service delivery.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-6 rounded-xl">
                <Users className="w-10 h-10 text-emerald-600 mb-3" />
                <div className="text-3xl font-bold text-slate-900">700+</div>
                <div className="text-slate-600">Team Members</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <Shield className="w-10 h-10 text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-slate-900">24/7</div>
                <div className="text-slate-600">Support</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl">
                <Award className="w-10 h-10 text-orange-600 mb-3" />
                <div className="text-3xl font-bold text-slate-900">ISO</div>
                <div className="text-slate-600">Certified</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl">
                <TrendingUp className="w-10 h-10 text-purple-600 mb-3" />
                <div className="text-3xl font-bold text-slate-900">549+</div>
                <div className="text-slate-600">Hectares Managed</div>
              </div>
            </div>
          </div>

          {/* Technical Excellence */}
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 mb-20">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Technical Excellence</h3>
            <p className="text-lg text-slate-600 mb-4">
              Our on-the-ground technical team stays completely up-to-date with emerging international practices and technologies, and works with clients and end users at every stage to ensure the FM requirements for the assets we manage are met to the last detail.
            </p>
            <p className="text-lg text-slate-600">
              Through our ongoing energy management programmes, we gain complete efficiency from the buildings we maintain, providing our clients with real cost savings in the longer-term. Our business approach is designed around building strong relationships between owners, asset managers and tenants.
            </p>
          </div>

          {/* Core Values */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-5 gap-6">
              {coreValues.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-600">{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}