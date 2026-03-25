import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // ─── Helpers ─────────────────────────────────────────────────────────────
    async function getTemplate(templateKey) {
      const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ template_key: templateKey });
      return templates?.[0] || null;
    }

    function fillTemplate(template, vars) {
      let subject = template.subject || '';
      let body = template.body || '';
      for (const [key, val] of Object.entries(vars)) {
        const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(re, val ?? '');
        body = body.replace(re, val ?? '');
      }
      return { subject, body };
    }

    async function sendTemplateEmail(templateKey, to, vars, fallbackSubject) {
      const template = await getTemplate(templateKey);
      if (!template || template.is_active === false) {
        console.log(`Template "${templateKey}" not found or disabled — skipping email`);
        return;
      }
      const { subject, body } = fillTemplate(template, { company_name: 'INAYA Facilities Management', ...vars });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: subject || fallbackSubject,
        body,
        from_name: 'INAYA Facilities Management',
      });
      console.log(`Email sent [${templateKey}] → ${to}`);
    }

    // ─── NEW SUBSCRIPTION CREATED ────────────────────────────────────────────
    if (event.type === 'create') {
      const [customer, pkg] = await Promise.all([
        base44.asServiceRole.entities.User.read(subscription.customer_id),
        base44.asServiceRole.entities.SubscriptionPackage.read(subscription.package_id).catch(() => null),
      ]);

      if (!customer) return Response.json({ skipped: true, reason: 'No customer' });

      const packageName = pkg?.name || 'Custom Package';

      await base44.asServiceRole.entities.Notification.create({
        user_id: subscription.customer_id,
        type: 'subscription_renewed',
        title: `Subscription Activated — ${packageName}`,
        message: `Your ${packageName} subscription is now active! Monthly: AED ${subscription.monthly_amount}. Services will be scheduled automatically.`,
        link_page: 'MySubscriptions',
        related_entity_type: 'Subscription',
        related_entity_id: event.entity_id,
      });

      if (customer.email) {
        const property = subscription.property_id
          ? (await base44.asServiceRole.entities.Property.filter({ id: subscription.property_id }))?.[0]
          : null;

        await sendTemplateEmail('subscription_activated', customer.email, {
          customer_name: customer.full_name,
          subscription_name: packageName,
          monthly_amount: (subscription.monthly_amount || 0).toString(),
          start_date: subscription.start_date || '',
          property_address: property ? `${property.address || ''}${property.area ? ', ' + property.area : ''}` : '',
        }, `Welcome to ${packageName} — Subscription Active`);
      }

      return Response.json({ success: true, action: 'subscription_created_notification' });
    }

    // ─── SUBSCRIPTION STATUS CHANGED ─────────────────────────────────────────
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

      const notifMessages = {
        paused: `Your ${packageName} subscription has been paused. Services will not be scheduled while paused.`,
        cancelled: `Your ${packageName} subscription has been cancelled. You can resubscribe anytime from your dashboard.`,
        active: `Great news! Your ${packageName} subscription is active again. Services will resume automatically.`,
        expired: `Your ${packageName} subscription has expired. Renew now to continue uninterrupted service.`,
      };

      const notifTitles = {
        paused: `Subscription Paused — ${packageName}`,
        cancelled: `Subscription Cancelled — ${packageName}`,
        active: `Subscription Reactivated — ${packageName}`,
        expired: `Subscription Expired — ${packageName}`,
      };

      if (notifMessages[newStatus]) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: subscription.customer_id,
          type: 'subscription_expiring',
          title: notifTitles[newStatus],
          message: notifMessages[newStatus],
          link_page: 'MySubscriptions',
          related_entity_type: 'Subscription',
          related_entity_id: event.entity_id,
        });
      }

      // Send email for all significant status changes
      const templateMap = {
        cancelled: 'subscription_cancelled',
        expired: 'subscription_cancelled',
        active: 'subscription_activated',
      };

      const templateKey = templateMap[newStatus];
      if (templateKey && customer.email) {
        const property = subscription.property_id
          ? (await base44.asServiceRole.entities.Property.filter({ id: subscription.property_id }))?.[0]
          : null;

        await sendTemplateEmail(templateKey, customer.email, {
          customer_name: customer.full_name,
          subscription_name: packageName,
          monthly_amount: (subscription.monthly_amount || 0).toString(),
          start_date: subscription.start_date || '',
          end_date: subscription.end_date || '',
          property_address: property ? `${property.address || ''}${property.area ? ', ' + property.area : ''}` : '',
        }, notifTitles[newStatus] || `Subscription ${newStatus} — ${packageName}`);
      }

      return Response.json({ success: true, action: `subscription_${newStatus}_notification` });
    }

    return Response.json({ skipped: true, reason: 'No matching condition' });
  } catch (error) {
    console.error('onSubscriptionEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});