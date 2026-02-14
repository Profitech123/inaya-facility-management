import React from 'react';
import { Check, User, Wrench, Landmark, FileText, GraduationCap } from 'lucide-react';

const STEPS = [
  { label: 'Profile', icon: User },
  { label: 'Specialization', icon: Wrench },
  { label: 'Bank Details', icon: Landmark },
  { label: 'Documents', icon: FileText },
  { label: 'App Tutorial', icon: GraduationCap },
];

export default function ProviderOnboardingStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isCompleted ? 'bg-emerald-600 text-white' : ''}
                ${isCurrent ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2' : ''}
                ${!isCompleted && !isCurrent ? 'bg-slate-100 text-slate-400' : ''}
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium text-center ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full mt-[-18px] min-w-4 max-w-16 ${idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}