import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowLeft, Briefcase, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TechnicianReviewsList from '../components/reviews/TechnicianReviewsList';

export default function TechnicianProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('id');

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider-detail', providerId],
    queryFn: async () => {
      const all = await base44.entities.Provider.list();
      return all.find(p => p.id === providerId);
    },
    enabled: !!providerId
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Technician not found</p>
          <Link to={createPageUrl('OnDemandServices')}>
            <Button variant="outline">Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const assignedServices = services.filter(s => provider.assigned_service_ids?.includes(s.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-10">
        <div className="max-w-3xl mx-auto px-6">
          <Link to={createPageUrl('OnDemandServices')} className="inline-flex items-center gap-1 text-slate-300 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {provider.profile_image ? (
                <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-emerald-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{provider.full_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {provider.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{provider.average_rating.toFixed(1)}</span>
                  </div>
                )}
                <span className="flex items-center gap-1 text-slate-300 text-sm">
                  <Briefcase className="w-3.5 h-3.5" /> {provider.total_jobs_completed || 0} jobs completed
                </span>
              </div>
              {provider.specialization?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {provider.specialization.map(s => (
                    <Badge key={s} className="bg-white/10 text-white/90 text-xs border-white/20">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {assignedServices.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Qualified Services</h3>
              <div className="flex flex-wrap gap-2">
                {assignedServices.map(s => (
                  <Badge key={s.id} variant="outline" className="text-sm py-1 px-3">{s.name}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-semibold text-slate-900">Customer Reviews</h2>
        <TechnicianReviewsList providerId={providerId} />
      </div>
    </div>
  );
}