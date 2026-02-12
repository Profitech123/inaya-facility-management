import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Calendar, DollarSign, Plus, Pencil, Trash2, Bell, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';
import AdminPackageForm from '../components/subscriptions/AdminPackageForm';

export default function AdminSubscriptions() {
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const queryClient = useQueryClient();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const createPkgMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPackage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setShowPackageForm(false);
      toast.success('Package created');
    }
  });

  const updatePkgMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPackage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setShowPackageForm(false);
      setEditingPkg(null);
      toast.success('Package updated');
    }
  });

  const deletePkgMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPackage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package deleted');
    }
  });

  const handleSavePackage = (data) => {
    if (editingPkg) {
      updatePkgMutation.mutate({ id: editingPkg.id, data });
    } else {
      createPkgMutation.mutate(data);
    }
  };

  const getPackage = (packageId) => packages.find(p => p.id === packageId);
  const getCustomer = (customerId) => users.find(u => u.id === customerId);

  const sendBulkRenewalReminders = async () => {
    const expiringSoon = subscriptions.filter(s => {
      if (s.status !== 'active' || !s.end_date || s.renewal_reminder_sent) return false;
      return differenceInDays(parseISO(s.end_date), new Date()) <= 30;
    });

    if (expiringSoon.length === 0) {
      toast.info('No subscriptions expiring within 30 days');
      return;
    }

    for (const sub of expiringSoon) {
      const customer = getCustomer(sub.customer_id);
      const pkg = getPackage(sub.package_id);
      if (!customer?.email) continue;

      const daysLeft = differenceInDays(parseISO(sub.end_date), new Date());
      await base44.integrations.Core.SendEmail({
        to: customer.email,
        subject: `Renewal Reminder: ${pkg?.name || 'Your Package'} expires in ${daysLeft} days`,
        body: `
          <h2>Subscription Renewal Reminder</h2>
          <p>Dear ${customer.full_name || 'Customer'},</p>
          <p>Your <strong>${pkg?.name || 'subscription'}</strong> will expire in <strong>${daysLeft} days</strong>.</p>
          <p>${sub.auto_renew ? 'Your subscription is set to auto-renew.' : 'Please renew your subscription to continue services.'}</p>
          <p>Best regards,<br/>INAYA Facilities Management</p>
        `
      });
      await base44.entities.Subscription.update(sub.id, { renewal_reminder_sent: true });
    }

    queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
    toast.success(`Sent reminders to ${expiringSoon.length} customer(s)`);
  };

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pausedSubs = subscriptions.filter(s => s.status === 'paused');
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
  const mrr = activeSubs.reduce((sum, s) => sum + (s.monthly_amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Manage Subscriptions</h1>
          <p className="text-slate-300">View subscriptions and manage packages</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">Active</div>
              <div className="text-3xl font-bold text-green-700">{activeSubs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">Paused</div>
              <div className="text-3xl font-bold text-yellow-700">{pausedSubs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">MRR</div>
              <div className="text-3xl font-bold text-slate-900">AED {mrr.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">Total Packages</div>
              <div className="text-3xl font-bold text-slate-900">{packages.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscriptions">
          <TabsList className="mb-6">
            <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
            <TabsTrigger value="packages">Packages ({packages.length})</TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={sendBulkRenewalReminders}>
                <Bell className="w-4 h-4 mr-2" /> Send Renewal Reminders
              </Button>
            </div>

            <div className="space-y-4">
              {subscriptions.map(subscription => {
                const pkg = getPackage(subscription.package_id);
                const customer = getCustomer(subscription.customer_id);
                const daysUntilEnd = subscription.end_date
                  ? differenceInDays(parseISO(subscription.end_date), new Date()) : null;

                return (
                  <Card key={subscription.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Package className="w-5 h-5 text-slate-600" />
                            {pkg?.name || 'Package'}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {customer?.full_name || customer?.email || 'Customer'}
                            </span>
                            <span>#{subscription.id?.slice(0, 8)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {daysUntilEnd !== null && daysUntilEnd <= 30 && daysUntilEnd > 0 && subscription.status === 'active' && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Expires in {daysUntilEnd}d
                            </Badge>
                          )}
                          <Badge className={
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-6">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <DollarSign className="w-4 h-4" /> Monthly
                          </div>
                          <div className="text-lg font-bold">AED {subscription.monthly_amount}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <Calendar className="w-4 h-4" /> Start
                          </div>
                          <div className="text-lg font-medium">{subscription.start_date}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <Calendar className="w-4 h-4" /> End
                          </div>
                          <div className="text-lg font-medium">{subscription.end_date || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <Calendar className="w-4 h-4" /> Next Billing
                          </div>
                          <div className="text-lg font-medium">{subscription.next_billing_date || 'N/A'}</div>
                        </div>
                      </div>

                      {(subscription.pause_reason || subscription.cancel_reason) && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                          <span className="font-medium text-slate-700">
                            {subscription.status === 'paused' ? 'Pause' : 'Cancel'} reason:
                          </span>{' '}
                          <span className="text-slate-600">
                            {subscription.pause_reason || subscription.cancel_reason}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {subscriptions.length === 0 && (
                <Card><CardContent className="py-12 text-center text-slate-500">No subscriptions yet</CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <div className="flex justify-end mb-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditingPkg(null); setShowPackageForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Create Package
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        {pkg.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {pkg.popular && <Badge className="bg-emerald-100 text-emerald-800">Popular</Badge>}
                        {!pkg.is_active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-3xl font-bold text-slate-900">AED {pkg.monthly_price}</span>
                        <span className="text-slate-500">/month</span>
                      </div>
                      <div className="flex gap-2 flex-wrap text-xs">
                        <Badge variant="outline">{pkg.duration_months} months</Badge>
                        <Badge variant="outline">{pkg.package_type}</Badge>
                        {pkg.property_type && pkg.property_type !== 'all' && (
                          <Badge variant="outline">{pkg.property_type}</Badge>
                        )}
                        {pkg.setup_fee > 0 && <Badge variant="outline">Setup: AED {pkg.setup_fee}</Badge>}
                        {pkg.discount_percentage > 0 && <Badge className="bg-green-100 text-green-800">{pkg.discount_percentage}% off</Badge>}
                      </div>
                      <div className="text-sm text-slate-600">
                        {pkg.services?.length || 0} service(s) included
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingPkg(pkg); setShowPackageForm(true); }}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"
                        onClick={() => { if (confirm('Delete this package?')) deletePkgMutation.mutate(pkg.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AdminPackageForm
        open={showPackageForm}
        onClose={() => { setShowPackageForm(false); setEditingPkg(null); }}
        onSubmit={handleSavePackage}
        pkg={editingPkg}
        services={services}
        isLoading={createPkgMutation.isPending || updatePkgMutation.isPending}
      />
    </div>
  );
}