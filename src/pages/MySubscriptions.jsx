import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Package, Pause, Play, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import PauseCancelDialog from '../components/subscriptions/PauseCancelDialog';
import RenewalReminderBanner from '../components/subscriptions/RenewalReminderBanner';

export default function MySubscriptions() {
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = '/');
  }, []);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_id: user?.id }, '-created_date'),
    enabled: !!user,
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] });
      setDialogOpen(false);
      setSelectedSub(null);
    }
  });

  const getPackage = (packageId) => packages.find(p => p.id === packageId);
  const getProperty = (propertyId) => properties.find(p => p.id === propertyId);

  const openDialog = (subscription, action) => {
    setSelectedSub(subscription);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handlePauseCancel = async (reason) => {
    const isPause = dialogAction === 'pause';
    const updateData = isPause
      ? { status: 'paused', pause_reason: reason, paused_at: new Date().toISOString() }
      : { status: 'cancelled', cancel_reason: reason, cancelled_at: new Date().toISOString(), auto_renew: false };

    await updateMutation.mutateAsync({ id: selectedSub.id, data: updateData });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: isPause
        ? `Subscription Paused - ${getPackage(selectedSub.package_id)?.name || 'Package'}`
        : `Subscription Cancelled - ${getPackage(selectedSub.package_id)?.name || 'Package'}`,
      body: `
        <h2>Subscription ${isPause ? 'Paused' : 'Cancelled'}</h2>
        <p>Dear ${user.full_name || 'Customer'},</p>
        <p>Your subscription for <strong>${getPackage(selectedSub.package_id)?.name || 'Package'}</strong> has been ${isPause ? 'paused' : 'cancelled'}.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        ${isPause ? '<p>You can resume your subscription anytime from your dashboard.</p>' : '<p>We\'re sorry to see you go. If you change your mind, you can always subscribe again.</p>'}
        <p>Best regards,<br/>INAYA Facilities Management</p>
      `
    });

    toast.success(isPause ? 'Subscription paused' : 'Subscription cancelled');
  };

  const handleResume = async (subscription) => {
    await updateMutation.mutateAsync({
      id: subscription.id,
      data: { status: 'active', pause_reason: '', paused_at: '' }
    });
    toast.success('Subscription resumed');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-slate-300">Manage your active subscription packages.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-4">No active subscriptions</p>
              <Link to={createPageUrl('Subscriptions')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Packages</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subscriptions.map(subscription => {
              const pkg = getPackage(subscription.package_id);
              const property = getProperty(subscription.property_id);
              
              return (
                <div key={subscription.id} className="space-y-3">
                  <RenewalReminderBanner
                    subscription={subscription}
                    packageName={pkg?.name || 'Package'}
                    userEmail={user.email}
                  />

                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2">{pkg?.name || 'Package'}</CardTitle>
                          <p className="text-slate-600">{property?.address || 'Property'}</p>
                        </div>
                        <Badge className={
                          subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                          subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          {subscription.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Monthly Amount</div>
                          <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
                            <DollarSign className="w-5 h-5" />
                            AED {subscription.monthly_amount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Start Date</div>
                          <div className="flex items-center gap-1 text-lg font-medium text-slate-900">
                            <Calendar className="w-4 h-4" />
                            {subscription.start_date}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Next Billing</div>
                          <div className="flex items-center gap-1 text-lg font-medium text-slate-900">
                            <Calendar className="w-4 h-4" />
                            {subscription.next_billing_date || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {(subscription.pause_reason || subscription.cancel_reason) && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
                          <span className="font-medium text-slate-700">
                            {subscription.status === 'paused' ? 'Pause' : 'Cancel'} reason:
                          </span>{' '}
                          <span className="text-slate-600">
                            {subscription.pause_reason || subscription.cancel_reason}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-3">
                        {subscription.status === 'active' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openDialog(subscription, 'pause')}>
                              <Pause className="w-4 h-4 mr-1" /> Pause
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"
                              onClick={() => openDialog(subscription, 'cancel')}>
                              <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </>
                        )}
                        {subscription.status === 'paused' && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleResume(subscription)}
                            disabled={updateMutation.isPending}>
                            <Play className="w-4 h-4 mr-1" /> Resume Subscription
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PauseCancelDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedSub(null); }}
        subscription={selectedSub}
        action={dialogAction}
        onConfirm={handlePauseCancel}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}