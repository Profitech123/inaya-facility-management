import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, DollarSign, Calendar, Star, Building2, ArrowUpRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';

function AdminCustomersContent() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [expandedId, setExpandedId] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['adminUsers'], queryFn: () => base44.entities.User.list(), initialData: [], staleTime: 30000
  });
  const { data: bookings = [] } = useQuery({
    queryKey: ['adminBookings'], queryFn: () => base44.entities.Booking.list(), initialData: [], staleTime: 30000
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['adminSubscriptions'], queryFn: () => base44.entities.Subscription.list(), initialData: [], staleTime: 30000
  });
  const { data: properties = [] } = useQuery({
    queryKey: ['adminProperties'], queryFn: () => base44.entities.Property.list(), initialData: [], staleTime: 60000
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services'], queryFn: () => base44.entities.Service.list(), initialData: [], staleTime: 60000
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['adminReviews'], queryFn: () => base44.entities.ProviderReview.list(), initialData: [], staleTime: 60000
  });

  const customerData = useMemo(() => {
    return users.filter(u => u.role !== 'admin').map(u => {
      const userBookings = bookings.filter(b => b.customer_id === u.id);
      const userSubs = subscriptions.filter(s => s.customer_id === u.id);
      const userProperties = properties.filter(p => p.owner_id === u.id);
      const userReviews = reviews.filter(r => r.customer_id === u.id);
      const totalSpent = userBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);
      const subRevenue = userSubs.reduce((s, sub) => {
        const start = new Date(sub.start_date || sub.created_date);
        const end = sub.end_date ? new Date(sub.end_date) : new Date();
        const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
        return s + (sub.monthly_amount || 0) * months;
      }, 0);
      const activeSub = userSubs.find(s => s.status === 'active');
      const lastBooking = userBookings.sort((a, b) => (b.scheduled_date || '').localeCompare(a.scheduled_date || ''))[0];

      return {
        ...u,
        totalBookings: userBookings.length,
        completedBookings: userBookings.filter(b => b.status === 'completed').length,
        cancelledBookings: userBookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: totalSpent + subRevenue,
        bookingRevenue: totalSpent,
        subRevenue,
        activeSub,
        properties: userProperties,
        lastBookingDate: lastBooking?.scheduled_date || null,
        reviewCount: userReviews.length,
        recentBookings: userBookings.slice(0, 5),
      };
    });
  }, [users, bookings, subscriptions, properties, reviews]);

  const filtered = customerData
    .filter(c => !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
      if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
      if (sortBy === 'recent') return (b.lastBookingDate || '').localeCompare(a.lastBookingDate || '');
      if (sortBy === 'name') return (a.full_name || '').localeCompare(b.full_name || '');
      return 0;
    });

  const totalCustomers = customerData.length;
  const activeSubscribers = customerData.filter(c => c.activeSub).length;
  const totalLTV = customerData.reduce((s, c) => s + c.totalRevenue, 0);
  const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-slate-500">View all customers, their properties, bookings, and lifetime value</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Subscribers', value: activeSubscribers, icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total LTV', value: `AED ${totalLTV.toLocaleString()}`, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avg LTV', value: `AED ${Math.round(avgLTV).toLocaleString()}`, icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                    <div className="text-xs text-slate-500">{kpi.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-10" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Sort by Revenue</SelectItem>
            <SelectItem value="bookings">Sort by Bookings</SelectItem>
            <SelectItem value="recent">Sort by Recent</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-500">{filtered.length} customers</span>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filtered.map(customer => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                    {customer.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{customer.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400 truncate">{customer.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 flex-wrap justify-end">
                  {customer.activeSub && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Subscriber</Badge>}
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">AED {customer.totalRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Lifetime value</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{customer.totalBookings}</div>
                    <div className="text-[10px] text-slate-400">Bookings</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-slate-700">{customer.properties.length}</div>
                    <div className="text-[10px] text-slate-400">Properties</div>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === customer.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid md:grid-cols-3 gap-4">
                  {/* Contact */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Contact</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3.5 h-3.5" />{customer.email}</div>
                      <div className="text-xs text-slate-400">Joined {customer.created_date ? new Date(customer.created_date).toLocaleDateString() : '—'}</div>
                      <div className="text-xs text-slate-400">Last booking: {customer.lastBookingDate || 'Never'}</div>
                    </div>
                  </div>
                  {/* Properties */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Properties ({customer.properties.length})</h4>
                    {customer.properties.length === 0 ? (
                      <p className="text-xs text-slate-400">No properties</p>
                    ) : (
                      <div className="space-y-1.5">
                        {customer.properties.slice(0, 3).map(p => (
                          <div key={p.id} className="flex items-center gap-2 text-xs">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{p.property_type} — {p.area || p.address}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Revenue breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Revenue Breakdown</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">On-demand</span><span className="font-medium">AED {customer.bookingRevenue.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Subscriptions</span><span className="font-medium">AED {customer.subRevenue.toLocaleString()}</span></div>
                      <div className="flex justify-between border-t pt-1"><span className="text-slate-700 font-semibold">Total</span><span className="font-bold">AED {customer.totalRevenue.toLocaleString()}</span></div>
                      <div className="flex justify-between text-slate-400"><span>Completed / Cancelled</span><span>{customer.completedBookings} / {customer.cancelledBookings}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">No customers found</div>
        )}
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