import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, MessageCircle, ArrowRight, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 400 && !dismissed) setVisible(true);
      else if (window.scrollY <= 400) setVisible(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  return (
    <>
      {/* ── Sticky bottom CTA bar (desktop) ── */}
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-40 hidden md:flex items-center justify-between bg-slate-900 text-white px-8 py-3.5 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-medium text-slate-200">
                Dubai's leading facilities management — <span className="text-white font-semibold">Get a free site survey today</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/97148157300?text=Hello%2C%20I%20would%20like%20to%20get%20a%20free%20site%20survey%20for%20my%20property."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.115 1.527 5.845L.057 23.486a.5.5 0 00.601.635l5.878-1.543A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.732 9.732 0 01-5.003-1.375l-.359-.213-3.724.977.995-3.631-.234-.373A9.72 9.72 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
                WhatsApp Us
              </a>
              <Link
                to={createPageUrl('Contact')}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Free Site Survey <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WhatsApp FAB (always visible on mobile, right side on desktop) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex flex-col gap-2 mb-1"
            >
              <a
                href="tel:+97148157300"
                className="flex items-center gap-2.5 bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-luxury border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                +971 4 815 7300
              </a>
              <a
                href="https://wa.me/97148157300?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20your%20facilities%20management%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-[#25D366] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:bg-[#1ebe5d] transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.115 1.527 5.845L.057 23.486a.5.5 0 00.601.635l5.878-1.543A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.732 9.732 0 01-5.003-1.375l-.359-.213-3.724.977.995-3.631-.234-.373A9.72 9.72 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowOptions(v => !v)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          aria-label="Contact us"
        >
          {showOptions
            ? <X className="w-6 h-6" />
            : <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.115 1.527 5.845L.057 23.486a.5.5 0 00.601.635l5.878-1.543A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.732 9.732 0 01-5.003-1.375l-.359-.213-3.724.977.995-3.631-.234-.373A9.72 9.72 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
          }
        </button>
      </div>
    </>
  );
}