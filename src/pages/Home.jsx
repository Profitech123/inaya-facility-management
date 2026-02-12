import React from 'react';
import Hero from '../components/marketing/Hero';
import ServiceCategories from '../components/marketing/ServiceCategories';
import ManagingPortfolios from '../components/marketing/ManagingPortfolios';
import CoreValuesPreview from '../components/marketing/CoreValuesPreview';
import ClientsCarousel from '../components/marketing/ClientsCarousel';
import TrustSignals from '../components/marketing/TrustSignals';
import CTASection from '../components/marketing/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServiceCategories />
      <ManagingPortfolios />
      <CoreValuesPreview />
      <ClientsCarousel />
      <TrustSignals />
      <CTASection />
    </div>
  );
}