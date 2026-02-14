import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Wrench, Droplets, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const serviceIcons = {
  'ac': Zap,
  'clean': Droplets,
  'tank': Droplets,
  'plumb': Wrench,
  'electric': Zap,
};

function getIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, Icon] of Object.entries(serviceIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return Wrench;
}

export default function UpcomingServicesCard({ bookings, services }) {
  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';

  const upcoming = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').slice(0, 3);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Upcoming Services
          </CardTitle>
          <Link to={createPageUrl('MyBookings')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View Calendar
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">No upcoming services</p>
            <p className="text-xs text-slate-400 mb-4 max-w-[200px]">Schedule your next maintenance visit to keep your home in top shape.</p>
            <Link to={createPageUrl('OnDemandServices')}>
              <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Book a Service →
              </button>
            </Link>
          </div>
        ) : (
          upcoming.map(booking => {
            const name = getServiceName(booking.service_id);
            const Icon = getIcon(name);
            const date = booking.scheduled_date
              ? new Date(booking.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            return (
              <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm">{name}</div>
                  <div className="text-xs text-slate-400">{date}{booking.scheduled_time ? ` • ${booking.scheduled_time}` : ''}</div>
                </div>
                <Badge variant="outline" className="text-xs capitalize bg-white">
                  {booking.status?.replace('_', ' ')}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}