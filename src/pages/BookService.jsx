import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

import BookServiceHero from '../components/booking/BookServiceHero';
import BookingStepNav from '../components/booking/BookingStepNav';
import PropertyStep from '../components/booking/PropertyStep';
import ScheduleStep from '../components/booking/ScheduleStep';
import CustomizeStep from '../components/booking/CustomizeStep';
import BookingReviewConfirmStep from '../components/booking/BookingReviewConfirmStep';
import BookingConfirmation from '../components/booking/BookingConfirmation';

export default function BookService() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('service');
  const paymentStatus = urlParams.get('payment');
  const paymentBookingId = urlParams.get('booking_id');

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0); // 0=hero, 1=property, 2=schedule, 3=customize, 4=review, 5=confirmation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const queryClient = useQueryClient();

  const [bookingData, setBookingData] = useState({
    service_id: serviceId || '',
    property_id: '',
    scheduled_date: null,
    scheduled_time: '',
    addon_ids: [],
    assigned_provider_id: '',
    customer_notes: '',
  });

  // Auth check
  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) {
        setAuthChecked(true);
        return;
      }
      base44.auth.me().then(u => {
        setUser(u);
        setAuthChecked(true);
      }).catch(() => setAuthChecked(true));
    }).catch(() => setAuthChecked(true));
  }, []);

  // Fetch service
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['bookService', serviceId],
    queryFn: async () => {
      const services = await base44.entities.Service.list();
      return services.find(s => s.id === serviceId) || null;
    },
    enabled: !!serviceId,
  });

  // Fetch category
  const { data: category } = useQuery({
    queryKey: ['bookServiceCat', service?.category_id],
    queryFn: async () => {
      const cats = await base44.entities.ServiceCategory.list();
      return cats.find(c => c.id === service.category_id);
    },
    enabled: !!service?.category_id,
  });

  // Properties
  const { data: properties = [], refetch: refetchProperties } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: async () => {
      return base44.entities.Property.filter({ owner_id: user.id });
    },
    enabled: !!user?.id,
    initialData: [],
  });

  // Bookings for availability
  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookingsForSlots'],
    queryFn: () => base44.entities.Booking.list('-scheduled_date', 200),
    initialData: [],
  });

  // Addons for price calculation
  const { data: allAddons = [] } = useQuery({
    queryKey: ['allAddons'],
    queryFn: () => base44.entities.ServiceAddon.list(),
    initialData: [],
  });

  // Providers
  const { data: allProviders = [] } = useQuery({
    queryKey: ['allProviders'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
  });

  // Computed values
  const selectedAddons = useMemo(() =>
    allAddons.filter(a => (bookingData.addon_ids || []).includes(a.id)),
    [allAddons, bookingData.addon_ids]
  );

  const addonsTotal = useMemo(() =>
    selectedAddons.reduce((s, a) => s + (a.price || 0), 0),
    [selectedAddons]
  );

  const grandTotal = (service?.price || 0) + addonsTotal;

  const selectedProperty = properties.find(p => p.id === bookingData.property_id) || null;
  const selectedProvider = allProviders.find(p => p.id === bookingData.assigned_provider_id) || null;

  // Handle payment return
  useEffect(() => {
    if (paymentStatus === 'success' && paymentBookingId) {
      base44.entities.Booking.filter({ id: paymentBookingId }).then(bookings => {
        if (bookings.length > 0) {
          setConfirmedBooking(bookings[0]);
          setStep(5);
        }
      }).catch(() => {});
    }
  }, [paymentStatus, paymentBookingId]);

  // Handle confirm & pay
  const handleConfirmBooking = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setIsProcessingPayment(true);

    // Create booking
    const booking = await base44.entities.Booking.create({
      service_id: serviceId,
      property_id: bookingData.property_id,
      customer_id: user.id,
      scheduled_date: bookingData.scheduled_date,
      scheduled_time: bookingData.scheduled_time,
      status: 'pending',
      total_amount: grandTotal,
      payment_status: 'pending',
      assigned_provider_id: bookingData.assigned_provider_id || undefined,
      customer_notes: bookingData.customer_notes || undefined,
      addon_ids: bookingData.addon_ids?.length > 0 ? bookingData.addon_ids : undefined,
      addons_amount: addonsTotal > 0 ? addonsTotal : 0,
    });

    // Check if running in iframe
    const isIframe = window.self !== window.top;
    if (isIframe) {
      alert('Payment checkout works only from the published app. Please open the app directly.');
      setIsProcessingPayment(false);
      setConfirmedBooking(booking);
      setStep(5);
      return;
    }

    // Stripe checkout
    const response = await base44.functions.invoke('createCheckoutSession', {
      booking_id: booking.id,
      service_name: service.name,
      total_amount: grandTotal,
      success_url: `${window.location.origin}${createPageUrl('BookService')}?payment=success&booking_id=${booking.id}`,
      cancel_url: `${window.location.origin}${createPageUrl('BookService')}?payment=cancelled&booking_id=${booking.id}&service=${serviceId}`,
    });

    if (response.data?.checkout_url) {
      window.location.href = response.data.checkout_url;
    } else {
      // Fallback: show confirmation without payment
      setIsProcessingPayment(false);
      setConfirmedBooking(booking);
      setStep(5);
    }
  };

  const handleStartBooking = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    setStep(1);
  };

  // Loading states
  if (!authChecked || serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Service Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">The service you're looking for doesn't exist or is no longer available.</p>
          <Link to={createPageUrl('OnDemandServices')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Confirmation screen
  if (step === 5 && confirmedBooking) {
    return (
      <BookingConfirmation
        booking={confirmedBooking}
        service={service}
        property={selectedProperty}
        provider={selectedProvider}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Back link */}
        <Link
          to={createPageUrl('OnDemandServices')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Services
        </Link>

        {/* Hero (step 0) */}
        {step === 0 && (
          <BookServiceHero
            service={service}
            category={category}
            onStart={handleStartBooking}
          />
        )}

        {/* Booking steps (1-4) */}
        {step >= 1 && step <= 4 && (
          <>
            <BookingStepNav currentStep={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {step === 1 && (
                  <PropertyStep
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    properties={properties}
                    userId={user?.id}
                    onPropertiesRefetch={refetchProperties}
                    onBack={() => setStep(0)}
                    onNext={() => setStep(2)}
                  />
                )}

                {step === 2 && (
                  <ScheduleStep
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    allBookings={allBookings}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                  />
                )}

                {step === 3 && (
                  <CustomizeStep
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    serviceId={serviceId}
                    allBookings={allBookings}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                  />
                )}

                {step === 4 && (
                  <BookingReviewConfirmStep
                    service={service}
                    selectedProperty={selectedProperty}
                    bookingData={bookingData}
                    selectedAddons={selectedAddons}
                    selectedProvider={selectedProvider}
                    grandTotal={grandTotal}
                    addonsTotal={addonsTotal}
                    isProcessingPayment={isProcessingPayment}
                    onBack={() => setStep(3)}
                    onConfirm={handleConfirmBooking}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pb-6">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Payment
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Licensed Technicians
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Satisfaction Guarantee
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}