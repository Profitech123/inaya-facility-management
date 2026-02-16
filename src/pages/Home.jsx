import React, { lazy, Suspense } from 'react';
import Hero from '../components/marketing/Hero';

const FeaturesRow = lazy(() => import('../components/marketing/FeaturesRow'));
const SpecializedServices = lazy(() => import('../components/marketing/SpecializedServices'));
const BeforeAfterGallery = lazy(() => import('../components/marketing/BeforeAfterGallery'));
const PricingSection = lazy(() => import('../components/marketing/PricingSection'));
const PricingCalculator = lazy(() => import('../components/marketing/PricingCalculator'));
const ServiceFinderBanner = lazy(() => import('../components/marketing/ServiceFinderBanner'));
const TestimonialsCarousel = lazy(() => import('../components/marketing/TestimonialsCarousel'));
const QuickBookServices = lazy(() => import('../components/marketing/QuickBookServices'));
const HomeFAQ = lazy(() => import('../components/marketing/HomeFAQ'));
const ClientsCarousel = lazy(() => import('../components/marketing/ClientsCarousel'));
const TrustSignals = lazy(() => import('../components/marketing/TrustSignals'));
const CTASection = lazy(() => import('../components/marketing/CTASection'));

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Suspense fallback={<div className="h-20" />}>
        <FeaturesRow />
        <SpecializedServices />
        <BeforeAfterGallery />
        <PricingSection />
        <PricingCalculator />
        <ServiceFinderBanner />
        <TestimonialsCarousel />
        <QuickBookServices />
        <HomeFAQ />
        <ClientsCarousel />
        <TrustSignals />
        <CTASection />
      </Suspense>
    </div>
  );
}