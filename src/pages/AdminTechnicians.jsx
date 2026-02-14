import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Search, Filter, Users, Briefcase, AlertCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';
import AddTechnicianDialog from '../components/admin/AddTechnicianDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AdminTechniciansContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
    staleTime: 30000
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list(),
    initialData: [],
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // KPI calculations
  const totalTechnicians = providers.length;
  const activeOnJob = providers.filter(p => p.is_active && Math.random() > 0.5).length;
  const available = providers.filter(p => p.is_active).length - activeOnJob;
  const offDuty = providers.filter(p => !p.is_active).length;

  // Filter providers
  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.specialization?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && p.is_active) ||
                         (statusFilter === 'inactive' && !p.is_active);
    return matchesSearch && matchesStatus;
  });

  // Mock chart data
  const chartData = [
    { name: 'Mon', jobs: 85 },
    { name: 'Tue', jobs: 65 },
    { name: 'Wed', jobs: 40 },
    { name: 'Thu', jobs: 75 },
    { name: 'Fri', jobs: 25 }
  ];

  const getStatusBadge = (provider) => {
    if (!provider.is_active) return <Badge className="bg-slate-100 text-slate-700">Off-duty</Badge>;
    if (Math.random() > 0.5) return <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>;
    return <Badge className="bg-blue-100 text-blue-700">Available</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Technicians Directory and Performance</h1>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            + Add Technician
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Total Technicians</p>
                  <p className="text-3xl font-bold text-slate-900">{totalTechnicians}</p>
                </div>
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Active on Job</p>
                  <p className="text-3xl font-bold text-slate-900">{activeOnJob}</p>
                </div>
                <Briefcase className="w-6 h-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Available</p>
                  <p className="text-3xl font-bold text-slate-900">{available}</p>
                </div>
                <User className="w-6 h-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Off-duty</p>
                  <p className="text-3xl font-bold text-slate-900">{offDuty}</p>
                </div>
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Table Section */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div className="mb-6 flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="p-4 text-left"><input type="checkbox" className="w-4 h-4" /></th>
                        <th className="p-4 text-left font-semibold text-slate-700">Name (Avatar)</th>
                        <th className="p-4 text-left font-semibold text-slate-700">Specialty</th>
                        <th className="p-4 text-left font-semibold text-slate-700">Current Status</th>
                        <th className="p-4 text-left font-semibold text-slate-700">Performance Rating</th>
                        <th className="p-4 text-left font-semibold text-slate-700">Today's Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProviders.map((provider) => (
                        <tr key={provider.id} className="border-b hover:bg-slate-50 cursor-pointer">
                          <td className="p-4"><input type="checkbox" className="w-4 h-4" /></td>
                          <td className="p-4">
                            <Link to={createPageUrl('AdminProviderDetail') + '?id=' + provider.id}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {provider.profile_image ? (
                                    <img src={provider.profile_image} alt="" className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    provider.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)
                                  )}
                                </div>
                                <span className="font-medium text-slate-900">{provider.full_name}</span>
                              </div>
                            </Link>
                          </td>
                          <td className="p-4 text-slate-700">{provider.specialization?.[0] || 'N/A'}</td>
                          <td className="p-4">{getStatusBadge(provider)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.round(provider.average_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 text-xs">
                            Today's 10:00<br />1:10 AM - 01:30
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 text-xs text-slate-500">Showing 1 of {filteredProviders.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Technician Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Jobs Completed This Week</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="jobs" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <AddTechnicianDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
      </div>
    </div>
  );
}

export default function AdminTechnicians() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminTechniciansContent />
    </AuthGuard>
  );
}