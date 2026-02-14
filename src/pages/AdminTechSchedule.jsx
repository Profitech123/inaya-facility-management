import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuthGuard from '../components/AuthGuard';
import TechnicianScheduleCalendar from '../components/admin/TechnicianScheduleCalendar';
import { Loader2 } from 'lucide-react';

function AdminTechScheduleContent() {
  const { data: providers = [], isLoading: lp } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const all = await base44.entities.Provider.list();
      return all.filter(p => p.is_active);
    },
    initialData: [],
    staleTime: 30000
  });

  const { data: bookings = [], isLoading: lb } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list('-scheduled_date'),
    initialData: [],
    staleTime: 30000
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: blockouts = [] } = useQuery({
    queryKey: ['all-blockouts'],
    queryFn: () => base44.entities.TechBlockout.list(),
    initialData: [],
    staleTime: 30000
  });

  if (lp || lb) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Technician Schedules</h1>
          <p className="text-slate-500">Weekly view of all technician assignments and availability</p>
        </div>

        <TechnicianScheduleCalendar
          providers={providers}
          bookings={bookings}
          services={services}
          blockouts={blockouts}
        />
      </div>
    </div>
  );
}

export default function AdminTechSchedule() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminTechScheduleContent />
    </AuthGuard>
  );
}