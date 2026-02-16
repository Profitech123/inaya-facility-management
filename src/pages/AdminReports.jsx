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
import { AuthGuard } from '../components/AuthGuard';

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
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  const [technicianStatus, setTechnicianStatus] = useState('all');

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

  // Filter bookings by selected services
  const filteredBookings = selectedServices.length > 0 
    ? bookings.filter(b => selectedServices.includes(b.service_id))
    : bookings;

  // Filter providers by status
  const filteredProviders = technicianStatus === 'all'
    ? providers
    : technicianStatus === 'active'
    ? providers.filter(p => p.is_active)
    : providers.filter(p => !p.is_active);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Comprehensive business insights, performance metrics, and exportable reports</p>
        </div>
        <div className="mb-6 space-y-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onReset={resetDates}
          />
          
          {/* Advanced Filters */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Filter by Service</label>
                <select 
                  multiple 
                  value={selectedServices} 
                  onChange={(e) => setSelectedServices(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Technician Status</label>
                <select 
                  value={technicianStatus}
                  onChange={(e) => setTechnicianStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="all">All Technicians</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => { setSelectedServices([]); setTechnicianStatus('all'); }}
                  className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
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
              bookings={filteredBookings}
              services={services}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerReport
              subscriptions={subscriptions}
              bookings={filteredBookings}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingReport
              bookings={filteredBookings}
              services={services}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="technicians">
            <TechnicianReport
              providers={filteredProviders}
              bookings={filteredBookings}
              reviews={reviews}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthReport
              bookings={filteredBookings}
              subscriptions={subscriptions}
              tickets={tickets}
              invoices={invoices}
              providers={filteredProviders}
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
