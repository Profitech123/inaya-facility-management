import React from 'react';
import { Star, Phone, Mail, Briefcase, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TechnicianCard({ provider }) {
  if (!provider) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">Technician Not Assigned Yet</p>
        <p className="text-xs text-slate-400 mt-1">A qualified technician will be assigned shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-4">
        {provider.profile_image ? (
          <img src={provider.profile_image} alt={provider.full_name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {provider.full_name?.charAt(0) || 'T'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-base">{provider.full_name}</h4>
          {provider.specialization?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {provider.specialization.slice(0, 3).map((spec, i) => (
                <Badge key={i} variant="outline" className="text-[10px] px-2 py-0">{spec}</Badge>
              ))}
            </div>
          )}
        </div>
        {provider.average_rating > 0 && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-sm text-amber-700">{provider.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        {provider.phone && (
          <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <Phone className="w-3.5 h-3.5" /> {provider.phone}
          </a>
        )}
        {provider.years_experience && (
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="w-3.5 h-3.5" /> {provider.years_experience} years exp.
          </div>
        )}
        {provider.total_jobs_completed > 0 && (
          <div className="flex items-center gap-2 text-slate-600">
            <Shield className="w-3.5 h-3.5" /> {provider.total_jobs_completed} jobs done
          </div>
        )}
      </div>
    </div>
  );
}