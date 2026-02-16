import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Mail, Phone, Calendar, User, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import AuthGuard from '../components/AuthGuard';

function CustomerDetailSheet({ customer, isOpen, onClose }) {
    const { data: bookings = [] } = useQuery({
        queryKey: ['customerBookings', customer?.id],
        queryFn: () => base44.entities.Booking.filter({ customer_id: customer?.id }),
        enabled: !!customer?.id,
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['customerSubscriptions', customer?.id],
        queryFn: () => base44.entities.Subscription.filter({ user_id: customer?.id }),
        enabled: !!customer?.id,
    });

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{customer?.full_name || 'Customer Details'}</h2>
                            <p className="text-sm text-slate-500 font-normal">{customer?.email}</p>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <ShoppingBag className="w-5 h-5 text-emerald-600 mb-2" />
                                <div className="text-2xl font-bold">{bookings.length}</div>
                                <div className="text-xs text-slate-500">Total Bookings</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <CreditCard className="w-5 h-5 text-purple-600 mb-2" />
                                <div className="text-2xl font-bold">{subscriptions.length}</div>
                                <div className="text-xs text-slate-500">Active Plans</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">{customer?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">{customer?.phone_number || 'No phone number'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700 capitalize">Role: <Badge variant="outline">{customer?.role || 'Customer'}</Badge></span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Bookings */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-emerald-600" /> Recent Bookings
                        </h3>
                        {bookings.length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-lg text-center text-sm text-slate-500">No bookings found</div>
                        ) : (
                            <div className="space-y-2">
                                {bookings.slice(0, 5).map(booking => (
                                    <div key={booking.id} className="p-3 border border-slate-100 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-slate-700">{booking.service_name || 'Service'}</span>
                                            <Badge variant="secondary" className="text-[10px]">{booking.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="w-3 h-3" />
                                            {booking.scheduled_date ? format(new Date(booking.scheduled_date), 'MMM d, yyyy') : 'TBD'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Subscriptions */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-purple-600" /> Subscriptions
                        </h3>
                        {subscriptions.length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-lg text-center text-sm text-slate-500">No active subscriptions</div>
                        ) : (
                            <div className="space-y-2">
                                {subscriptions.map(sub => (
                                    <div key={sub.id} className="p-3 border border-slate-100 rounded-lg text-sm bg-purple-50/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-slate-900">{sub.package_name || 'Maintenance Plan'}</span>
                                            <Badge className="bg-emerald-600 text-[10px]">Active</Badge>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Started: {sub.start_date ? format(new Date(sub.start_date), 'MMM d, yyyy') : 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function AdminCustomersContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['adminCustomers'],
        queryFn: () => base44.entities.User.list(), // Fetches profiles
        staleTime: 60000,
    });

    const filteredCustomers = customers.filter(c =>
        (c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        c.role !== 'admin' // Optionally hide other admins
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
                        <p className="text-slate-500">Manage customer base and view history</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search customers..."
                            className="pl-9 w-64 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Phone</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading customers...</td></tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No customers found</td></tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                                        {customer.full_name?.charAt(0) || customer.email.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{customer.full_name || 'Unknown'}</div>
                                                        <div className="text-xs text-slate-500">ID: {customer.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="capitalize">{customer.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                                            <td className="px-6 py-4 text-slate-600">{customer.phone_number || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    onClick={() => setSelectedCustomer(customer)}
                                                >
                                                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <CustomerDetailSheet
                    customer={selectedCustomer}
                    isOpen={!!selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            </div>
        </div>
    );
}

export default function AdminCustomers() {
    return (
        <AuthGuard requiredRole="admin">
            <AdminCustomersContent />
        </AuthGuard>
    );
}
