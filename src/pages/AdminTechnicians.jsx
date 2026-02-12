import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Briefcase, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';

function AdminTechniciansContent() {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Technicians</h1>
          <p className="text-slate-500">View and manage service providers</p>
        </div>

        {providers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-slate-400">
              No technicians found. Add providers from the admin panel.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Link key={provider.id} to={createPageUrl('AdminProviderDetail') + '?id=' + provider.id}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-emerald-300">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {provider.profile_image ? (
                          <img src={provider.profile_image} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          provider.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{provider.full_name}</h3>
                          <Badge className={provider.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                            {provider.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {(provider.average_rating || 0).toFixed(1)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {provider.total_jobs_completed || 0} jobs
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(provider.specialization || []).slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTechnicians() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminTechniciansContent />
    </AuthGuard>
  );
}