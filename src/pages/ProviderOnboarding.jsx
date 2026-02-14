import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AuthGuard from '../components/AuthGuard';
import ProviderOnboardingStepIndicator from '../components/onboarding/provider/ProviderOnboardingStepIndicator';
import StepProfile from '../components/onboarding/provider/StepProfile';
import StepSpecialization from '../components/onboarding/provider/StepSpecialization';
import StepBankDetails from '../components/onboarding/provider/StepBankDetails';
import StepDocuments from '../components/onboarding/provider/StepDocuments';
import StepTutorial from '../components/onboarding/provider/StepTutorial';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PartyPopper, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

function ProviderOnboardingContent() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('id');

  const { data: provider, isLoading } = useQuery({
    queryKey: ['onboardingProvider', providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const list = await base44.entities.Provider.filter({ id: providerId });
      return list?.[0] || null;
    },
    enabled: !!providerId,
  });

  useEffect(() => {
    if (provider) {
      setStep(provider.onboarding_step || 0);
      if (provider.onboarding_status === 'completed') {
        setCompleted(true);
      }
    }
  }, [provider]);

  const handleUpdate = async (data) => {
    if (!providerId) return;
    const stepToSave = Math.max(step + 1, provider?.onboarding_step || 0);
    await base44.entities.Provider.update(providerId, {
      ...data,
      onboarding_step: stepToSave,
      onboarding_status: stepToSave >= 5 ? 'completed' : 'in_progress',
    });
    queryClient.invalidateQueries({ queryKey: ['onboardingProvider', providerId] });
  };

  const goNext = () => setStep(s => Math.min(s + 1, 4));
  const goBack = () => setStep(s => Math.max(s - 1, 0));
  const handleComplete = () => setCompleted(true);

  if (!providerId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Provider ID</h2>
            <p className="text-slate-500 text-sm">This onboarding link is missing a provider ID. Please contact your administrator for the correct link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Provider Not Found</h2>
            <p className="text-slate-500 text-sm">Could not find a provider with this ID. Please check the link or contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-emerald-200">
          <CardContent className="pt-10 pb-10 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <PartyPopper className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome Aboard!</h2>
            <p className="text-slate-600 max-w-sm mx-auto">
              You're all set, <strong>{provider.full_name}</strong>. Your profile is ready and you'll start receiving job assignments soon.
            </p>
            <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800 max-w-sm mx-auto">
              <strong>What's next?</strong>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Keep your schedule and availability up to date</li>
                <li>• Watch for assignment notifications</li>
                <li>• Complete jobs professionally for great reviews</li>
              </ul>
            </div>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 mt-2">
                Go to Homepage <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-5 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
              alt="INAYA" className="h-8"
            />
            <span className="text-sm font-medium text-slate-400">Provider Onboarding</span>
          </div>
          <span className="text-xs text-slate-400">Step {step + 1} of 5</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <ProviderOnboardingStepIndicator currentStep={step} />
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {step === 0 && <StepProfile provider={provider} onUpdate={handleUpdate} onNext={goNext} />}
            {step === 1 && <StepSpecialization provider={provider} onUpdate={handleUpdate} onNext={goNext} onBack={goBack} />}
            {step === 2 && <StepBankDetails provider={provider} onUpdate={handleUpdate} onNext={goNext} onBack={goBack} />}
            {step === 3 && <StepDocuments provider={provider} onUpdate={handleUpdate} onNext={goNext} onBack={goBack} />}
            {step === 4 && <StepTutorial provider={provider} onUpdate={handleUpdate} onComplete={handleComplete} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProviderOnboarding() {
  return (
    <AuthGuard requiredRole="any">
      <ProviderOnboardingContent />
    </AuthGuard>
  );
}