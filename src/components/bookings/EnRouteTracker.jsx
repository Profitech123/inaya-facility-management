import React, { useState, useEffect } from 'react';
import { Navigation, Clock, Phone, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Simulates a countdown ETA based on when the booking was last updated to en_route
function computeETA(booking) {
  // Use updated_date as proxy for when en_route started
  const base = booking.updated_date ? new Date(booking.updated_date) : new Date();
  const elapsed = Math.floor((Date.now() - base.getTime()) / 1000 / 60); // minutes elapsed
  const eta = Math.max(5, 30 - elapsed); // starts at ~30min, floors at 5
  return eta;
}

const STAGES = [
  { label: 'Job accepted', done: true },
  { label: 'En route to you', done: true, active: true },
  { label: 'Arrived', done: false },
];

export default function EnRouteTracker({ booking, provider }) {
  const [eta, setEta] = useState(() => computeETA(booking));
  const [pulse, setPulse] = useState(false);

  // Recompute ETA every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(computeETA(booking));
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 60000);
    return () => clearInterval(interval);
  }, [booking]);

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
            </span>
            <span className="font-bold text-indigo-900 text-sm">Technician En Route</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-500">
            <RefreshCw className="w-3 h-3" />
            Live
          </div>
        </div>

        {/* ETA Banner */}
        <div className={`flex items-center gap-4 bg-indigo-600 text-white rounded-xl p-4 mb-4 transition-all duration-300 ${pulse ? 'scale-[1.01]' : ''}`}>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-indigo-200 mb-0.5">Estimated Arrival</p>
            <p className="text-3xl font-bold leading-none">{eta} <span className="text-lg font-normal">min</span></p>
          </div>
          <div className="ml-auto text-right">
            <Clock className="w-5 h-5 text-indigo-300 mx-auto mb-1" />
            <p className="text-xs text-indigo-200">approx.</p>
          </div>
        </div>

        {/* Stage progress */}
        <div className="flex items-center gap-2 mb-4">
          {STAGES.map((stage, idx) => (
            <React.Fragment key={stage.label}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  stage.active
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : stage.done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}>
                  {stage.done && !stage.active ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] text-center whitespace-nowrap ${
                  stage.active ? 'text-indigo-700 font-semibold' :
                  stage.done ? 'text-emerald-600' : 'text-slate-400'
                }`}>{stage.label}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full mb-3 ${stage.done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Provider info + contact */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-indigo-100 px-3 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="font-medium">{provider?.full_name || 'Your technician'}</span>
            {provider?.specialization?.length > 0 && (
              <span className="text-xs text-slate-400">· {provider.specialization[0]}</span>
            )}
          </div>
          {provider?.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center gap-1.5 text-indigo-600 font-semibold text-xs hover:text-indigo-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">
          ETA updates automatically every minute. Please ensure property access is ready.
        </p>
      </CardContent>
    </Card>
  );
}