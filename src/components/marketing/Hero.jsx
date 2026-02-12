import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80" 
          alt="Dubai Villa"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Part of Belhasa Group</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Flexible, Cost Competitive
            <span className="block text-emerald-400">Solutions, Tailored to Your Needs</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            INAYA is the leading Facilities Management company in UAE. We develop, manage and execute FM strategies to maximise the performance and lifecycle of your home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to={createPageUrl('Services')}>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6">
                Book a Service
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Subscriptions')}>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white text-lg px-8 py-6">
                View Packages
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="font-semibold">549+ Hectares</div>
                <div className="text-sm text-slate-400">Managed across UAE</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="font-semibold">24/7 Service</div>
                <div className="text-sm text-slate-400">Maintenance & support</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="font-semibold">ISO Certified</div>
                <div className="text-sm text-slate-400">Excellence assured</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}