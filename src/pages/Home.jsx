import React, { lazy, Suspense } from 'react';
import Hero from '../components/marketing/Hero';

const FeaturesRow = lazy(() => import('../components/marketing/FeaturesRow'));
const SpecializedServices = lazy(() => import('../components/marketing/SpecializedServices'));
const PricingSection = lazy(() => import('../components/marketing/PricingSection'));
const OneOffServices = lazy(() => import('../components/marketing/OneOffServices'));
const CTASection = lazy(() => import('../components/marketing/CTASection'));

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Suspense fallback={<div className="h-20" />}>
        <FeaturesRow />
        <SpecializedServices />
        <PricingSection />
        <OneOffServices />
        <CTASection />
      </Suspense>
    </div>
  );
}
