import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BookingTimeline from '../components/booking/BookingTimeline';

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list('-scheduled_date'),
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allBookings']);
      toast.success('Booking updated');
    }
  });

  const handleStatusChange = (booking, newStatus) => {
    updateMutation.mutate({
      id: booking.id,
      data: { ...booking, status: newStatus }
    });
  };

  const handleProviderAssign = (booking, provider) => {
    updateMutation.mutate({
      id: booking.id,
      data: { ...booking, assigned_provider: provider }
    });
  };

  const getService = (serviceId) => services.find(s => s.id === serviceId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Manage Bookings</h1>
          <p className="text-slate-300">View and manage all service bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {bookings.map(booking => {
            const service = getService(booking.service_id);
            
            return (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {service?.name || 'Service'} - Booking #{booking.id.slice(0, 8)}
                      </CardTitle>
                      <div className="text-sm text-slate-600">
                        {booking.scheduled_date} at {booking.scheduled_time}
                      </div>
                    </div>
                    <Badge className={
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-5">
                    <BookingTimeline booking={booking} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-slate-600 mb-2">Amount</div>
                      <div className="text-lg font-bold">AED {booking.total_amount}</div>
                      <div className="text-xs text-slate-500">{booking.payment_status}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-slate-600 mb-2">Assign Provider</div>
                      <Select 
                        value={booking.assigned_provider_id || ''} 
                        onValueChange={(val) => {
                          const provider = providers.find(p => p.id === val);
                          updateMutation.mutate({
                            id: booking.id,
                            data: { 
                              ...booking, 
                              assigned_provider_id: val,
                              assigned_provider: provider?.full_name || ''
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.full_name} ({provider.average_rating.toFixed(1)}★)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600 mb-2">Update Status</div>
                      <Select value={booking.status} onValueChange={(val) => handleStatusChange(booking, val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {booking.customer_notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-700 mb-1">Customer Notes:</div>
                      <div className="text-sm text-slate-600">{booking.customer_notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}