import React from 'react';
import { Check, Home, CalendarDays, Wrench, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 1, label: 'Property', icon: Home },
  { id: 2, label: 'Schedule', icon: CalendarDays },
  { id: 3, label: 'Customize', icon: Wrench },
  { id: 4, label: 'Review & Pay', icon: ClipboardCheck },
];

export default function BookingStepNav({ currentStep }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-slate-200">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#10b981' : isActive ? '#059669' : '#f1f5f9',
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                    isCompleted && "shadow-emerald-200",
                    isActive && "shadow-lg shadow-emerald-200 ring-4 ring-emerald-100"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  ) : (
                    <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-slate-400")} />
                  )}
                </motion.div>
                <span className={cn(
                  "text-[11px] font-medium transition-colors hidden sm:block",
                  isActive ? "text-emerald-700" : isCompleted ? "text-emerald-600" : "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}