import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DateRangeFilter from '../components/reports/DateRangeFilter';
import RevenueReport from '../components/reports/RevenueReport';
import CustomerReport from '../components/reports/CustomerReport';
import BookingReport from '../components/reports/BookingReport';
import TechnicianReport from '../components/reports/TechnicianReport';
import SystemHealthReport from '../components/reports/SystemHealthReport';
import AuthGuard from '../components/AuthGuard';

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function AdminReportsContent() {
  const defaults = getDefaultRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['allInvoices'],
    queryFn: () => base44.entities.Invoice.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => base44.entities.SupportTicket.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.ProviderReview.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: [],
    staleTime: 60000
  });

  const resetDates = () => {
    const d = getDefaultRange();
    setStartDate(d.start);
    setEndDate(d.end);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Comprehensive business insights, performance metrics, and exportable reports</p>
        </div>
        <div className="mb-6">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onReset={resetDates}
          />
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <RevenueReport
              invoices={invoices}
              subscriptions={subscriptions}
              packages={packages}
              bookings={bookings}
              services={services}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerReport
              subscriptions={subscriptions}
              bookings={bookings}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingReport
              bookings={bookings}
              services={services}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="technicians">
            <TechnicianReport
              providers={providers}
              bookings={bookings}
              reviews={reviews}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthReport
              bookings={bookings}
              subscriptions={subscriptions}
              tickets={tickets}
              invoices={invoices}
              providers={providers}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminReports() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminReportsContent />
    </AuthGuard>
  );
}