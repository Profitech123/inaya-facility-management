import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ProviderRecentHistory({ bookings, services, properties, reviews }) {
  const getService = (id) => services.find(s => s.id === id);
  const getProperty = (id) => properties.find(p => p.id === id);
  const getReview = (bookingId) => reviews.find(r => r.booking_id === bookingId);

  const completedBookings = bookings
    .filter(b => b.status === 'completed')
    .slice(0, 6);

  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    in_progress: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-slate-100 text-slate-700'
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Service History</CardTitle>
          <span className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">View All History</span>
        </div>
      </CardHeader>
      <CardContent>
        {completedBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No service history yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-[10px] font-bold text-slate-400 tracking-wider">DATE</th>
                  <th className="text-left py-2 text-[10px] font-bold text-slate-400 tracking-wider">SERVICE TYPE</th>
                  <th className="text-left py-2 text-[10px] font-bold text-slate-400 tracking-wider">CLIENT</th>
                  <th className="text-left py-2 text-[10px] font-bold text-slate-400 tracking-wider">STATUS</th>
                  <th className="text-left py-2 text-[10px] font-bold text-slate-400 tracking-wider">FEEDBACK</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((booking) => {
                  const service = getService(booking.service_id);
                  const property = getProperty(booking.property_id);
                  const review = getReview(booking.id);

                  return (
                    <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 text-slate-600">
                        {booking.scheduled_date ? format(new Date(booking.scheduled_date), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="py-3 font-medium text-slate-800">{service?.name || 'Service'}</td>
                      <td className="py-3 text-slate-600">{property?.area || property?.address?.slice(0, 20) || '—'}</td>
                      <td className="py-3">
                        <Badge className={statusColors[booking.status] || 'bg-slate-100 text-slate-600'}>
                          {booking.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-500 italic text-xs max-w-[160px] truncate">
                        {review?.comment ? `"${review.comment}"` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}