import React from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Clock, MapPin, Printer, UserCheck, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BookingSuccessModal({ booking, service, property, provider }) {
    const navigate = useNavigate();

    if (!booking || !service) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="p-8 text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-slate-500 mb-8">Your service request has been successfully placed.</p>

                    {/* Booking Card */}
                    <div className="bg-white border boundary-slate-200 rounded-xl overflow-hidden text-left shadow-sm">
                        {/* Header: Ref & Print */}
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">BOOKING REFERENCE</p>
                                <p className="text-xl font-bold text-emerald-600">#{booking.id?.substring(0, 8).toUpperCase() || 'BK-82931'}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 gap-2">
                                <Printer className="w-4 h-4" /> Print Confirmation
                            </Button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Service Image */}
                                <div className="w-full md:w-1/3 aspect-square rounded-lg overflow-hidden bg-slate-100 relative group">
                                    <img
                                        src={service.image || "https://placehold.co/400x400/png?text=Service"}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Service Details */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {service.category_id || 'Maintenance'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-400 font-medium uppercase">SCHEDULED DATE</p>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">
                                                    {booking.scheduled_date ? format(new Date(booking.scheduled_date), 'MMMM d, yyyy') : 'Date not set'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-400 font-medium uppercase">ARRIVAL WINDOW</p>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">{booking.scheduled_time || '09:00 AM - 11:00 AM'}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-1 sm:col-span-2 space-y-1">
                                            <p className="text-xs text-slate-400 font-medium uppercase">LOCATION</p>
                                            <div className="flex items-start gap-2 text-slate-700">
                                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                <span className="font-medium">{property?.address || 'Unit 402, Al Barsha Heights, Dubai, UAE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps Info */}
                            <div className="mt-8 bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex gap-4">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                    <UserCheck className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        A qualified technician is being assigned to your request. Our team will review the requirements and match the best expert for the job.
                                    </p>
                                    <p className="text-sm text-slate-800 font-medium mt-2">
                                        <span className="font-bold">Status Update:</span> You will receive an SMS and push notification once the technician is dispatched and on their way to your location.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => navigate(createPageUrl('Dashboard'))}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none"
                    >
                        Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                        onClick={() => navigate(createPageUrl('OnDemandServices'))}
                        variant="outline"
                        className="border-slate-200 hover:bg-white hover:text-emerald-600 px-8 h-12 text-base flex-1 sm:flex-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Book Another Service
                    </Button>
                </div>

                <div className="pb-6 text-center">
                    <button onClick={() => navigate(createPageUrl('Support'))} className="text-xs text-emerald-600 hover:underline">
                        Need to make changes? Contact Support
                    </button>
                    <p className="text-[10px] text-slate-400 mt-4">
                        © {new Date().getFullYear()} INAYA Facilities Management. All rights reserved.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
