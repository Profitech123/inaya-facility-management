import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Settings } from 'lucide-react';

const faqs = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes, you can upgrade or downgrade your plan through the dashboard. Upgrades take effect immediately.'
  },
  {
    q: 'Are spare parts included?',
    a: 'Subscription covers labor and call-out fees. Spare parts are billed separately with your plan discount applied.'
  },
  {
    q: 'What is "Priority Response"?',
    a: 'Gold Elite members are guaranteed a technician on-site within 2 hours for all emergency requests.'
  },
  {
    q: 'How do I book a service?',
    a: 'Simply use the INAYA mobile app or dashboard to schedule your maintenance at your preferred time.'
  }
];

export default function PlanManagement() {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 md:p-10">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">Plan Management</h3>
          <p className="text-slate-400 text-sm mb-4">
            Need something different? You can modify your plan, add specific one-time services, or manage your billing details at any time.
          </p>
          <Link
            to={createPageUrl('MySubscriptions')}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Billing & Subscription
          </Link>
        </div>

        {/* Right - FAQ grid */}
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i}>
              <h4 className="font-semibold text-white text-sm mb-1">{faq.q}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}