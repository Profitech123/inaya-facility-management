import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Mirrors the SERVICE_INTERVALS config from components/dashboard/ServiceHistoryTrends.jsx
const SERVICE_INTERVALS = [
  { keywords: ['ac ', 'air con', 'hvac', 'cooling'], label: 'AC Maintenance', days: 90, urgentAt: 120 },
  { keywords: ['pest'], label: 'Pest Control', days: 90, urgentAt: 120 },
  { keywords: ['clean'], label: 'Cleaning', days: 14, urgentAt: 30 },
  { keywords: ['plumb'], label: 'Plumbing Check', days: 180, urgentAt: 240 },
  { keywords: ['electr'], label: 'Electrical Check', days: 365, urgentAt: 450 },
  { keywords: ['paint'], label: 'Painting', days: 730, urgentAt: 900 },
  { keywords: ['garden', 'landscape'], label: 'Gardening', days: 30, urgentAt: 45 },
  { keywords: ['pool'], label: 'Pool Maintenance', days: 30, urgentAt: 45 },
  { keywords: ['security'], label: 'Security Check', days: 180, urgentAt: 240 },
];

function getInterval(serviceName = '') {
  const name = serviceName.toLowerCase();
  return SERVICE_INTERVALS.find(i => i.keywords.some(k => name.includes(k))) || null;
}

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

