import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Scheduled function: generates ScheduledService entries for active subscriptions
 * and handles provider assignment + reassignment if provider is unavailable.
 * Runs daily via automation.
 */

const FREQUENCY_DAYS = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
};

const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];

function getNextDates(frequency, fromDate, untilDate) {
  const intervalDays = FREQUENCY_DAYS[frequency] || 30;
  const dates = [];
  let current = new Date(fromDate);
  const end = new Date(untilDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current = new Date(current.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  }
  return dates;
}

function findAvailableProvider(providers, blockouts, serviceId, date, existingScheduled) {
  // Filter providers who can handle this service
  const qualified = providers.filter(p => {
    if (!p.is_active) return false;
    if (p.assigned_service_ids?.length > 0) {
      return p.assigned_service_ids.includes(serviceId);
    }
    return true; // no specific assignments = general availability
  });

  // Sort by least busy on that date, then by rating
  const scored = qualified.map(p => {
    const isBlocked = blockouts.some(b =>
      b.provider_id === p.id &&
      b.date === date &&
      (b.time_slot === 'all_day')
    );
    if (isBlocked) return { provider: p, score: -1 };

    const jobsOnDate = existingScheduled.filter(s =>
      s.assigned_provider === p.id &&
      s.scheduled_date === date &&
      s.status !== 'skipped'
    ).length;

    return {
      provider: p,
      score: 100 - jobsOnDate + (p.average_rating || 0),
    };
  }).filter(s => s.score >= 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.length > 0 ? scored[0].provider : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all needed data in parallel
    const [subscriptions, packages, customPackages, providers, blockouts, existingScheduled] = await Promise.all([
      base44.asServiceRole.entities.Subscription.filter({ status: 'active' }),
      base44.asServiceRole.entities.SubscriptionPackage.filter({ is_active: true }),
      base44.asServiceRole.entities.CustomPackage.filter({ is_active: true }),
      base44.asServiceRole.entities.Provider.filter({ is_active: true }),
      base44.asServiceRole.entities.TechBlockout.filter({}),
      base44.asServiceRole.entities.ScheduledService.filter({}),
    ]);

    const today = new Date();
    const planningHorizonDays = 30; // schedule 30 days ahead
    const horizonDate = new Date(today.getTime() + planningHorizonDays * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const horizonStr = horizonDate.toISOString().split('T')[0];

    const newEntries = [];
    const reassignments = [];
    const notifications = [];

    for (const sub of subscriptions) {
      // Find the package (pre-built or custom)
      const pkg = packages.find(p => p.id === sub.package_id);
      const customPkg = !pkg ? customPackages.find(cp => cp.id === sub.package_id) : null;
      const services = pkg?.services || customPkg?.services || [];

      if (services.length === 0) continue;

      const subEndDate = sub.end_date ? new Date(sub.end_date) : horizonDate;
      const effectiveHorizon = subEndDate < horizonDate ? subEndDate : horizonDate;

      for (const svc of services) {
        const frequency = svc.frequency || 'monthly';
        if (frequency === 'one-time') continue;

        const dates = getNextDates(frequency, todayStr, effectiveHorizon.toISOString().split('T')[0]);

        for (const date of dates) {
          // Check if already scheduled
          const alreadyExists = existingScheduled.some(es =>
            es.subscription_id === sub.id &&
            es.service_id === svc.service_id &&
            es.scheduled_date === date
          );
          if (alreadyExists) continue;

          // Find best available provider
          const provider = findAvailableProvider(
            providers, blockouts, svc.service_id, date, [...existingScheduled, ...newEntries]
          );

          const timeSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];

          const entry = {
            subscription_id: sub.id,
            service_id: svc.service_id,
            scheduled_date: date,
            scheduled_time: timeSlot,
            status: 'scheduled',
            assigned_provider: provider?.id || '',
            customer_notified: false,
            provider_notified: false,
          };
          newEntries.push(entry);

          // Queue notification for services within the next 3 days
          const daysAway = Math.floor((new Date(date) - today) / (1000 * 60 * 60 * 24));
          if (daysAway <= 3 && daysAway >= 0) {
            notifications.push({
              type: 'upcoming',
              customer_id: sub.customer_id,
              service_id: svc.service_id,
              date,
              provider_id: provider?.id,
            });
          }
        }
      }
    }

    // Check existing scheduled services for provider unavailability (reassignment)
    const futureScheduled = existingScheduled.filter(s =>
      s.scheduled_date >= todayStr &&
      s.status === 'scheduled' &&
      s.assigned_provider
    );

    for (const sched of futureScheduled) {
      const isBlocked = blockouts.some(b =>
        b.provider_id === sched.assigned_provider &&
        b.date === sched.scheduled_date &&
        (b.time_slot === 'all_day' || b.time_slot === sched.scheduled_time)
      );

      if (isBlocked) {
        const newProvider = findAvailableProvider(
          providers, blockouts, sched.service_id, sched.scheduled_date, existingScheduled
        );

        if (newProvider && newProvider.id !== sched.assigned_provider) {
          reassignments.push({
            id: sched.id,
            previous_provider: sched.assigned_provider,
            assigned_provider: newProvider.id,
            status: 'reassigned',
            reassignment_reason: 'Original provider unavailable (blocked out)',
            customer_notified: false,
            provider_notified: false,
          });
        }
      }
    }

    // Bulk create new scheduled services
    let createdCount = 0;
    if (newEntries.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < newEntries.length; i += batchSize) {
        const batch = newEntries.slice(i, i + batchSize);
        await base44.asServiceRole.entities.ScheduledService.bulkCreate(batch);
        createdCount += batch.length;
      }
    }

    // Apply reassignments
    let reassignedCount = 0;
    for (const r of reassignments) {
      await base44.asServiceRole.entities.ScheduledService.update(r.id, {
        assigned_provider: r.assigned_provider,
        previous_provider: r.previous_provider,
        status: r.status,
        reassignment_reason: r.reassignment_reason,
        customer_notified: false,
        provider_notified: false,
      });
      reassignedCount++;
    }

    // Send notifications for upcoming services (within 3 days)
    let notifiedCount = 0;
    for (const notif of notifications) {
      try {
        const provider = providers.find(p => p.id === notif.provider_id);
        // Notify customer
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: notif.customer_id, // customer email stored in customer_id or fetched
          subject: `Upcoming Service Reminder — ${notif.date}`,
          body: `<h2>Service Reminder</h2>
            <p>You have a scheduled service on <strong>${notif.date}</strong>.</p>
            ${provider ? `<p>Your assigned technician: <strong>${provider.full_name}</strong></p>` : ''}
            <p>If you need to reschedule, please contact us.</p>
            <p>— INAYA Facilities Management</p>`
        });

        // Notify provider
        if (provider?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: provider.email,
            subject: `New Assignment — ${notif.date}`,
            body: `<h2>Service Assignment</h2>
              <p>You have been assigned a service on <strong>${notif.date}</strong>.</p>
              <p>Please confirm your availability.</p>
              <p>— INAYA Facilities Management</p>`
          });
        }
        notifiedCount++;
      } catch (e) {
        console.error('Notification error:', e.message);
      }
    }

    console.log(`Scheduling complete: ${createdCount} created, ${reassignedCount} reassigned, ${notifiedCount} notified`);

    return Response.json({
      success: true,
      created: createdCount,
      reassigned: reassignedCount,
      notified: notifiedCount,
      total_active_subscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error('Schedule subscription services error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});