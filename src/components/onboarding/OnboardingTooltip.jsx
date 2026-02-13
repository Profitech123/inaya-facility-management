import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

const TIPS = {
  customer: [
    { id: 'tip_book', title: 'Quick Booking', message: 'You can book any service in under 2 minutes! Head to On-Demand Services to get started.' },
    { id: 'tip_sub', title: 'Save with Subscriptions', message: 'Regular maintenance? Our subscription packages save you up to 20% compared to one-off bookings.' },
    { id: 'tip_track', title: 'Track Everything', message: 'Check My Bookings anytime to see the real-time status of your services.' },
    { id: 'tip_support', title: 'Need Help?', message: 'Use the Support page to create a ticket or chat with our team directly.' },
  ],
  admin: [
    { id: 'tip_assign', title: 'Assign Technicians', message: 'In Admin Bookings, you can assign technicians to pending requests with one click.' },
    { id: 'tip_analytics', title: 'Business Insights', message: 'The Analytics page shows revenue trends, customer metrics, and technician utilization.' },
    { id: 'tip_ai', title: 'AI-Powered Support', message: 'Use the AI draft feature in Support Tickets to generate quick, professional responses.' },
    { id: 'tip_reports', title: 'Export Reports', message: 'Generate and export detailed reports on revenue, bookings, and technician performance.' },
  ],
};

export default function OnboardingTooltip({ role = 'customer' }) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const storageKey = `inaya_tips_seen_${role}`;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const tips = TIPS[role] || TIPS.customer;
  const currentTip = tips[currentTipIndex];

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  const handleNext = () => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      handleDismiss();
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-24 left-6 z-[9998] max-w-xs bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl shadow-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm">{currentTip.title}</h4>
              <button onClick={handleDismiss} className="hover:bg-white/20 rounded p-0.5 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">{currentTip.message}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-emerald-200">{currentTipIndex + 1}/{tips.length}</span>
              <button
                onClick={handleNext}
                className="text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              >
                {currentTipIndex < tips.length - 1 ? 'Next Tip' : 'Got it!'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}