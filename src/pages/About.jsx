import React from 'react';
import { Shield, Award, Heart, Users, Target, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">About INAYA</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Leading facilities management company in UAE, developing and executing FM strategies to maximize the performance and lifecycle of your property.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Part of Belhasa Group</h2>
              <p className="text-lg text-slate-600 mb-4">
                INAYA is backed by the trusted Belhasa Group legacy, bringing over 45 years of excellence to your home. Our comprehensive facilities management services are delivered by a team of over 700 skilled professionals from diverse backgrounds.
              </p>
              <p className="text-lg text-slate-600">
                We manage and maintain more than 549 hectares of building blocks across the region, delivering 24/7 maintenance and service excellence.
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

          <div className="mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { icon: Heart, title: "Honesty", desc: "Transparent in all interactions" },
                { icon: Shield, title: "Integrity", desc: "Ethical and trustworthy" },
                { icon: Target, title: "Accountability", desc: "Responsible for results" },
                { icon: Award, title: "Reliability", desc: "Consistent excellence" },
                { icon: Users, title: "Customer Focus", desc: "Your needs first" }
              ].map((value, idx) => {
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