import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/supabase/api';
import { useQuery, useMutation } from '@tantml:function_calls>
<invoke name="card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { XCircle, Loader2, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import BookingStepIndicator from '../components/booking/BookingStepIndicator';
import BookingScheduleStep from '../components/booking/BookingScheduleStep';
import BookingCustomizeStep from '../components/booking/BookingCustomizeStep';
import BookingReviewConfirmStep from '../components/booking/BookingReviewConfirmStep';
import BookingSummarySidebar from '../components/booking/BookingSummarySidebar';
import AIServiceRecommendation from '../components/booking/AIServiceRecommendation';
import BookingConfirmation from '../components/booking/BookingConfirmation';

export default function BookService() {
  const navigate = useNavigate();
  const { user, me, redirectToLogin } = useAuth();
  const currentUser = me();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(null);
  const [bookingData, setBookingData] = useState({
    property_id: '',
    scheduled_date: null,
    scheduled_time: '',
    customer_notes: ''
  });
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      redirectToLogin(window.location.href);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setServiceId(params.get('service'));

    const paymentStatus = params.get('payment');
    const bookingId = params.get('booking_id');
    if (paymentStatus === 'success' && bookingId) {
      setStep('success');
    } else if (paymentStatus === 'cancelled' && bookingId) {
      setStep('cancelled');
    }
  }, []);

  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      return await api.services.get(serviceId);
    },
    enabled: !!serviceId
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', currentUser?.id],
    queryFn: async () => {
      return await api.properties.list(currentUser?.id);
    },
    enabled: !!currentUser?.id,
    initialData: []
  });

  const { data: allAddons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      // Addons would need to be stored in services table or a separate table
      // For now, return empty array
      return [];
    },
    enabled: !!currentUser?.id,
    initialData: []
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => api.bookings.listAll(),
    enabled: !!currentUser?.id,
    initialData: []
  });

  const { data: allProviders = [] } = useQuery({
    queryKey: ['allProviders'],
    queryFn: async () => {
      return await api.providers.list({ active: true });
    },
    enabled: !!currentUser?.id,
    initialData: []
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => api.bookings.create(data),
  });

  // Derived values
  const selectedAddons = allAddons.filter(a => selectedAddonIds.includes(a.id));
  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const grandTotal = (service?.price || 0) + addonsTotal;
  const selectedProperty = properties.find(p => p.id === bookingData.property_id);
  const selectedProvider = allProviders.find(p => p.id === selectedProviderId);

  const handleBooking = async () => {
    setIsProcessingPayment(true);
    try {
      const newBooking = await createBookingMutation.mutateAsync({
        service_id: serviceId,
        customer_id: currentUser.id,
        property_id: bookingData.property_id,
        scheduled_date: format(bookingData.scheduled_date, 'yyyy-MM-dd'),
        scheduled_time: bookingData.scheduled_time,
        notes: bookingData.customer_notes,
        total_price: grandTotal,
        status: 'confirmed',
        payment_status: 'paid',
        technician_id: selectedProviderId || null
      });

      // TODO: Implement email notification via Supabase Edge Function
      // await supabase.functions.invoke('send-booking-confirmation', {
      //   body: { booking_id: newBooking.id }
      // });

      setConfirmedBooking(newBooking);
      setIsProcessingPayment(false);
      setStep('success');
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
      setIsProcessingPayment(false);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  // Loading / auth states
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading service details...
      </div>
    );
  }

  // Success
  if (step === 'success') {
    return (
      <BookingConfirmation
        booking={confirmedBooking}
        service={service}
        property={selectedProperty}
        provider={selectedProvider}
      />
    );
  }

  // Cancelled
  if (step === 'cancelled') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h2>
            <p className="text-slate-600 mb-6">
              Your payment was not completed. The booking has not been confirmed.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate(createPageUrl('OnDemandServices'))} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Browse Services
              </Button>
              <Button onClick={() => navigate(createPageUrl('Dashboard'))} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold mb-1">Book {service.name}</h1>
          <div className="flex items-center gap-4 text-slate-300 text-sm">
            <span>Starting from AED {service.price}</span>
            {service.duration_minutes && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{service.duration_minutes} min</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <BookingStepIndicator currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <>
                <BookingScheduleStep
                  bookingData={bookingData}
                  setBookingData={setBookingData}
                  properties={properties}
                  allBookings={allBookings}
                  onNext={() => setStep(2)}
                />
                {selectedProperty && (
                  <AIServiceRecommendation
                    user={user}
                    currentServiceId={serviceId}
                    selectedProperty={selectedProperty}
                  />
                )}
              </>
            )}

            {step === 2 && (
              <BookingCustomizeStep
                serviceId={serviceId}
                bookingData={bookingData}
                setBookingData={setBookingData}
                selectedAddonIds={selectedAddonIds}
                setSelectedAddonIds={setSelectedAddonIds}
                selectedProviderId={selectedProviderId}
                setSelectedProviderId={setSelectedProviderId}
                allBookings={allBookings}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <BookingReviewConfirmStep
                service={service}
                selectedProperty={selectedProperty}
                bookingData={bookingData}
                selectedAddons={selectedAddons}
                selectedProvider={selectedProvider}
                grandTotal={grandTotal}
                addonsTotal={addonsTotal}
                isProcessingPayment={isProcessingPayment}
                onBack={() => setStep(2)}
                onConfirm={handleBooking}
              />
            )}
          </div>

          {/* Persistent Summary Sidebar */}
          <div className="order-first lg:order-last">
            <BookingSummarySidebar
              service={service}
              bookingData={bookingData}
              selectedProperty={selectedProperty}
              selectedAddons={selectedAddons}
              selectedProvider={selectedProvider}
              grandTotal={grandTotal}
              currentStep={step}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
