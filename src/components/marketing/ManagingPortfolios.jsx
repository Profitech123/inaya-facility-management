import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ManagingPortfolios() {
  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-emerald-600 font-semibold mb-2 uppercase tracking-wide text-sm">
              24/7 Maintenance and service for more than 549 hectares of building blocks in the region
            </p>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Managing Portfolios to Enhance Building Performance
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              At INAYA, we are passionate about the services we provide, and committed to delivering them in a responsible, efficient and environmentally-sound manner.
            </p>
            <p className="text-lg text-slate-600 mb-8">
              We not only maintain your property to exemplary standards, but proactively look for ways to improve its lifecycle, performance and cost-efficiency. INAYA makes the crucial difference where it matters.
            </p>
            <Link to={createPageUrl('IntegratedFM')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Discover Our Services <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80" alt="Building" className="rounded-xl h-64 w-full object-cover" />
            <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80" alt="Office" className="rounded-xl h-64 w-full object-cover mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}