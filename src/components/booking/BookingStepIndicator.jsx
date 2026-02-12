import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { number: 1, label: 'Schedule' },
  { number: 2, label: 'Customize' },
  { number: 3, label: 'Review & Confirm' },
];

export default function BookingStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        return (
          <React.Fragment key={step.number}>
            {idx > 0 && (
              <div className={cn(
                "hidden sm:block h-px w-12 transition-colors",
                isCompleted ? "bg-emerald-500" : "bg-slate-200"
              )} />
            )}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                isCompleted ? "bg-emerald-500 text-white" :
                isActive ? "bg-emerald-600 text-white ring-4 ring-emerald-100" :
                "bg-slate-100 text-slate-400"
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span className={cn(
                "hidden sm:inline text-sm font-medium",
                isActive ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}