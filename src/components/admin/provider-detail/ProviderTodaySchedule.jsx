import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, PlayCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';

export default function ProviderTodaySchedule({ todayBookings, services }) {
  const today = new Date();
  const getService = (id) => services.find(s => s.id === id);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, label: 'DONE', color: 'text-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-700' };
      case 'in_progress':
        return { icon: PlayCircle, label: 'ACTIVE', color: 'text-blue-500', badgeClass: 'bg-blue-100 text-blue-700' };
      default:
        return { icon: Circle, label: 'PLANNED', color: 'text-slate-300', badgeClass: 'bg-slate-100 text-slate-500' };
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Schedule</CardTitle>
          <span className="text-xs text-emerald-600 font-medium">{format(today, 'MMM d, yyyy')}</span>
        </div>
      </CardHeader>
      <CardContent>
        {todayBookings.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">No jobs scheduled today</div>
        ) : (
          <div className="space-y-4">
            {todayBookings.map((booking) => {
              const service = getService(booking.service_id);
              const config = getStatusConfig(booking.status);
              const Icon = config.icon;

              return (
                <div key={booking.id} className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-emerald-600">{booking.scheduled_time || 'TBD'}</span>
                      <Badge className={`text-[10px] ${config.badgeClass}`}>{config.label}</Badge>
                    </div>
                    <div className="font-semibold text-sm text-slate-900 truncate">{service?.name || 'Service'}</div>
                    <div className="text-xs text-slate-400 truncate">Job #{booking.id?.slice(0, 8)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}