import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Shield, Trash2, TreePine, Bug, Waves, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import QuoteRequestForm from '../components/services/QuoteRequestForm';

const softServices = [
  { icon: Sparkles, title: "Cleaning Services", desc: "Large-scale residential and commercial cleaning services including deep cleaning, regular maintenance cleaning, and specialized cleaning." },
  { icon: Shield, title: "Security Services", desc: "Comprehensive security solutions including manned guarding, CCTV monitoring, access control systems and security audits." },
  { icon: Trash2, title: "Waste Management", desc: "Complete waste management and disposal services including collection, segregation, recycling and environmentally responsible disposal." },
  { icon: TreePine, title: "Landscaping & Irrigation", desc: "Full landscaping maintenance including garden care, tree trimming, irrigation system maintenance and seasonal planting." },
  { icon: Bug, title: "Pest Control Management", desc: "Integrated pest management services covering inspection, treatment and prevention for residential and commercial properties." },
  { icon: Waves, title: "Swimming Pool Maintenance", desc: "Complete pool maintenance including water treatment, cleaning, equipment checks, and chemical balancing for safe swimming environments." },
];

export default function SoftServices() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-emerald-400 font-semibold mb-2">Facilities Management</p>
          <h1 className="text-5xl font-bold mb-6">Soft Services</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Our soft services include large-scale cleaning, security, waste management, landscaping and irrigation, pest control management and swimming pool maintenance.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-600">{service.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 bg-slate-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Soft Services Approach</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Trained and certified cleaning professionals",
                "Eco-friendly cleaning products and methods",
                "Customized service schedules",
                "Regular quality inspections",
                "HACCP-certified food safety standards",
                "International best practices",
                "Comprehensive infection control protocols",
                "Dedicated customer service team"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center mb-16">
            <Link to={createPageUrl('OnDemandServices')}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 mr-4">
                Book a Soft Service <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#quote-form">
              <Button size="lg" variant="outline">
                Request a Quote
              </Button>
            </a>
          </div>

          <div id="quote-form">
            <QuoteRequestForm serviceName="Soft Services" />
          </div>
        </div>
      </div>
    </div>
  );
}