import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TechnicianDashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setUser);
    }, []);

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['myJobs'],
        queryFn: async () => {
            // RLS will filter this query on the backend to only show jobs assigned to this user's provider profile
            return base44.entities.Booking.list('-scheduled_date');
        },
        staleTime: 10000
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => base44.entities.Service.list(),
        staleTime: 60000
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const activeJobs = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
    const completedJobs = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

    const getService = (id) => services.find(s => s.id === id);

    const JobCard = ({ booking }) => {
        const service = getService(booking.service_id);
        return (
            <Link to={createPageUrl('TechnicianJobDetail') + '?id=' + booking.id}>
                <Card className="mb-4 hover:shadow-md transition-shadow active:scale-[0.99] transition-transform">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-900">{service?.name || 'Service'}</h3>
                                <p className="text-xs text-slate-500">#{booking.id.slice(0, 8)}</p>
                            </div>
                            <Badge className={
                                booking.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                            }>
                                {booking.status === 'in_progress' ? 'In Progress' :
                                    booking.status === 'confirmed' ? 'Assigned' : booking.status}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{booking.scheduled_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>{booking.scheduled_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="truncate max-w-[200px]">
                                    {/* In a real app we'd fetch the property address */}
                                    View Location Details
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <span className="text-emerald-600 text-sm font-medium flex items-center">
                                View Job <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
                <p className="text-slate-500">Welcome back, {user?.full_name?.split(' ')[0]}</p>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Active & Upcoming</h2>
                    {activeJobs.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-400">No active jobs assigned</p>
                        </div>
                    ) : (
                        activeJobs.map(b => <JobCard key={b.id} booking={b} />)
                    )}
                </div>

                {completedJobs.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recent History</h2>
                        {completedJobs.slice(0, 3).map(b => <JobCard key={b.id} booking={b} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
