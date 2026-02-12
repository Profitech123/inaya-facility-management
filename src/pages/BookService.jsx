import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Loader2, ArrowLeft, ArrowRight, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BookingStepIndicator from '../components/booking/BookingStepIndicator';
import BookingCalendar from '../components/booking/BookingCalendar';
import AddonSelector from '../components/booking/AddonSelector';
import TechnicianSelector from '../components/booking/TechnicianSelector';
import BookingReviewStep from '../components/booking/BookingReviewStep';
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

  const selectedAddons = allAddons.filter(a => selectedAddonIds.includes(a.id));
  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const grandTotal = (service?.price || 0) + addonsTotal;
  const selectedProperty = properties.find(p => p.id === bookingData.property_id);
  const selectedProvider = allProviders.find(p => p.id === selectedProviderId);

  // Step validation
  const isStep1Valid = bookingData.property_id && bookingData.scheduled_date && bookingData.scheduled_time;
  const isStep2Valid = true; // addons and technician are optional

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
          <div className="lg:col-span-2">
            {/* STEP 1: Schedule */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Your Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Property selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Property *</label>
                    {properties.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">No properties added yet.</p>
                        <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl('MyProperties'))}>
                          Add Property
                        </Button>
                      </div>
                    ) : (
                      <Select value={bookingData.property_id} onValueChange={(val) => setBookingData({...bookingData, property_id: val})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map(prop => (
                            <SelectItem key={prop.id} value={prop.id}>
                              {prop.address} ({prop.property_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Calendar + Time Slots */}
                  <BookingCalendar
                    selectedDate={bookingData.scheduled_date}
                    selectedTimeSlot={bookingData.scheduled_time}
                    onDateChange={(date) => setBookingData({...bookingData, scheduled_date: date, scheduled_time: ''})}
                    onTimeSlotChange={(timeSlot) => setBookingData({...bookingData, scheduled_time: timeSlot})}
                    bookedSlots={allBookings}
                  />

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid}
                      className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 2: Customize */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AddonSelector
                    serviceId={serviceId}
                    selectedIds={selectedAddonIds}
                    onChange={setSelectedAddonIds}
                  />

                  <TechnicianSelector
                    serviceId={serviceId}
                    selectedProviderId={selectedProviderId}
                    onChange={setSelectedProviderId}
                    selectedDate={bookingData.scheduled_date}
                    selectedTimeSlot={bookingData.scheduled_time}
                    allBookings={allBookings}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
                    <Textarea
                      value={bookingData.customer_notes}
                      onChange={(e) => setBookingData({...bookingData, customer_notes: e.target.value})}
                      placeholder="Any special instructions, access codes, or requirements..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                     <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                       <ArrowLeft className="w-4 h-4" /> Back
                     </Button>
                     <Button
                       onClick={() => setStep(3)}
                       className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                     >
                       Review Booking <ArrowRight className="w-4 h-4" />
                     </Button>
                   </div>
                  </CardContent>
                  </Card>
                  )}

                  {/* AI Recommendations after Step 1 property selection */}
                  {step === 1 && selectedProperty && (
                  <AIServiceRecommendation
                  user={user}
                  currentServiceId={serviceId}
                  selectedProperty={selectedProperty}
                  />
                  )}

            {/* STEP 3: Review & Confirm */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Review Your Booking</h2>
                <BookingReviewStep
                  service={service}
                  property={selectedProperty}
                  bookingData={bookingData}
                  selectedAddons={selectedAddons}
                  provider={selectedProvider}
                  grandTotal={grandTotal}
                  addonsTotal={addonsTotal}
                />

                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={isProcessingPayment}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-8"
                    size="lg"
                  >
                    {isProcessingPayment ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <>Confirm & Pay — AED {grandTotal}</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary (always visible) */}
          <div className="order-first lg:order-last">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service</span>
                  <span className="font-medium text-slate-900">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Base price</span>
                  <span className="text-slate-900">AED {service.price}</span>
                </div>

                {bookingData.scheduled_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="text-slate-900">{format(bookingData.scheduled_date, 'MMM d, yyyy')}</span>
                  </div>
                )}
                {bookingData.scheduled_time && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="text-slate-900">{bookingData.scheduled_time}</span>
                  </div>
                )}

                {selectedAddons.length > 0 && (
                  <>
                    <div className="border-t pt-2">
                      {selectedAddons.map(a => (
                        <div key={a.id} className="flex justify-between text-xs py-0.5">
                          <span className="text-slate-400">{a.name}</span>
                          <span className="text-slate-600">+AED {a.price}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedProvider && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Technician</span>
                    <span className="text-slate-900">{selectedProvider.full_name}</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-emerald-700">AED {grandTotal}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                  <Shield className="w-3.5 h-3.5" />
                  Secure payment · Free cancellation up to 4h before
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}