import React, { lazy, Suspense } from 'react';
import Hero from '../components/marketing/Hero';

const ServiceCategories = lazy(() => import('../components/marketing/ServiceCategories'));
const ManagingPortfolios = lazy(() => import('../components/marketing/ManagingPortfolios'));
const CoreValuesPreview = lazy(() => import('../components/marketing/CoreValuesPreview'));
const ClientsCarousel = lazy(() => import('../components/marketing/ClientsCarousel'));
const TrustSignals = lazy(() => import('../components/marketing/TrustSignals'));
const CTASection = lazy(() => import('../components/marketing/CTASection'));
const BeforeAfterSlider = lazy(() => import('../components/marketing/BeforeAfterSlider'));
const Testimonials = lazy(() => import('../components/marketing/Testimonials'));

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Suspense fallback={<div className="h-20" />}>
        <ServiceCategories />
        <BeforeAfterSlider
          beforeImage="https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1200&auto=format&fit=crop"
          afterImage="https://images.unsplash.com/photo-1594911772125-07fc7a2d8d80?q=80&w=1200&auto=format&fit=crop"
          title="AC Deep Cleaning"
          description="Villa in Arabian Ranches"
        />
        <ManagingPortfolios />
        <CoreValuesPreview />
        <ClientsCarousel />
        <Testimonials />
        <TrustSignals />
        <CTASection />
      </Suspense>
    </div>
  );
}