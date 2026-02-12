import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Sparkles, Phone, Headphones, Link2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function IntegratedFM() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">Facilities Management Services</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Our integrated Facilities Management offering provides the most comprehensive range of both 'hard' maintenance and 'soft' cleaning/specialised services.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Image & Description */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <img 
              src="https://www.inaya.ae/wp-content/uploads/2018/01/integrated-facilities-management-company-dubai-abudhabi-uae-inaya.jpg" 
              alt="Integrated FM Services" 
              className="rounded-xl shadow-lg w-full h-80 object-cover"
            />
            <div>
              <p className="text-lg text-slate-600 mb-4">
                A major aspect of our project management operations is our sourcing and supply chain capability. As well as our integrated systems for monitoring our own performance, we maintain strict measures to evaluate and monitor the performance of our own suppliers and approved specialist contractors.
              </p>
              <p className="text-lg text-slate-600 mb-4">
                Through building strong working relationships we maintain solid buying power and secure reliable and high quality services within a cost-competitive framework.
              </p>
              <p className="text-lg text-slate-600">
                Within all our operations we provide you with a constant communications touchpoint 24/7, 365 days a year, through our customer service contact centre. This helps us to provide you with an exemplary level of service delivery and gives us our own performance barometer.
              </p>
            </div>
          </div>

          {/* Service Categories */}
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Service Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wrench, title: "Hard Services", desc: "MEP maintenance, HVAC, electrical, plumbing, civil and painting works", link: "HardServices", color: "bg-orange-100 text-orange-600" },
              { icon: Sparkles, title: "Soft Services", desc: "Large-scale cleaning, security, waste management, landscaping, pest control", link: "SoftServices", color: "bg-blue-100 text-blue-600" },
              { icon: Link2, title: "Project Management", desc: "Building refurbishment, fit-out, renovation and turnkey solutions", link: "ProjectManagement", color: "bg-purple-100 text-purple-600" },
              { icon: Headphones, title: "24/7 Contact Centre", desc: "Constant communications touchpoint for exemplary service delivery", link: "Contact", color: "bg-green-100 text-green-600" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link key={idx} to={createPageUrl(item.link)}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Phone className="w-5 h-5 mr-2" /> Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}