import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Calendar, Clock, MapPin, Home, User, FileText,
  Wrench, Image, CalendarCheck, XCircle, RefreshCw, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO } from 'date-fns';
import AuthGuard from '../components/AuthGuard';
import BookingStatusTracker from '../components/bookings/BookingStatusTracker';
import TechnicianCard from '../components/bookings/TechnicianCard';
import CancelBookingDialog from '../components/bookings/CancelBookingDialog';
import RescheduleDialog from '../components/bookings/RescheduleDialog';
import { getCancellationDetails, getRescheduleDetails } from '../components/bookings/CancellationPolicyHelper';
import { toast } from 'sonner';

function BookingDetailContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      return bookings[0] || null;
    },
    enabled: !!bookingId,
  });

  const { data: service } = useQuery({
    queryKey: ['service', booking?.service_id],
    queryFn: async () => {
      const services = await base44.entities.Service.filter({ id: booking.service_id });
      return services[0] || null;
    },
    enabled: !!booking?.service_id,
  });

  const { data: property } = useQuery({
    queryKey: ['property', booking?.property_id],
    queryFn: async () => {
      const props = await base44.entities.Property.filter({ id: booking.property_id });
      return props[0] || null;
    },
    enabled: !!booking?.property_id,
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', booking?.assigned_provider_id],
    queryFn: async () => {
      const providers = await base44.entities.Provider.filter({ id: booking.assigned_provider_id });
      return providers[0] || null;
    },
    enabled: !!booking?.assigned_provider_id,
  });

  const { data: addons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: () => base44.entities.ServiceAddon.list(),
    initialData: [],
  });

  // Real-time subscription
  useEffect(() => {
    if (!bookingId) return;
    const unsub = base44.entities.Booking.subscribe((event) => {
      if (event.id === bookingId) {
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      }
    });
    return unsub;
  }, [bookingId, queryClient]);

  const cancelMutation = useMutation({
    mutationFn: async ({ reason, feeAmount }) => {
      await base44.entities.Booking.update(bookingId, {
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        cancellation_fee: feeAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['allMyBookings'] });
      setShowCancel(false);
      toast.success('Booking cancelled successfully');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ newDate, newTime }) => {
      await base44.entities.Booking.update(bookingId, {
        rescheduled_from_date: booking.scheduled_date,
        rescheduled_from_time: booking.scheduled_time,
        scheduled_date: newDate,
        scheduled_time: newTime,
        reschedule_count: (booking.reschedule_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['allMyBookings'] });
      setShowReschedule(false);
      toast.success('Booking rescheduled successfully');
    },
  });

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cancellation = getCancellationDetails(booking);
  const rescheduleInfo = getRescheduleDetails(booking);
  const isActive = ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(booking.status);
  const selectedAddons = addons.filter(a => booking.addon_ids?.includes(a.id));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <Link to={createPageUrl('MyBookings')} className="inline-flex items-center text-slate-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Bookings
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{service?.name || 'Booking Details'}</h1>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{booking.scheduled_date ? format(booking.scheduled_date.includes('T') ? parseISO(booking.scheduled_date) : new Date(booking.scheduled_date + 'T00:00:00'), 'MMMM d, yyyy') : '—'}</span>
                {booking.scheduled_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.scheduled_time}</span>}
              </div>
            </div>
            {isActive && (
              <div className="flex gap-2">
                {rescheduleInfo.allowed && (
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2" onClick={() => setShowReschedule(true)}>
                    <CalendarCheck className="w-4 h-4" /> Reschedule
                  </Button>
                )}
                {cancellation.allowed && (
                  <Button variant="outline" className="border-red-400/30 text-red-300 hover:bg-red-500/10 gap-2" onClick={() => setShowCancel(true)}>
                    <XCircle className="w-4 h-4" /> Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column — Status + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time status tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  Live Status
                  {isActive && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BookingStatusTracker booking={booking} />
              </CardContent>
            </Card>

            {/* Reschedule notice */}
            {booking.rescheduled_from_date && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <CalendarCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700">Rescheduled from {booking.rescheduled_from_date ? format(booking.rescheduled_from_date.includes('T') ? parseISO(booking.rescheduled_from_date) : new Date(booking.rescheduled_from_date + 'T00:00:00'), 'MMMM d, yyyy') : booking.rescheduled_from_date} {booking.rescheduled_from_time && `(${booking.rescheduled_from_time})`}</p>
                  <p className="text-blue-500 text-xs">Rescheduled {booking.reschedule_count} time(s)</p>
                </div>
              </div>
            )}

            {/* Technician */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Assigned Technician
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TechnicianCard provider={provider} />
              </CardContent>
            </Card>

            {/* Completion photos */}
            {booking.completion_photos?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="w-4 h-4 text-slate-400" />
                    Completion Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {booking.completion_photos.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt={`Completion ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Provider notes */}
            {booking.provider_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Technician Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
                    {booking.provider_notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column — Summary */}
          <div className="space-y-6">
            {/* Service & Property */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{service?.name}</p>
                    {service?.duration_minutes && <p className="text-xs text-slate-400">~{service.duration_minutes} minutes</p>}
                  </div>
                </div>

                {/* Property */}
                {property && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{property.address}</p>
                      <p className="text-xs text-slate-400 capitalize">{property.property_type}{property.bedrooms ? ` · ${property.bedrooms} BR` : ''}</p>
                    </div>
                  </div>
                )}

                {/* Schedule */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{booking.scheduled_date ? format(booking.scheduled_date.includes('T') ? parseISO(booking.scheduled_date) : new Date(booking.scheduled_date + 'T00:00:00'), 'MMMM d, yyyy') : '—'}</p>
                    {booking.scheduled_time && <p className="text-xs text-slate-400">{booking.scheduled_time}</p>}
                  </div>
                </div>

                {/* Customer notes */}
                {booking.customer_notes && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100">
                    <p className="text-xs font-medium text-slate-400 mb-1">Your Notes</p>
                    {booking.customer_notes}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service</span>
                    <span className="font-medium text-slate-700">AED {(booking.total_amount - (booking.addons_amount || 0)).toFixed(0)}</span>
                  </div>
                  {selectedAddons.length > 0 && selectedAddons.map(addon => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-slate-500">{addon.name}</span>
                      <span className="font-medium text-slate-700">AED {addon.price}</span>
                    </div>
                  ))}
                  {booking.cancellation_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-500">Cancellation fee</span>
                      <span className="font-medium text-red-600">AED {booking.cancellation_fee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">AED {booking.total_amount}</span>
                  </div>
                  <Badge variant="outline" className="w-full justify-center py-1 mt-1">
                    {booking.payment_status === 'paid' ? '✓ Paid' : booking.payment_status === 'refunded' ? '↩ Refunded' : 'Payment Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions for active bookings */}
            {isActive && (
              <Card>
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</p>
                  {rescheduleInfo.allowed && (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => setShowReschedule(true)}>
                      <CalendarCheck className="w-4 h-4" /> Reschedule Booking
                    </Button>
                  )}
                  {cancellation.allowed && (
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2" onClick={() => setShowCancel(true)}>
                      <XCircle className="w-4 h-4" /> Cancel Booking
                    </Button>
                  )}
                  <Link to={createPageUrl('Support')} className="block">
                    <Button variant="ghost" className="w-full text-slate-600 gap-2">
                      Need Help? <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Booking created */}
            <div className="text-center text-xs text-slate-400">
              Booking ID: {bookingId?.slice(0, 8)}
              {booking.created_date && <span> · Created {format(new Date(booking.created_date), 'MMM d, yyyy')}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showCancel && (
        <CancelBookingDialog
          open={showCancel}
          onOpenChange={setShowCancel}
          booking={booking}
          onConfirm={cancelMutation.mutate}
          isLoading={cancelMutation.isPending}
        />
      )}
      {showReschedule && (
        <RescheduleDialog
          open={showReschedule}
          onOpenChange={setShowReschedule}
          booking={booking}
          onConfirm={rescheduleMutation.mutate}
          isLoading={rescheduleMutation.isPending}
        />
      )}
    </div>
  );
}

export default function BookingDetail() {
  return (
    <AuthGuard requiredRole="customer">
      <BookingDetailContent />
    </AuthGuard>
  );
}