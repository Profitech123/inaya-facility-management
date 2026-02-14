import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle as PhCheckCircle, Circle as PhCircle, CaretDown, CaretUp, X as PhX, Sparkle, MagnifyingGlass, House, CalendarPlus, Package as PhPackage, ClipboardText, SquaresFour, CalendarCheck, Lifebuoy, TrendingUp as PhTrendingUp, UsersThree } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CUSTOMER_STEPS, ADMIN_STEPS } from './onboardingConfig';

const ICON_MAP = { Search: MagnifyingGlass, Home: House, CalendarPlus, Package: PhPackage, ClipboardList: ClipboardText, LayoutDashboard: SquaresFour, CalendarCheck, LifeBuoy: Lifebuoy, TrendingUp: PhTrendingUp, Users: UsersThree };

export default function OnboardingChecklist({ userRole }) {
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();
  const steps = userRole === 'admin' ? ADMIN_STEPS : CUSTOMER_STEPS;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboardingProgress', user?.id],
    queryFn: async () => {
      const all = await base44.entities.OnboardingProgress.list();
      return all.find(p => p.user_id === user?.id) || null;
    },
    enabled: !!user?.id,
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.OnboardingProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboardingProgress'] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OnboardingProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboardingProgress'] }),
  });

  // Auto-create progress record for new users
  useEffect(() => {
    if (user?.id && progress === null && !isLoading) {
      createProgressMutation.mutate({
        user_id: user.id,
        role: userRole === 'admin' ? 'admin' : 'customer',
        completed_steps: [],
        dismissed: false,
      });
    }
  }, [user?.id, progress, isLoading]);

  const completedSteps = progress?.completed_steps || [];
  const dismissed = progress?.dismissed || false;
  const completionPercent = Math.round((completedSteps.length / steps.length) * 100);
  const allDone = completedSteps.length === steps.length;

  const markStepComplete = (stepId) => {
    if (!progress || completedSteps.includes(stepId)) return;
    updateProgressMutation.mutate({
      id: progress.id,
      data: { completed_steps: [...completedSteps, stepId] },
    });
  };

  const handleDismiss = () => {
    if (!progress) return;
    updateProgressMutation.mutate({
      id: progress.id,
      data: { dismissed: true },
    });
  };

  if (isLoading || !user || dismissed || allDone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Sparkle className="w-5 h-5 text-emerald-600" weight="duotone" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800">
              {userRole === 'admin' ? 'Admin Onboarding' : 'Getting Started'}
            </h3>
            <p className="text-xs text-slate-500">
              {completedSteps.length}/{steps.length} steps completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={completionPercent} className="w-20 h-2" />
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
            title="Dismiss onboarding"
          >
            <PhX className="w-4 h-4 text-slate-400" />
          </button>
          {expanded ? <CaretUp className="w-4 h-4 text-slate-400" weight="bold" /> : <CaretDown className="w-4 h-4 text-slate-400" weight="bold" />}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2">
              {steps.map((step) => {
                const isDone = completedSteps.includes(step.id);
                const Icon = ICON_MAP[step.icon] || Circle;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDone ? 'bg-emerald-50/60' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => markStepComplete(step.id)}
                      className="flex-shrink-0"
                    >
                      {isDone ? (
                        <PhCheckCircle className="w-5 h-5 text-emerald-500" weight="duotone" />
                      ) : (
                        <PhCircle className="w-5 h-5 text-slate-300 hover:text-emerald-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{step.description}</p>
                    </div>
                    {!isDone && (
                      <Link to={createPageUrl(step.page)} onClick={() => markStepComplete(step.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          <Icon className="w-3 h-3 mr-1" /> Go
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}