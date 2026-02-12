import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecentHistoryCard({ bookings, services }) {
  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';

  const completed = bookings.filter(b => b.status === 'completed').slice(0, 3);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4 text-emerald-500" />
          Recent History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {completed.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No completed services yet</div>
        ) : (
          <>
            {completed.map(booking => {
              const date = booking.completed_at || booking.scheduled_date;
              const formattedDate = date
                ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';
              return (
                <div key={booking.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-slate-400 uppercase font-semibold">{formattedDate}</div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{getServiceName(booking.service_id)}</div>
                  {booking.assigned_provider && (
                    <div className="text-xs text-slate-500">Technician: {booking.assigned_provider}</div>
                  )}
                </div>
              );
            })}
            <Link to={createPageUrl('MyBookings')}>
              <Button variant="outline" size="sm" className="w-full mt-1">Show More History</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}