import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AddonSelector from '../components/booking/AddonSelector';
import TimeSlotSelector from '../components/booking/TimeSlotSelector';

export default function BookService() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        // Ensure customers don't get redirected to admin
        if (currentUser.role === 'admin') {
          setUser(currentUser);
          setIsAuthChecking(false);
          return;
        }
        setUser(currentUser);
        setIsAuthChecking(false);
      } catch (error) {
        if (error?.status === 401) {
          // Redirect back to this exact booking page after login
          base44.auth.redirectToLogin(window.location.href);
        } else {
          setIsAuthChecking(false);
        }
      }
    };

    checkAuth();
    
    const params = new URLSearchParams(window.location.search);
    setServiceId(params.get('service'));

    // Handle return from Stripe checkout
    const paymentStatus = params.get('payment');
    const bookingId = params.get('booking_id');
    if (paymentStatus === 'success' && bookingId) {
      setStep(3);
    } else if (paymentStatus === 'cancelled' && bookingId) {
      setStep(4); // cancelled step
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
      try {
        const allProps = await base44.entities.Property.list();
        return allProps.filter(p => p.owner_id === user?.id);
      } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const { data: allAddons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      try {
        const addons = await base44.entities.ServiceAddon.list();
        return addons.filter(a => a.is_active === true);
      } catch (error) {
        console.error('Error fetching addons:', error);
        return [];
      }
    },
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: async () => {
      try {
        return await base44.entities.Booking.list();
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
    },
    enabled: !!user?.id && !isAuthChecking,
    initialData: []
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
  });

  const addonsTotal = allAddons
    .filter(a => selectedAddonIds.includes(a.id))
    .reduce((s, a) => s + a.price, 0);
  const grandTotal = (service?.price || 0) + addonsTotal;

  const handleBooking = async () => {
    if (!bookingData.property_id || !bookingData.scheduled_date || !bookingData.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Create booking with dummy payment (testing mode)
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
        status: 'confirmed',
        payment_status: 'paid'
      });

      // Send confirmation email
      await base44.functions.invoke('sendBookingConfirmation', { 
        booking_id: newBooking.id 
      });

      setIsProcessingPayment(false);
      setStep(3);
    } catch (error) {
      console.error('Booking error:', error);
      setIsProcessingPayment(false);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user || !service) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-600 mb-6">
              Your booking has been confirmed and payment processed. We'll send you a confirmation email shortly.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate(createPageUrl('MyBookings'))} className="w-full bg-emerald-600 hover:bg-emerald-700">
                View My Bookings
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

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h2>
            <p className="text-slate-600 mb-6">
              Your payment was not completed. The booking has not been confirmed. You can try again or return to services.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate(createPageUrl('Services'))} className="w-full bg-emerald-600 hover:bg-emerald-700">
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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Book Service</h1>
          <p className="text-slate-300">{service.name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Property</label>
                  {properties.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">No properties added yet.</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => navigate(createPageUrl('MyProperties'))}
                      >
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

                <TimeSlotSelector
                  selectedDate={bookingData.scheduled_date}
                  selectedTimeSlot={bookingData.scheduled_time}
                  onDateChange={(date) => setBookingData({...bookingData, scheduled_date: date, scheduled_time: ''})}
                  onTimeSlotChange={(timeSlot) => setBookingData({...bookingData, scheduled_time: timeSlot})}
                  bookedSlots={allBookings}
                />

                <AddonSelector
                  serviceId={serviceId}
                  selectedIds={selectedAddonIds}
                  onChange={setSelectedAddonIds}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                  <Textarea
                    value={bookingData.customer_notes}
                    onChange={(e) => setBookingData({...bookingData, customer_notes: e.target.value})}
                    placeholder="Any special instructions or requirements"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Service</div>
                  <div className="font-medium text-slate-900">{service.name}</div>
                </div>
                
                {bookingData.scheduled_date && (
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Date & Time</div>
                    <div className="font-medium text-slate-900">
                      {format(bookingData.scheduled_date, 'PPP')}
                      {bookingData.scheduled_time && ` at ${bookingData.scheduled_time}`}
                    </div>
                  </div>
                )}

                {addonsTotal > 0 && (
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Add-ons</div>
                    <div className="font-medium text-slate-900">AED {addonsTotal}</div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>AED {grandTotal}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBooking} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!bookingData.property_id || !bookingData.scheduled_date || !bookingData.scheduled_time || isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Confirming Booking...</>
                  ) : 'Confirm & Pay (Test Mode)'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}