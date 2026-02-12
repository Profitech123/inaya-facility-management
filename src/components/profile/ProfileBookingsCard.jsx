import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfileBookingsCard({ userId }) {
  const { data: bookings = [] } = useQuery({
    queryKey: ['profileBookings', userId],
    queryFn: () => base44.entities.Booking.filter({ customer_id: userId }, '-scheduled_date', 5),
    enabled: !!userId,
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';

  const statusColor = (status) => {
    const map = {
      completed: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return map[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Link to={createPageUrl('MyBookings')}>
            <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{getServiceName(b.service_id)}</div>
                  <div className="text-xs text-slate-500">{b.scheduled_date} · {b.scheduled_time || ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">AED {b.total_amount}</span>
                  <Badge className={statusColor(b.status)}>{b.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}