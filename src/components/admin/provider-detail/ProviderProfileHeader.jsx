import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Star } from 'lucide-react';

export default function ProviderProfileHeader({ provider }) {
  const isActive = provider.is_active !== false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row items-start gap-5">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ring-4 ring-emerald-100">
          {provider.profile_image ? (
            <img src={provider.profile_image} alt={provider.full_name} className="w-full h-full rounded-full object-cover" />
          ) : (
            provider.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{provider.full_name}</h1>
            <Badge className={isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'}>
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-3">
            <span>Technician</span>
            <span>•</span>
            <span>ID: TEC-{provider.id?.slice(0, 4).toUpperCase()}</span>
            <span>|</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-slate-700">{(provider.average_rating || 0).toFixed(1)}</span>
              <span>/ 5.0</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(provider.specialization || []).map((spec, i) => (
              <Badge key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          {provider.phone && (
            <a href={`tel:${provider.phone}`}>
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" /> Call Mobile
              </Button>
            </a>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`}>
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <MessageSquare className="w-4 h-4" /> Send Message
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}