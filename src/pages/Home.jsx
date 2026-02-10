import React from 'react';
import Hero from '../components/marketing/Hero';
import ServiceCategories from '../components/marketing/ServiceCategories';
import TrustSignals from '../components/marketing/TrustSignals';
import CTASection from '../components/marketing/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServiceCategories />
      <TrustSignals />
      <CTASection />
    </div>
  );
}