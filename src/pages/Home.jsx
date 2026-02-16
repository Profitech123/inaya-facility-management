import React, { lazy, Suspense } from 'react';
import Hero from '../components/marketing/Hero';

const ServiceCategories = lazy(() => import('../components/marketing/ServiceCategories'));
const ServiceFinderBanner = lazy(() => import('../components/marketing/ServiceFinderBanner'));
const HowItWorks = lazy(() => import('../components/marketing/HowItWorks'));
const ManagingPortfolios = lazy(() => import('../components/marketing/ManagingPortfolios'));
const CoreValuesPreview = lazy(() => import('../components/marketing/CoreValuesPreview'));
const ClientsCarousel = lazy(() => import('../components/marketing/ClientsCarousel'));
const TrustSignals = lazy(() => import('../components/marketing/TrustSignals'));
const CTASection = lazy(() => import('../components/marketing/CTASection'));

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Suspense fallback={<div className="h-20" />}>
        <ServiceCategories />
        <ServiceFinderBanner />
        <HowItWorks />
        <ManagingPortfolios />
        <CoreValuesPreview />
        <ClientsCarousel />
        <TrustSignals />
        <CTASection />
      </Suspense>
    </div>
  );
}