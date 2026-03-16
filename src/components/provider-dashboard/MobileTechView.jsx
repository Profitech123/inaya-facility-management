import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Briefcase, CheckCircle2, User, Camera } from 'lucide-react';
import MobileJobList from './mobile/MobileJobList';
import MobileJobDetail from './mobile/MobileJobDetail';
import MobileProfile from './mobile/MobileProfile';

const TABS = [
  { id: 'jobs',    label: 'Jobs',    Icon: Briefcase },
  { id: 'done',    label: 'Completed', Icon: CheckCircle2 },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function MobileTechView({ provider, bookings, services, properties, customers, onRefresh }) {
  const [tab, setTab] = useState('jobs');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const serviceMap  = Object.fromEntries(services.map(s  => [s.id, s]));
  const propertyMap = Object.fromEntries(properties.map(p => [p.id, p]));
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));

  const activeJobs = bookings.filter(b =>
    !['completed', 'cancelled'].includes(b.status)
  ).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  const doneJobs = bookings.filter(b => b.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || b.scheduled_date) - new Date(a.completed_at || a.scheduled_date));

  const handleStatusUpdate = async (booking, newStatus, extra = {}) => {
    const updateData = { status: newStatus, ...extra };
    if (newStatus === 'in_progress') updateData.started_at = new Date().toISOString();
    if (newStatus === 'completed')   updateData.completed_at = new Date().toISOString();
    await base44.entities.Booking.update(booking.id, updateData);
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    onRefresh();
    setSelectedBooking(prev => prev?.id === booking.id ? { ...prev, status: newStatus, ...extra } : prev);
  };

  const handlePhotoUpload = async (booking, files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }
    const newPhotos = [...(booking.completion_photos || []), ...uploadedUrls];
    await base44.entities.Booking.update(booking.id, { completion_photos: newPhotos });
    toast.success(`${files.length} photo(s) uploaded`);
    onRefresh();
    setSelectedBooking(prev => prev?.id === booking.id ? { ...prev, completion_photos: newPhotos } : prev);
    return newPhotos;
  };

  if (selectedBooking) {
    return (
      <MobileJobDetail
        booking={selectedBooking}
        service={serviceMap[selectedBooking.service_id]}
        property={propertyMap[selectedBooking.property_id]}
        customer={customerMap[selectedBooking.customer_id]}
        onBack={() => setSelectedBooking(null)}
        onStatusUpdate={handleStatusUpdate}
        onPhotoUpload={handlePhotoUpload}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0 safe-top">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
            {provider?.full_name?.charAt(0) || 'T'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">{provider?.full_name || 'Technician'}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{activeJobs.length} active job{activeJobs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
          alt="INAYA" className="h-6 opacity-70"
        />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {tab === 'jobs' && (
          <MobileJobList
            bookings={activeJobs}
            serviceMap={serviceMap}
            propertyMap={propertyMap}
            onSelect={setSelectedBooking}
            emptyMessage="No active jobs right now"
          />
        )}
        {tab === 'done' && (
          <MobileJobList
            bookings={doneJobs}
            serviceMap={serviceMap}
            propertyMap={propertyMap}
            onSelect={setSelectedBooking}
            emptyMessage="No completed jobs yet"
            dim
          />
        )}
        {tab === 'profile' && (
          <MobileProfile provider={provider} completedCount={doneJobs.length} activeCount={activeJobs.length} />
        )}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex safe-bottom z-50">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          const badge = id === 'jobs' ? activeJobs.length : id === 'done' ? doneJobs.length : 0;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {badge > 0 && (
                <span className="absolute top-2 right-[calc(50%-16px)] w-4 h-4 bg-emerald-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}