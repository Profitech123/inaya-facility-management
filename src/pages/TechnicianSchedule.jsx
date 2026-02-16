import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import TechnicianScheduleCalendar from '@/components/admin/TechnicianScheduleCalendar';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TechnicianSchedule() {
    const { user } = useAuth();

    // 1. Fetch Technician Profile (to get ID and details)
    const { data: technician, isLoading: isLoadingTech } = useQuery({
        queryKey: ['technicianProfile', user?.email],
        queryFn: async () => {
            // Find provider profile linked to this user
            const providers = await base44.entities.Provider.list();
            const tech = providers.find(p => p.email === user?.email || p.user_id === user?.id);
            if (!tech) throw new Error("Technician profile not found");
            return tech;
        },
        enabled: !!user?.email,
    });

    // 2. Fetch Bookings for this Technician
    const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
        queryKey: ['technicianBookings', technician?.id],
        queryFn: async () => {
            // Fetch all bookings for this provider
            // In a real app with RLS, .list() might already be filtered, but being explicit helps
            const allBookings = await base44.entities.Booking.list();
            return allBookings.filter(b => b.assigned_provider_id === technician.id);
        },
        enabled: !!technician?.id,
    });

    // 3. Fetch Services (for names)
    const { data: services = [], isLoading: isLoadingServices } = useQuery({
        queryKey: ['services'],
        queryFn: () => base44.entities.Service.list(),
    });

    if (isLoadingTech || isLoadingBookings || isLoadingServices) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-medium">Loading schedule...</p>
            </div>
        );
    }

    if (!technician) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Error</AlertTitle>
                    <AlertDescription>
                        Could not find a technician profile linked to your account. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
                <p className="text-slate-500">View your upcoming jobs for the week.</p>
            </div>

            <TechnicianScheduleCalendar
                providers={[technician]}
                bookings={bookings}
                services={services}
                onBookingClick={(booking) => {
                    window.location.href = `/TechnicianJobDetail?id=${booking.id}`;
                }}
            />
        </div>
    );
}
