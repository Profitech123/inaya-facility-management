import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
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
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAuthChecking(false);
      } catch (error) {
        if (error?.status === 401) {
          base44.auth.redirectToLogin(window.location.href);
        } else {
          setIsAuthChecking(false);
        }
      }
    };
    checkAuth();

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
      const services = await base44.entities.Service.list();
      return services.find(s => s.id === serviceId);
    },
    enabled: !!serviceId
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list();
      return allProps.filter(p => p.owner_id === user?.id);
    },
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const { data: allAddons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      const addons = await base44.entities.ServiceAddon.list();
      return addons.filter(a => a.is_active === true);
    },
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list(),
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const { data: allProviders = [] } = useQuery({
    queryKey: ['allProviders'],
    queryFn: async () => {
      const providers = await base44.entities.Provider.list();
      return providers.filter(p => p.is_active);
    },
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
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
        customer_id: user.id,
        property_id: bookingData.property_id,
        scheduled_date: format(bookingData.scheduled_date, 'yyyy-MM-dd'),
        scheduled_time: bookingData.scheduled_time,
        customer_notes: bookingData.customer_notes,
        total_amount: grandTotal,
        addon_ids: selectedAddonIds,
        addons_amount: addonsTotal,
        assigned_provider_id: selectedProviderId || undefined,
        assigned_provider: selectedProvider?.full_name || undefined,
        status: 'confirmed',
        payment_status: 'paid'
      });

      await base44.functions.invoke('sendBookingConfirmation', {
        booking_id: newBooking.id
      });

      setConfirmedBooking(newBooking);
      setIsProcessingPayment(false);
      setStep('success');
    } catch (error) {
      console.error('Booking error:', error);
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