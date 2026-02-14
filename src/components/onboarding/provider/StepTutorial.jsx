import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronRight, ChevronLeft, Loader2, Bell, Calendar, ClipboardCheck, Camera, MessageSquare, Star } from 'lucide-react';

const TUTORIAL_SLIDES = [
  {
    icon: Bell,
    title: 'Receiving Assignments',
    description: 'When a service is scheduled, you\'ll receive an email notification and in-app alert with the job details, customer address, date, and time slot.',
    color: 'bg-blue-100 text-blue-600',
    tips: ['Check your notifications daily', 'Confirm or request reassignment promptly', 'Review customer notes before the visit'],
  },
  {
    icon: Calendar,
    title: 'Managing Your Schedule',
    description: 'Use the schedule view to see your upcoming assignments. You can set block-out times when you\'re unavailable, and the system will automatically avoid assigning you during those periods.',
    color: 'bg-violet-100 text-violet-600',
    tips: ['Block out vacation days in advance', 'Keep your availability up to date', 'Check next-day assignments each evening'],
  },
  {
    icon: ClipboardCheck,
    title: 'Completing a Job',
    description: 'When you arrive at the job site, mark it as "In Progress". After completing the service, mark it as "Completed" and add any notes about the work performed.',
    color: 'bg-emerald-100 text-emerald-600',
    tips: ['Always mark start time accurately', 'Document any issues found', 'Note any follow-up work needed'],
  },
  {
    icon: Camera,
    title: 'Uploading Completion Photos',
    description: 'After finishing the job, take photos of the completed work. This helps build trust with customers and provides documentation for quality assurance.',
    color: 'bg-amber-100 text-amber-600',
    tips: ['Take before & after photos', 'Ensure good lighting', 'Capture all areas serviced'],
  },
  {
    icon: MessageSquare,
    title: 'Communicating with Customers',
    description: 'Use the in-app messaging to communicate with customers about arrival times, access instructions, or any changes. Keep communication professional and timely.',
    color: 'bg-pink-100 text-pink-600',
    tips: ['Send ETA when en route', 'Be professional and courteous', 'Report issues to admin immediately'],
  },
  {
    icon: Star,
    title: 'Earning Great Reviews',
    description: 'Customers can rate your service after completion. High ratings lead to more job assignments, priority scheduling, and bonus opportunities.',
    color: 'bg-teal-100 text-teal-600',
    tips: ['Be punctual and professional', 'Explain what you did to the customer', 'Leave the workspace clean'],
  },
];

export default function StepTutorial({ provider, onUpdate, onComplete }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const slide = TUTORIAL_SLIDES[slideIndex];
  const isLast = slideIndex === TUTORIAL_SLIDES.length - 1;
  const Icon = slide.icon;

  const handleFinish = async () => {
    setSaving(true);
    await onUpdate({
      tutorial_completed: true,
      onboarding_status: 'completed',
      onboarding_step: 5,
    });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">App Tutorial</h2>
        <p className="text-slate-500 text-sm mt-1">Learn how to use INAYA for your daily work</p>
      </div>

      {/* Slide progress */}
      <div className="flex items-center gap-1.5">
        {TUTORIAL_SLIDES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-colors cursor-pointer ${idx <= slideIndex ? 'bg-emerald-500' : 'bg-slate-200'}`}
            onClick={() => setSlideIndex(idx)}
          />
        ))}
      </div>

      {/* Current slide */}
      <Card className="border-slate-200 overflow-hidden">
        <CardContent className="pt-8 pb-6 px-6">
          <div className={`w-14 h-14 rounded-2xl ${slide.color} flex items-center justify-center mb-5`}>
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{slide.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{slide.description}</p>

          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Tips</h4>
            <ul className="space-y-2">
              {slide.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-slate-400">
        {slideIndex + 1} of {TUTORIAL_SLIDES.length}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setSlideIndex(i => Math.max(0, i - 1))}
          disabled={slideIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        {isLast ? (
          <Button onClick={handleFinish} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Complete Onboarding
          </Button>
        ) : (
          <Button onClick={() => setSlideIndex(i => i + 1)} className="bg-emerald-600 hover:bg-emerald-700 px-8">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}