async function sendSMS(base44, phone, message) {
  if (!phone) return;
  try {
    await base44.asServiceRole.functions.invoke('sendSMSInternal', { to: phone, message });
  } catch (e) {
    console.warn('SMS failed (non-critical):', e.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automation (no user) or manual admin call
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      isAuthorized = user?.role === 'admin';
    } catch {
      isAuthorized = true; // automation call
    }
    if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { dry_run = false } = await req.json().catch(() => ({}));

    console.log(`overdueMaintenanceAlerts: running (dry_run=${dry_run})`);

    // Load all required data in parallel
    const [customers, completedBookings, services, properties, existingNotifications] = await Promise.all([
      base44.asServiceRole.entities.User.list().then(all => all.filter(u => u.role !== 'admin' && u.email)),
      base44.asServiceRole.entities.Booking.filter({ status: 'completed' }),
      base44.asServiceRole.entities.Service.list(),
      base44.asServiceRole.entities.Property.list(),
      // Fetch notifications from the last 7 days to avoid re-notifying too soon
      base44.asServiceRole.entities.Notification.list('-created_date', 500),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    // Build a set of "user_id:service_keyword" already alerted this week
    const recentAlertKeys = new Set(
      existingNotifications
        .filter(n => n.created_date > sevenDaysAgo && n.type === 'general' && n.title?.includes('Overdue'))
        .map(n => `${n.user_id}:${n.message?.split(':')[0] || ''}`)
    );

    let totalAlerted = 0;
    let totalSkipped = 0;
    const report = [];

    for (const customer of customers) {
      const customerBookings = completedBookings.filter(b => b.customer_id === customer.id);
      if (customerBookings.length === 0) continue;

      // Find the last completed visit per service type
      const lastVisitByInterval = new Map(); // intervalLabel → { lastDate, serviceName }

      for (const booking of customerBookings) {
        const svc = services.find(s => s.id === booking.service_id);
        if (!svc) continue;
        const interval = getInterval(svc.name);
        if (!interval) continue;

        const existing = lastVisitByInterval.get(interval.label);
        if (!existing || booking.scheduled_date > existing.lastDate) {
          lastVisitByInterval.set(interval.label, {
            lastDate: booking.scheduled_date,
            serviceName: svc.name,
            intervalDays: interval.days,
            urgentAt: interval.urgentAt,
          });
        }
      }

      // Determine which services are overdue or urgently due
      const overdueServices = [];
      const urgentServices = [];

      for (const [label, info] of lastVisitByInterval.entries()) {
        const age = daysSince(info.lastDate);
        if (age >= info.urgentAt) {
          overdueServices.push({ label, age, lastDate: info.lastDate, recommended: info.intervalDays });
        } else if (age >= info.intervalDays) {
          urgentServices.push({ label, age, lastDate: info.lastDate, recommended: info.intervalDays });
        }
      }

      const allDue = [...overdueServices, ...urgentServices];
      if (allDue.length === 0) {
        totalSkipped++;
        continue;
      }

      // Build alert key to avoid duplicate alerts this week
      const alertKey = `${customer.id}:${allDue.map(s => s.label).join(',')}`;
      if (recentAlertKeys.has(alertKey)) {
        console.log(`Skipping ${customer.email} — already alerted this week`);
        totalSkipped++;
        continue;
      }

      // Get customer properties for context
      const customerProperties = properties.filter(p => p.owner_id === customer.id);
      const propertyText = customerProperties.length > 0
        ? customerProperties.map(p => p.address).join(', ')
        : 'your property';

      // Build message
      const overdueLabels = overdueServices.map(s => s.label);
      const urgentLabels = urgentServices.map(s => s.label);

      const allLabels = [
        ...overdueLabels.map(l => `${l} (overdue)`),
        ...urgentLabels.map(l => `${l} (due)`),
      ];

      const smsMessage = `INAYA: ${allLabels.slice(0, 2).join(' & ')} ${allLabels.length === 1 ? 'is' : 'are'} overdue for ${customerProperties[0]?.address || 'your property'}. Book now: inaya.ae or call +971 4 815 7300`;

      const notifTitle = overdueLabels.length > 0
        ? `⚠️ Overdue Maintenance: ${overdueLabels.slice(0, 2).join(', ')}`
        : `🔔 Maintenance Due: ${urgentLabels.slice(0, 2).join(', ')}`;

      const notifMessage = `${allLabels.join(', ')} — ${overdueLabels.length > 0 ? 'overdue' : 'due'} for ${customerProperties[0]?.address || 'your property'}. Tap to book your next visit.`;

      const emailHtml = buildEmailHtml(customer, overdueServices, urgentServices, propertyText);

      report.push({
        customer: customer.email,
        overdue: overdueLabels,
        due: urgentLabels,
        property: propertyText,
      });

      if (dry_run) continue;

      // 1. In-app notification
      await base44.asServiceRole.entities.Notification.create({
        user_id: customer.id,
        type: 'general',
        title: notifTitle,
        message: notifMessage,
        link_page: 'OnDemandServices',
      });

      // 2. SMS (non-blocking)
      if (customer.phone) {
        await sendSMS(base44, customer.phone, smsMessage);
      }

      // 3. Email
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `INAYA: Maintenance Due for ${customerProperties[0]?.address || 'Your Property'}`,
          body: emailHtml,
          from_name: 'INAYA Maintenance Team',
        });
      } catch (emailErr) {
        console.warn(`Email failed for ${customer.email}: ${emailErr.message}`);
      }

      totalAlerted++;
    }

    console.log(`overdueMaintenanceAlerts: ${totalAlerted} customers alerted, ${totalSkipped} skipped (up to date or recently notified)`);
    return Response.json({ success: true, dry_run, alerted: totalAlerted, skipped: totalSkipped, report });
  } catch (error) {
    console.error('overdueMaintenanceAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildEmailHtml(customer, overdueServices, urgentServices, propertyText) {
  const isUrgent = overdueServices.length > 0;
  const accentColor = isUrgent ? '#dc2626' : '#d97706';
  const headerBg = isUrgent
    ? 'linear-gradient(135deg,#7f1d1d,#dc2626)'
    : 'linear-gradient(135deg,#78350f,#d97706)';
  const icon = isUrgent ? '⚠️' : '🔔';
  const headline = isUrgent ? 'Overdue Maintenance Alert' : 'Maintenance Due Reminder';

  const serviceRows = [
    ...overdueServices.map(s => ({
      label: s.label,
      badge: 'OVERDUE',
      badgeColor: '#dc2626',
      detail: `Last done ${s.age} days ago · recommended every ${s.recommended} days`,
    })),
    ...urgentServices.map(s => ({
      label: s.label,
      badge: 'DUE NOW',
      badgeColor: '#d97706',
      detail: `Last done ${s.age} days ago · recommended every ${s.recommended} days`,
    })),
  ];

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6">
<div style="max-width:600px;margin:30px auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:${headerBg};color:white;padding:30px 25px;text-align:center">
    <div style="font-size:36px;margin-bottom:8px">${icon}</div>
    <h2 style="margin:0;font-size:22px">${headline}</h2>
    <p style="margin:6px 0 0;opacity:.85;font-size:14px">${propertyText}</p>
  </div>

  <div style="background:#fff;padding:28px 25px">
    <p style="margin:0 0 6px;color:#374151;font-size:15px">Hi ${customer.full_name || 'Valued Customer'},</p>
    <p style="margin:0 0 22px;color:#6b7280;font-size:14px;line-height:1.6">
      Based on your service history, the following maintenance items need attention for ${propertyText}:
    </p>

    ${serviceRows.map(r => `
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:600;color:#111827;font-size:14px">${r.label}</div>
        <div style="color:#9ca3af;font-size:12px;margin-top:3px">${r.detail}</div>
      </div>
      <span style="background:${r.badgeColor};color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;margin-left:12px">${r.badge}</span>
    </div>`).join('')}

    <div style="text-align:center;margin:28px 0 10px">
      <a href="https://inaya.ae/OnDemandServices"
         style="display:inline-block;background:${accentColor};color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
        Book My Next Service
      </a>
    </div>

    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:20px">
      Questions? Call <strong>+971 4 815 7300</strong> or email <strong>info@inaya.ae</strong>
    </p>
  </div>

  <div style="background:#f9fafb;padding:14px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb">
    © 2026 INAYA Facilities Management Services L.L.C. · <a href="https://inaya.ae" style="color:#9ca3af">inaya.ae</a>
  </div>
</div>
</body>
</html>`;
}