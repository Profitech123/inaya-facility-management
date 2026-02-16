import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { event, data, old_data } = payload;
    
    if (!event || !data) {
      return Response.json({ skipped: true, reason: 'No event/data' });
    }

    console.log(`Subscription event: ${event.type} for ${event.entity_id}`);

    const subscription = data;

    // === NEW SUBSCRIPTION CREATED ===
    if (event.type === 'create') {
      const [customer, pkg] = await Promise.all([
        base44.asServiceRole.entities.User.read(subscription.customer_id),
        base44.asServiceRole.entities.SubscriptionPackage.read(subscription.package_id).catch(() => null),
      ]);

      if (!customer) return Response.json({ skipped: true, reason: 'No customer' });

      const packageName = pkg?.name || 'Custom Package';

      // In-app notification
      await base44.asServiceRole.entities.Notification.create({
        user_id: subscription.customer_id,
        type: 'subscription_renewed',
        title: `Subscription Activated — ${packageName}`,
        message: `Your ${packageName} subscription is now active! Monthly amount: AED ${subscription.monthly_amount}. Services will be scheduled automatically.`,
        link_page: 'MySubscriptions',
        related_entity_type: 'Subscription',
        related_entity_id: event.entity_id,
      });

      // Email
      if (customer.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `Welcome to ${packageName} — Subscription Active`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#059669,#047857);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:24px">🎉 Subscription Activated</h1>
    <p style="margin:5px 0 0;opacity:.85">${packageName}</p>
  </div>
  <div style="background:#f9fafb;padding:25px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <p>Hi ${customer.full_name},</p>
    <p>Your <strong>${packageName}</strong> subscription is now active. Here are the details:</p>
    <div style="background:white;padding:15px;border-radius:6px;border-left:4px solid #059669;margin:15px 0">
      <p><strong>Monthly Amount:</strong> AED ${subscription.monthly_amount}</p>
      <p><strong>Start Date:</strong> ${subscription.start_date}</p>
      ${subscription.end_date ? `<p><strong>End Date:</strong> ${subscription.end_date}</p>` : ''}
      <p><strong>Auto-Renew:</strong> ${subscription.auto_renew !== false ? 'Yes' : 'No'}</p>
    </div>
    <p>Your services will be automatically scheduled according to your plan. You can track everything from your dashboard.</p>
    <p style="text-align:center;margin-top:20px;font-size:13px">Questions? Call +971 4 815 7300 or email info@inaya.ae</p>
  </div>
</div>`,
          from_name: 'INAYA Facilities Management'
        });
        console.log(`Subscription activation email sent to ${customer.email}`);
      }

      return Response.json({ success: true, action: 'subscription_created_notification' });
    }

    // === SUBSCRIPTION STATUS CHANGED ===
    if (event.type === 'update' && old_data && data.status !== old_data.status) {
      const oldStatus = old_data.status;
      const newStatus = data.status;

      console.log(`Subscription status: ${oldStatus} → ${newStatus}`);

      const [customer, pkg] = await Promise.all([
        base44.asServiceRole.entities.User.read(subscription.customer_id),
        base44.asServiceRole.entities.SubscriptionPackage.read(subscription.package_id).catch(() => null),
      ]);

      if (!customer) return Response.json({ skipped: true, reason: 'No customer' });

      const packageName = pkg?.name || 'Your Package';

      const statusNotifs = {
        paused: {
          type: 'subscription_expiring',
          title: `Subscription Paused — ${packageName}`,
          message: `Your ${packageName} subscription has been paused. ${subscription.pause_reason || ''} Services will not be scheduled while paused.`,
        },
        cancelled: {
          type: 'subscription_expiring',
          title: `Subscription Cancelled — ${packageName}`,
          message: `Your ${packageName} subscription has been cancelled. ${subscription.cancel_reason || ''} You can resubscribe anytime from your dashboard.`,
        },
        active: {
          type: 'subscription_renewed',
          title: `Subscription Reactivated — ${packageName}`,
          message: `Great news! Your ${packageName} subscription is active again. Services will resume being scheduled automatically.`,
        },
        expired: {
          type: 'subscription_expiring',
          title: `Subscription Expired — ${packageName}`,
          message: `Your ${packageName} subscription has expired. Renew now to continue enjoying uninterrupted service.`,
        },
      };

      const notifData = statusNotifs[newStatus];
      if (notifData) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: subscription.customer_id,
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          link_page: 'MySubscriptions',
          related_entity_type: 'Subscription',
          related_entity_id: event.entity_id,
        });

        // Send email for important status changes
        if (customer.email && ['cancelled', 'expired'].includes(newStatus)) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customer.email,
            subject: notifData.title,
            body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:25px;text-align:center;border-radius:8px 8px 0 0">
    <h2 style="margin:0">${newStatus === 'cancelled' ? '❌' : '⏰'} Subscription ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h2>
  </div>
  <div style="background:#f9fafb;padding:25px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <p>Hi ${customer.full_name},</p>
    <p>${notifData.message}</p>
    <p>If you'd like to continue with INAYA's services, you can easily resubscribe or book on-demand services from your dashboard.</p>
    <p style="text-align:center;margin-top:20px;font-size:13px">Questions? Call +971 4 815 7300 or email info@inaya.ae</p>
  </div>
</div>`,
            from_name: 'INAYA Facilities Management'
          });
          console.log(`Subscription ${newStatus} email sent to ${customer.email}`);
        }
      }

      return Response.json({ success: true, action: `subscription_${newStatus}_notification` });
    }

    return Response.json({ skipped: true, reason: 'No matching condition' });
  } catch (error) {
    console.error('onSubscriptionEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});