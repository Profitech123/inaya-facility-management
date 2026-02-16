import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/supabase/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingTimeline from '../components/booking/BookingTimeline';
import AdminBookingCalendar from '../components/admin/AdminBookingCalendar';
import { logAuditEvent } from '../components/admin/AuditLogger';
import { AuthGuard } from '../components/AuthGuard';

function AdminBookingsContent() {
  const queryClient = useQueryClient();
  const { user, me } = useAuth();
  const currentUser = me();
  const [refundingId, setRefundingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => api.bookings.listAll(),
    initialData: [],
    staleTime: 30000
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.services.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => api.providers.list(),
    initialData: [],
    staleTime: 60000
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.bookings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allBookings']);
      toast.success('Booking updated');
    }
  });

  const handleStatusChange = (booking, newStatus) => {
    updateMutation.mutate({
      id: booking.id,
      data: { ...booking, status: newStatus }
    }, {
      onSuccess: () => {
        logAuditEvent({
          action: 'booking_status_changed',
          entity_type: 'Booking',
          entity_id: booking.id,
          details: `Booking #${booking.id.slice(0, 8)} status changed`,
          old_value: booking.status,
          new_value: newStatus
        });
      }
    });
  };

  const handleRefund = async (booking) => {
    if (!confirm(`Are you sure you want to refund AED ${booking.total_amount} for booking #${booking.id.slice(0, 8)}?`)) return;
    setRefundingId(booking.id);
    const response = await base44.functions.invoke('refundBooking', { booking_id: booking.id });
    if (response.data?.success) {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries(['allBookings']);
      logAuditEvent({
        action: 'booking_refunded',
        entity_type: 'Booking',
        entity_id: booking.id,
        details: `Booking #${booking.id.slice(0, 8)} refunded AED ${booking.total_amount}`,
        old_value: booking.payment_status,
        new_value: 'refunded'
      });
    } else {
      toast.error(response.data?.error || 'Refund failed');
    }
    setRefundingId(null);
  };

  const getService = (serviceId) => services.find(s => s.id === serviceId);

  const filteredBookings = selectedDate 
    ? bookings.filter(b => b.scheduled_date === selectedDate.toISOString().split('T')[0])
    : bookings;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Manage Bookings</h1>
          <p className="text-slate-500">View and manage all service bookings</p>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="mb-6">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <AdminBookingCalendar 
              bookings={bookings} 
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
          {filteredBookings.map(booking => {
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
                    <div className="flex items-center gap-2">
                      <Badge className={
                        booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        booking.payment_status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {booking.payment_status}
                      </Badge>
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
                          }, {
                            onSuccess: () => {
                              logAuditEvent({
                                action: 'provider_assigned',
                                entity_type: 'Booking',
                                entity_id: booking.id,
                                details: `Provider "${provider?.full_name}" assigned to booking #${booking.id.slice(0, 8)}`,
                                old_value: booking.assigned_provider || '',
                                new_value: provider?.full_name || ''
                              });
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
                              {provider.full_name} ({(provider.average_rating || 0).toFixed(1)}★)
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

                  {booking.payment_status === 'paid' && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRefund(booking)}
                        disabled={refundingId === booking.id}
                      >
                        {refundingId === booking.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Processing Refund...</>
                        ) : 'Issue Refund'}
                      </Button>
                    </div>
                  )}

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
          </TabsContent>
          </Tabs>

          {selectedDate && viewMode === 'calendar' && (
          <div className="mt-6">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold text-slate-900">
               Bookings for {selectedDate.toLocaleDateString()}
             </h2>
             <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
               Clear Filter
             </Button>
           </div>
           <div className="space-y-4">
             {filteredBookings.length === 0 ? (
               <Card>
                 <CardContent className="py-8 text-center text-slate-500">
                   No bookings for this date
                 </CardContent>
               </Card>
             ) : (
               filteredBookings.map(booking => {
                 const service = getService(booking.service_id);
                 return (
                   <Card key={booking.id}>
                     <CardHeader>
                       <div className="flex items-start justify-between">
                         <div>
                           <CardTitle className="text-lg mb-1">
                             {service?.name || 'Service'} - {booking.scheduled_time}
                           </CardTitle>
                           <div className="text-sm text-slate-600">Booking #{booking.id.slice(0, 8)}</div>
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
                   </Card>
                 );
               })
             )}
           </div>
          </div>
          )}
          </div>
          </div>
          );
          }

export default function AdminBookings() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminBookingsContent />
    </AuthGuard>
  );
}
