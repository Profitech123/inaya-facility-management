import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Package, ArrowRight, Settings } from 'lucide-react';

import AuthGuard from '../components/AuthGuard';
import SubscriptionCard from '../components/subscriptions/SubscriptionCard';
import SubscriptionStats from '../components/subscriptions/SubscriptionStats';
import PauseCancelDialog from '../components/subscriptions/PauseCancelDialog';
import UpgradeDialog from '../components/subscriptions/UpgradeDialog';
import AddPropertyDialog from '../components/subscriptions/AddPropertyDialog';
import PaymentMethodDialog from '../components/subscriptions/PaymentMethodDialog';
import RenewalReminderBanner from '../components/subscriptions/RenewalReminderBanner';

function MySubscriptionsContent() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Dialog state
  const [pauseDialog, setPauseDialog] = useState({ open: false, sub: null, action: null });
  const [upgradeDialog, setUpgradeDialog] = useState({ open: false, sub: null });
  const [addPropertyDialog, setAddPropertyDialog] = useState({ open: false, sub: null });
  const [paymentDialog, setPaymentDialog] = useState({ open: false, sub: null });
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = '/');
  }, []);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['mySubscriptions', user?.id],
    queryFn: () => base44.entities.Subscription.filter({ customer_id: user.id }, '-created_date'),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: user.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mySubscriptions'] })
  });

  const getPackage = id => packages.find(p => p.id === id);
  const getProperty = id => properties.find(p => p.id === id);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePauseCancel = async (reason) => {
    const { sub, action } = pauseDialog;
    const isPause = action === 'pause';
    await updateMutation.mutateAsync({
      id: sub.id,
      data: isPause
        ? { status: 'paused', pause_reason: reason, paused_at: new Date().toISOString() }
        : { status: 'cancelled', cancel_reason: reason, cancelled_at: new Date().toISOString(), auto_renew: false }
    });
    // Confirmation email
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: isPause ? `Subscription Paused — ${getPackage(sub.package_id)?.name}` : `Subscription Cancelled — ${getPackage(sub.package_id)?.name}`,
        body: `<p>Dear ${user.full_name},</p><p>Your <strong>${getPackage(sub.package_id)?.name}</strong> subscription has been ${isPause ? 'paused' : 'cancelled'}.</p><p><strong>Reason:</strong> ${reason}</p>${isPause ? '<p>You can resume anytime from your dashboard.</p>' : ''}<p>INAYA Facilities Management</p>`,
        from_name: 'INAYA Facilities Management'
      });
    } catch (e) { /* non-critical */ }
    toast.success(isPause ? 'Subscription paused successfully' : 'Subscription cancelled');
    setPauseDialog({ open: false, sub: null, action: null });
  };

  const handleResume = async (sub) => {
    await updateMutation.mutateAsync({ id: sub.id, data: { status: 'active', pause_reason: '', paused_at: '' } });
    toast.success('Subscription resumed! Services will continue as scheduled.');
  };

  const handleUpgradeRequest = async (targetPkg) => {
    const { sub } = upgradeDialog;
    const currentPkg = getPackage(sub.package_id);
    // Create a support ticket for the upgrade request
    await base44.entities.SupportTicket.create({
      ticket_number: `TKT-UP-${Date.now().toString(36).toUpperCase()}`,
      customer_id: user.id,
      subscription_id: sub.id,
      subject: `Plan Upgrade Request: ${currentPkg?.name} → ${targetPkg.name}`,
      description: `Customer ${user.full_name} has requested to upgrade their subscription from ${currentPkg?.name} (AED ${sub.monthly_amount}/mo) to ${targetPkg.name} (AED ${targetPkg.monthly_price}/mo). Current subscription ID: ${sub.id}`,
      category: 'general',
      priority: 'medium',
      status: 'open'
    });
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Upgrade Request Received — ${targetPkg.name}`,
        body: `<p>Dear ${user.full_name},</p><p>We've received your request to upgrade to <strong>${targetPkg.name}</strong> (AED ${targetPkg.monthly_price}/month). Our team will review and contact you within 24 hours to confirm the change.</p><p>INAYA Facilities Management</p>`,
        from_name: 'INAYA Facilities Management'
      });
    } catch (e) { /* non-critical */ }
    toast.success('Upgrade request submitted! We\'ll contact you within 24 hours.');
  };

  const handleAddPropertyRequest = async (payload) => {
    const { sub } = addPropertyDialog;
    const pkg = getPackage(sub.package_id);
    const propDetails = payload.type === 'existing'
      ? `Existing property ID: ${payload.property_id}`
      : `New property: ${payload.property.address}, ${payload.property.area}, ${payload.property.property_type}, ${payload.property.bedrooms} bed`;
    await base44.entities.SupportTicket.create({
      ticket_number: `TKT-PROP-${Date.now().toString(36).toUpperCase()}`,
      customer_id: user.id,
      subscription_id: sub.id,
      subject: `Add Property to ${pkg?.name} Subscription`,
      description: `Customer ${user.full_name} requests to add a property to their ${pkg?.name} subscription.\n\n${propDetails}\n\nNotes: ${payload.notes || 'None'}`,
      category: 'general',
      priority: 'medium',
      status: 'open'
    });
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Property Addition Request Received',
        body: `<p>Dear ${user.full_name},</p><p>We've received your request to add a property to your <strong>${pkg?.name}</strong> subscription. Our team will review and contact you within 24 hours.</p><p>INAYA Facilities Management</p>`,
        from_name: 'INAYA Facilities Management'
      });
    } catch (e) { /* non-critical */ }
    toast.success('Property request submitted! We\'ll be in touch shortly.');
  };

  const handlePaymentMethodSave = async (method) => {
    await updateMutation.mutateAsync({ id: paymentDialog.sub.id, data: { payment_method: method } });
    toast.success('Payment method updated');
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeSubscriptions = subscriptions.filter(s => ['active', 'paused'].includes(s.status));
  const pastSubscriptions = subscriptions.filter(s => ['cancelled', 'expired'].includes(s.status));
  const displaySubs = activeTab === 'active' ? activeSubscriptions : pastSubscriptions;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">My Subscriptions</h1>
              <p className="text-slate-300 text-sm">Manage your maintenance plans, payment methods, and coverage.</p>
            </div>
            <Link to={createPageUrl('Subscriptions')}>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold gap-2 shrink-0">
                Browse Plans <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Renewal banners */}
        {activeSubscriptions.map(sub => (
          <RenewalReminderBanner
            key={sub.id}
            subscription={sub}
            packageName={getPackage(sub.package_id)?.name || 'Package'}
            userEmail={user.email}
          />
        ))}

        {subscriptions.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <Package className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No subscriptions yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm text-sm leading-relaxed">
              Subscribe to a maintenance package and save up to 20% on regular home services. Choose a plan that fits your property.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl('Subscriptions')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Packages</Button>
              </Link>
              <Link to={createPageUrl('PackageBuilder')}>
                <Button variant="outline">Build Custom Package</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <SubscriptionStats subscriptions={subscriptions} />

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1 w-fit">
              {[
                { key: 'active', label: `Active & Paused (${activeSubscriptions.length})` },
                { key: 'past',   label: `Past Plans (${pastSubscriptions.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subscription cards */}
            {displaySubs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                No {activeTab === 'active' ? 'active' : 'past'} subscriptions found.
              </div>
            ) : (
              <div className="space-y-5">
                {displaySubs.map(sub => (
                  <div key={sub.id} className="space-y-2">
                    <SubscriptionCard
                      subscription={sub}
                      pkg={getPackage(sub.package_id)}
                      property={getProperty(sub.property_id)}
                      onPause={s => setPauseDialog({ open: true, sub: s, action: 'pause' })}
                      onResume={handleResume}
                      onCancel={s => setPauseDialog({ open: true, sub: s, action: 'cancel' })}
                      onUpgrade={s => setUpgradeDialog({ open: true, sub: s })}
                      onAddProperty={s => setAddPropertyDialog({ open: true, sub: s })}
                    />
                    {/* Payment method link shown per active sub */}
                    {sub.status === 'active' && (
                      <button
                        onClick={() => setPaymentDialog({ open: true, sub })}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors ml-1"
                      >
                        <Settings className="w-3 h-3" />
                        Update payment method ({sub.payment_method || 'card'})
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Need a custom plan?</h3>
                <p className="text-emerald-100 text-sm">Build a tailored maintenance package for your exact needs.</p>
              </div>
              <Link to={createPageUrl('PackageBuilder')}>
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold whitespace-nowrap">
                  Build Custom Package
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <PauseCancelDialog
        open={pauseDialog.open}
        onClose={() => setPauseDialog({ open: false, sub: null, action: null })}
        subscription={pauseDialog.sub}
        action={pauseDialog.action}
        onConfirm={handlePauseCancel}
        isLoading={updateMutation.isPending}
      />

      <UpgradeDialog
        open={upgradeDialog.open}
        onClose={() => setUpgradeDialog({ open: false, sub: null })}
        currentSubscription={upgradeDialog.sub}
        allPackages={packages}
        onRequest={handleUpgradeRequest}
      />

      <AddPropertyDialog
        open={addPropertyDialog.open}
        onClose={() => setAddPropertyDialog({ open: false, sub: null })}
        existingProperties={properties.filter(p => p.id !== addPropertyDialog.sub?.property_id)}
        onRequest={handleAddPropertyRequest}
      />

      <PaymentMethodDialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog({ open: false, sub: null })}
        currentMethod={paymentDialog.sub?.payment_method}
        onSave={handlePaymentMethodSave}
      />
    </div>
  );
}

export default function MySubscriptions() {
  return (
    <AuthGuard requiredRole="customer">
      <MySubscriptionsContent />
    </AuthGuard>
  );
}