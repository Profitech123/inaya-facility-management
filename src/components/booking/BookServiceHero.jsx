import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function BookServiceHero({ service, category, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative grid md:grid-cols-2 gap-6 p-8 md:p-12">
        {/* Left: Text Content */}
        <div className="flex flex-col justify-center">
          {category && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4 w-fit text-xs">
              {category.name}
            </Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {service.name}
          </h1>
          {service.description && (
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              {service.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-emerald-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-sm font-semibold">{service.duration_minutes || 60} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Rated</div>
                <div className="text-sm font-semibold">4.8 / 5.0</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Guarantee</div>
                <div className="text-sm font-semibold">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Starting from</div>
              <div className="text-3xl font-bold text-white">
                AED <span className="text-emerald-400">{service.price}</span>
              </div>
            </div>
            <Button
              onClick={onStart}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 gap-2"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right: Service Image */}
        <div className="hidden md:flex items-center justify-center">
          {service.image_url ? (
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
            </div>
          ) : (
            <div className="w-full max-w-sm aspect-square rounded-2xl bg-slate-700/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-slate-400 text-sm">Professional Service</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features strip */}
      {service.features?.length > 0 && (
        <div className="border-t border-white/10 px-8 md:px-12 py-4 flex flex-wrap gap-3">
          {service.features.slice(0, 5).map((feat, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {feat}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}