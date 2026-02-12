import React from 'react';
import { Shield, Award, Heart, Users, Target, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">About INAYA</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            At INAYA, meaning 'care' in Arabic, we are passionate about the services we provide, and committed to delivering them in a responsible, efficient and environmentally-sound manner.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Managing Portfolios to Enhance Building Performance</h2>
              <p className="text-lg text-slate-600 mb-4">
                At INAYA, we are passionate about the services we provide, and committed to delivering them in a responsible, efficient and environmentally-sound manner. We not only maintain your property to exemplary standards, but proactively look for ways to improve its lifecycle, performance and cost-efficiency.
              </p>
              <p className="text-lg text-slate-600">
                INAYA makes the crucial difference where it matters. We know that while facilities management is about buildings and facilities, it has people at its core.
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
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Heart, title: "Care", desc: "INAYA means care in Arabic - it's at our core" },
                { icon: Shield, title: "Responsibility", desc: "Providing services responsibly and ethically" },
                { icon: Target, title: "Excellence", desc: "Committed to exemplary standards" },
                { icon: Award, title: "Sustainability", desc: "Environmentally-sound practices" },
                { icon: Users, title: "People-Focused", desc: "Buildings with people at the core" },
                { icon: TrendingUp, title: "Performance", desc: "Maximizing lifecycle and cost-efficiency" }
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