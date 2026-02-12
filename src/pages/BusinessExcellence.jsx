import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Leaf, Heart, Zap, Award, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BusinessExcellence() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">Business Excellence</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Health, Safety, Environment, Energy and Quality Management — at the core of everything we do.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <img 
              src="https://www.inaya.ae/wp-content/uploads/2018/01/qhse-policy-inaya.jpg" 
              alt="HSEEQ Policy" 
              className="rounded-xl shadow-lg w-full h-80 object-cover"
            />
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">HSEEQ Commitment</h2>
              <p className="text-lg text-slate-600 mb-4">
                True to our name, caring for our people and the environment is at the core of everything we do at INAYA. We are committed to a goal of zero injuries, illnesses, and incidents as well as reducing our carbon footprint.
              </p>
              <p className="text-lg text-slate-600 mb-4">
                We believe that all workplace injuries as well as health and environmental incidents are preventable. Health, safety, energy conservation, and protection of the environment are the main business values that rank equally with our financial objectives and core values.
              </p>
              <p className="text-lg text-slate-600">
                We integrate HSEEQ (Health, Safety, Environment, Energy, and Quality Management Systems) into all our activities by encouraging our workforce to always adopt the safest work methods and not take any shortcuts.
              </p>
            </div>
          </div>

          {/* HSEEQ Pillars */}
          <div className="grid md:grid-cols-5 gap-6 mb-16">
            {[
              { icon: Heart, title: "Health", desc: "Zero injuries and illnesses goal", color: "bg-red-100 text-red-600" },
              { icon: Shield, title: "Safety", desc: "Safest work methods always", color: "bg-blue-100 text-blue-600" },
              { icon: Leaf, title: "Environment", desc: "Reducing our carbon footprint", color: "bg-green-100 text-green-600" },
              { icon: Zap, title: "Energy", desc: "Conservation and efficiency", color: "bg-yellow-100 text-yellow-600" },
              { icon: Award, title: "Quality", desc: "ISO-certified management systems", color: "bg-purple-100 text-purple-600" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx}>
                  <CardContent className="pt-6 text-center">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our HSEEQ Policy</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Our integrated HSEEQ policy provides a clear insight into our management's commitment and expectation of having a safe and healthy work environment for everyone without forgetting the commitment to protect mother Earth.
            </p>
            <a href="https://www.inaya.ae/wp-content/uploads/2022/11/IMS_HSEEQ_POLICY.pdf" target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700">View HSEEQ Policy (PDF)</Button>
            </a>
          </div>

          <div className="mt-12 text-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" variant="outline">
                <Phone className="w-5 h-5 mr-2" /> Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}