import React, { lazy, Suspense } from 'react';
import Hero from '../components/marketing/Hero';

const FeaturesRow = lazy(() => import('../components/marketing/FeaturesRow'));
const SpecializedServices = lazy(() => import('../components/marketing/SpecializedServices'));
const BeforeAfterGallery = lazy(() => import('../components/marketing/BeforeAfterGallery'));
const PricingSection = lazy(() => import('../components/marketing/PricingSection'));
const PricingCalculator = lazy(() => import('../components/marketing/PricingCalculator'));
const Testimonials = lazy(() => import('../components/marketing/Testimonials'));
const OneOffServices = lazy(() => import('../components/marketing/OneOffServices'));
const HomeFAQ = lazy(() => import('../components/marketing/HomeFAQ'));
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
        <Testimonials />
        <OneOffServices />
        <HomeFAQ />
        <CTASection />
      </Suspense>
    </div>
  );
}
