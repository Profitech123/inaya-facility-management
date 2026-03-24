import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PlusCircle, ArrowsClockwise, HouseLine, ChatDots } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const actions = [
  {
    icon: PlusCircle,
    label: 'Book a Service',
    desc: 'Schedule a single visit',
    page: 'OnDemandServices',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100 hover:border-emerald-300',
  },
  {
    icon: ArrowsClockwise,
    label: 'Subscription Plans',
    desc: 'Save with recurring packages',
    page: 'Subscriptions',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100 hover:border-blue-300',
  },
  {
    icon: HouseLine,
    label: 'My Properties',
    desc: 'Manage your addresses',
    page: 'MyProperties',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100 hover:border-violet-300',
  },
  {
    icon: ChatDots,
    label: 'Get Support',
    desc: '24/7 assistance available',
    page: 'Support',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100 hover:border-amber-300',
  },
];

export default function QuickActionsRow() {
  return (
    <div>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-0.5">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.page}
              to={createPageUrl(action.page)}
              className={`group bg-white border ${action.border} rounded-2xl p-4 flex flex-col gap-2.5 transition-all hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${action.color}`} weight="duotone" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm leading-tight">{action.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{action.desc}</div>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity mt-auto`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}