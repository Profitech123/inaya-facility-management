import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Wrench, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categories = [
  {
    icon: Sparkles,
    title: "Soft Services",
    description: "Cleaning, pest control, landscaping, pool maintenance, waste management, and security services for your home.",
    color: "bg-blue-500",
    services: ["Cleaning Services", "Pest Control", "Landscaping & Irrigation", "Pool Maintenance", "Security Services", "Waste Management"]
  },
  {
    icon: Wrench,
    title: "Hard Services",
    description: "MEP maintenance, AC servicing, plumbing, electrical work, and civil maintenance to keep your property running smoothly.",
    color: "bg-orange-500",
    services: ["AC Maintenance", "Plumbing Repairs", "Electrical Services", "Civil Maintenance", "24/7 Emergency Response"]
  },
  {
    icon: Settings,
    title: "Specialized Services",
    description: "Expert solutions for firefighting systems, elevators, water treatment, and other technical requirements.",
    color: "bg-purple-500",
    services: ["Firefighting Systems", "Elevator Maintenance", "Water Tank Cleaning", "Signage & Digital Systems"]
  }
];

export default function ServiceCategories() {
  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Complete Home Care Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything your villa or apartment needs, available on-demand or through our subscription packages.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${category.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 text-${category.color.replace('bg-', '')}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                  <p className="text-slate-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {category.services.map((service, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                        {service}
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl('Services')}>
                    <Button variant="ghost" className="w-full group">
                      View Services
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}