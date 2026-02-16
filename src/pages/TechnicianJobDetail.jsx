import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Calendar, Clock, Navigation, CheckCircle, PlayCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function TechnicianJobDetail() {
    const [bookingId, setBookingId] = useState(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setBookingId(params.get('id'));
    }, []);

    const { data: booking, isLoading } = useQuery({
        queryKey: ['booking', bookingId],
        queryFn: () => base44.entities.Booking.get(bookingId),
        enabled: !!bookingId
    });

    const { data: service } = useQuery({
        queryKey: ['service', booking?.service_id],
        queryFn: () => base44.entities.Service.get(booking.service_id),
        enabled: !!booking?.service_id
    });

    const { data: property } = useQuery({
        queryKey: ['property', booking?.property_id],
        queryFn: () => base44.entities.Property.get(booking.property_id),
        enabled: !!booking?.property_id
    });

    const { data: customer } = useQuery({
        queryKey: ['customer', booking?.customer_id],
        queryFn: async () => {
            // In a real app we'd fetch profile. For now relying on limited info or separate fetch if RLS allows
            // Technicians might not have permission to list all profiles, but maybe get one specific one?
            // Assuming we can't fetch profile directly due to RLS, but address is in property.
            return null;
        },
        enabled: !!booking?.customer_id
    });


    const updateStatusMutation = useMutation({
        mutationFn: (status) => base44.entities.Booking.update(bookingId, { status }),
        onSuccess: (_, status) => {
            queryClient.invalidateQueries(['booking', bookingId]);
            queryClient.invalidateQueries(['myJobs']); // Refresh dashboard
            toast.success(status === 'in_progress' ? 'Job Started' : 'Job Completed');
            if (status === 'completed') {
                setTimeout(() => navigate('/TechnicianDashboard'), 1500);
            }
        }
    });

    if (isLoading || !booking) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" /></div>;
    }

    const handleStartJob = () => updateStatusMutation.mutate('in_progress');
    const handleCompleteJob = () => updateStatusMutation.mutate('completed');

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white z-10">
                <Link to={createPageUrl('TechnicianDashboard')}>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                </Link>
                <span className="font-semibold text-slate-900">Job Details</span>
                <div className="ml-auto">
                    <Badge className={
                        booking.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                    }>
                        {booking.status === 'in_progress' ? 'In Progress' :
                            booking.status === 'confirmed' ? 'Assigned' : booking.status}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Service Info */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{service?.name || 'Service'}</h1>
                    <p className="text-slate-500">Job #{booking.id.slice(0, 8)}</p>
                </div>

                {/* Action Buttons (Sticky if needed, or just prominent) */}
                <div className="grid grid-cols-2 gap-3">
                    {booking.status === 'confirmed' && (
                        <Button
                            size="lg"
                            className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            onClick={handleStartJob}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? 'Starting...' : <><PlayCircle className="w-5 h-5" /> Start Job</>}
                        </Button>
                    )}

                    {booking.status === 'in_progress' && (
                        <Button
                            size="lg"
                            className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white gap-2"
                            onClick={handleCompleteJob}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? 'Completing...' : <><CheckCircle className="w-5 h-5" /> Mark Complete</>}
                        </Button>
                    )}

                    {booking.status === 'completed' && (
                        <div className="col-span-2 bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium border border-green-100">
                            Job Completed
                        </div>
                    )}
                </div>

                {/* Location Card */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-full">
                                <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Location</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    {property?.address || 'Address provided in notes'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {property?.property_type} • {property?.area}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                            <Navigation className="w-4 h-4" /> Open Maps
                        </Button>
                    </CardContent>
                </Card>

                {/* Schedule Card */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-orange-50 p-2 rounded-full">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Schedule</h3>
                                <div className="flex gap-4 mt-1">
                                    <div className="text-sm">
                                        <span className="text-slate-500 block text-xs">Date</span>
                                        <span className="font-medium">{booking.scheduled_date}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-slate-500 block text-xs">Time</span>
                                        <span className="font-medium">{booking.scheduled_time}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-slate-500 block text-xs">Duration</span>
                                        <span className="font-medium">{service?.duration_minutes || 60} min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Notes */}
                {booking.customer_notes && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="font-semibold text-slate-900 text-sm mb-2">Customer Notes</h3>
                        <p className="text-sm text-slate-600 italic">"{booking.customer_notes}"</p>
                    </div>
                )}

            </div>
        </div>
    );
}
