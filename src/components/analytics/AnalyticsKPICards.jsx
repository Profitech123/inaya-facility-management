import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Calendar, Repeat, Star } from 'lucide-react';

export default function AnalyticsKPICards({ bookings, subscriptions, providers, users }) {
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const totalRevenue = paidBookings.reduce((s, b) => s + (b.total_amount || 0), 0);
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((s, sub) => s + (sub.monthly_amount || 0), 0);
  const uniqueCustomers = new Set([...bookings.map(b => b.customer_id), ...subscriptions.map(s => s.customer_id)]).size;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const avgBookingValue = paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0;
  const activeTechs = providers.filter(p => p.is_active).length;

  const kpis = [
    { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Monthly Recurring', value: `AED ${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Repeat, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: uniqueCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completed Jobs', value: completedBookings, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Booking Value', value: `AED ${Math.round(avgBookingValue)}`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Active Technicians', value: activeTechs, icon: Star, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <span className="text-xs text-slate-500">{kpi.label}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}