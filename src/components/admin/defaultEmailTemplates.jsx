/* eslint-disable */
// Default email template definitions
// Stored in a .js file to avoid JSX parser issues with {{ }} in strings

const ph = (name) => "{{" + name + "}}";

// Shared branded HTML wrapper
const wrap = (contentHtml) => `
<div style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b 0%,#065f46 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:12px;padding:10px 20px;margin-bottom:12px;">
                <span style="color:#6ee7b7;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">INAYA Facilities Management</span>
              </div>
              <div style="color:#ffffff;font-size:11px;margin-top:4px;opacity:0.65;">A Member of Belhasa Group · Dubai, UAE</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#64748b;font-size:12px;">Need help? Contact us at <a href="mailto:customerservice@inaya.ae" style="color:#059669;text-decoration:none;">customerservice@inaya.ae</a> or call +971 4 815 7300</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 INAYA Facilities Management Services L.L.C. · 28th Street, Hor Al Anz East, Dubai, UAE</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
`;

// Reusable detail row
const detailRow = (label, value) =>
  `<tr>
    <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:40%;font-weight:500;">${label}</td>
    <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;

// Detail table wrapper
const detailTable = (rows) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:20px 0;">${rows}</table>`;

// Heading block
const heading = (icon, title, subtitle = '') =>
  `<div style="margin-bottom:28px;">
    <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
    <h1 style="margin:0 0 6px;color:#0f172a;font-size:22px;font-weight:700;">${title}</h1>
    ${subtitle ? `<p style="margin:0;color:#64748b;font-size:14px;">${subtitle}</p>` : ''}
  </div>`;

const greeting = (name) =>
  `<p style="margin:0 0 20px;color:#334155;font-size:15px;">Dear <strong>${name}</strong>,</p>`;

const paragraph = (text) =>
  `<p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.7;">${text}</p>`;

const ctaButton = (text, url = '#') =>
  `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#059669;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">${text}</a>
  </div>`;

const alertBox = (text, type = 'info') => {
  const colors = {
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: 'ℹ️' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '❌' },
  };
  const c = colors[type] || colors.info;
  return `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:10px;padding:14px 16px;margin:20px 0;color:${c.text};font-size:13px;line-height:1.6;">${c.icon} ${text}</div>`;
};

const signOff = (company) =>
  `<div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;">
    <p style="margin:0 0 4px;color:#334155;font-size:14px;font-weight:600;">${company}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px;">INAYA Facilities Management · inaya.ae</p>
  </div>`;


const DEFAULT_TEMPLATES = [
  {
    template_key: "booking_confirmed",
    name: "Booking Confirmed",
    description: "Sent when a booking is confirmed by admin",
    category: "booking",
    subject: "✅ Booking " + ph("booking_id") + " Confirmed",
    body: wrap(
      heading('🗓️', 'Booking Confirmed!', 'Your service has been scheduled and is confirmed.') +
      greeting(ph("customer_name")) +
      paragraph('Great news! Your booking has been confirmed. Here are your service details:') +
      detailTable(
        detailRow('Booking ID', ph("booking_id")) +
        detailRow('Service', ph("service_name")) +
        detailRow('Date', ph("scheduled_date")) +
        detailRow('Time', ph("scheduled_time")) +
        detailRow('Property', ph("property_address")) +
        detailRow('Amount', 'AED ' + ph("total_amount")) +
        detailRow('Technician', ph("provider_name"))
      ) +
      alertBox('Our technician will contact you before arriving. Please ensure property access is available.', 'info') +
      ctaButton('View Booking Details', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "customer_email", "booking_id", "service_name", "scheduled_date", "scheduled_time", "total_amount", "provider_name", "property_address", "company_name"],
    is_active: true,
  },
  {
    template_key: "booking_status_update",
    name: "Booking Status Update",
    description: "Sent when booking status changes (en route, in progress, completed)",
    category: "booking",
    subject: "📋 Booking " + ph("booking_id") + " — Status Update",
    body: wrap(
      heading('🔔', 'Booking Status Update', 'Your booking status has changed.') +
      greeting(ph("customer_name")) +
      paragraph('We wanted to let you know that your booking status has been updated.') +
      detailTable(
        detailRow('Booking ID', ph("booking_id")) +
        detailRow('Service', ph("service_name")) +
        detailRow('New Status', ph("booking_status")) +
        detailRow('Date', ph("scheduled_date")) +
        detailRow('Time', ph("scheduled_time")) +
        detailRow('Technician', ph("provider_name"))
      ) +
      paragraph('If you have any questions or concerns about your booking, please don\'t hesitate to contact our support team.') +
      ctaButton('Track Your Booking', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "booking_id", "service_name", "booking_status", "scheduled_date", "scheduled_time", "provider_name", "company_name"],
    is_active: true,
  },
  {
    template_key: "booking_cancelled",
    name: "Booking Cancelled",
    description: "Sent when a booking is cancelled",
    category: "booking",
    subject: "❌ Booking " + ph("booking_id") + " Cancelled",
    body: wrap(
      heading('❌', 'Booking Cancelled', 'Your booking has been cancelled as requested.') +
      greeting(ph("customer_name")) +
      paragraph('We\'re sorry to inform you that your booking has been cancelled. Here are the details:') +
      detailTable(
        detailRow('Booking ID', ph("booking_id")) +
        detailRow('Service', ph("service_name")) +
        detailRow('Scheduled Date', ph("scheduled_date")) +
        detailRow('Cancellation Reason', ph("cancellation_reason")) +
        detailRow('Amount', 'AED ' + ph("total_amount"))
      ) +
      alertBox('If a refund is applicable, it will be processed within 5–7 business days to your original payment method.', 'warning') +
      paragraph('We hope to have the opportunity to serve you again. You can book a new service at any time from your dashboard.') +
      ctaButton('Book a New Service', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "booking_id", "service_name", "scheduled_date", "cancellation_reason", "total_amount", "company_name"],
    is_active: true,
  },
  {
    template_key: "technician_assigned",
    name: "Technician Assigned",
    description: "Sent when a technician is assigned to a booking",
    category: "booking",
    subject: "👷 Technician Assigned — Booking " + ph("booking_id"),
    body: wrap(
      heading('👷', 'Your Technician is Assigned!', 'A qualified professional has been assigned to your service.') +
      greeting(ph("customer_name")) +
      paragraph('We\'re pleased to inform you that a technician has been assigned to your upcoming service visit.') +
      detailTable(
        detailRow('Booking ID', ph("booking_id")) +
        detailRow('Service', ph("service_name")) +
        detailRow('Assigned Technician', ph("provider_name")) +
        detailRow('Date', ph("scheduled_date")) +
        detailRow('Time', ph("scheduled_time"))
      ) +
      alertBox('You will receive another notification when your technician is en route to your property.', 'info') +
      ctaButton('View Booking Details', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "booking_id", "service_name", "provider_name", "scheduled_date", "scheduled_time", "company_name"],
    is_active: true,
  },
  {
    template_key: "technician_en_route",
    name: "Technician En Route",
    description: "Sent when the technician is on the way",
    category: "booking",
    subject: "🚗 Your Technician is On the Way!",
    body: wrap(
      heading('🚗', 'Your Technician is En Route!', 'Please ensure access is available at your property.') +
      greeting(ph("customer_name")) +
      paragraph('<strong>' + ph("provider_name") + '</strong> is now heading to your property and will arrive shortly.') +
      detailTable(
        detailRow('Booking ID', ph("booking_id")) +
        detailRow('Service', ph("service_name")) +
        detailRow('Technician', ph("provider_name")) +
        detailRow('Property', ph("property_address"))
      ) +
      alertBox('Please make sure the property is accessible. If you need to reach your technician, contact our support team.', 'success') +
      ctaButton('Track on Map', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "provider_name", "property_address", "service_name", "booking_id", "company_name"],
    is_active: true,
  },
  {
    template_key: "service_completed",
    name: "Service Completed",
    description: "Sent after a service is marked complete",
    category: "booking",
    subject: "🎉 Service Completed — Booking " + ph("booking_id"),
    body: wrap(
      heading('🎉', 'Service Completed!', 'Your service has been successfully completed.') +
      greeting(ph("customer_name")) +
      paragraph('We\'re glad to inform you that your service has been completed successfully. Here\'s a summary:') +
      detailTable(
        detailRow('Booking ID', ph("booking_id")) +
        detailRow('Service', ph("service_name")) +
        detailRow('Completed By', ph("provider_name")) +
        detailRow('Total Amount', 'AED ' + ph("total_amount"))
      ) +
      `<div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin:20px 0;text-align:center;">
        <div style="font-size:24px;margin-bottom:8px;">⭐⭐⭐⭐⭐</div>
        <p style="margin:0 0 12px;color:#166534;font-size:14px;font-weight:600;">How was your experience?</p>
        <p style="margin:0 0 16px;color:#4b5563;font-size:13px;">Your feedback helps us maintain the highest standards of service.</p>
        <a href="#" style="display:inline-block;background:#059669;color:#ffffff;font-size:13px;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;">Leave a Review</a>
      </div>` +
      paragraph('Thank you for trusting ' + ph("company_name") + ' with your property maintenance needs.') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "booking_id", "service_name", "provider_name", "total_amount", "company_name"],
    is_active: true,
  },
  {
    template_key: "invoice_sent",
    name: "Invoice Sent",
    description: "Sent when a new invoice is generated",
    category: "invoice",
    subject: "🧾 Invoice " + ph("invoice_number") + " from INAYA",
    body: wrap(
      heading('🧾', 'Your Invoice is Ready', 'Please review and settle the payment by the due date.') +
      greeting(ph("customer_name")) +
      paragraph('A new invoice has been generated for your account. Please find the details below:') +
      detailTable(
        detailRow('Invoice Number', ph("invoice_number")) +
        detailRow('Amount Due', 'AED ' + ph("total_amount")) +
        detailRow('Due Date', ph("due_date"))
      ) +
      alertBox('Please ensure payment is made by the due date to avoid any service interruptions.', 'warning') +
      ctaButton('View & Pay Invoice', '#') +
      paragraph('If you have any questions regarding this invoice, please contact our billing team.') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "customer_email", "invoice_number", "total_amount", "due_date", "company_name"],
    is_active: true,
  },
  {
    template_key: "payment_received",
    name: "Payment Received",
    description: "Sent when payment is successfully processed",
    category: "invoice",
    subject: "✅ Payment Received — " + ph("invoice_number"),
    body: wrap(
      heading('💳', 'Payment Received', 'Thank you — your payment has been successfully processed.') +
      greeting(ph("customer_name")) +
      paragraph('We have successfully received your payment. Here are the payment details for your records:') +
      detailTable(
        detailRow('Invoice Number', ph("invoice_number")) +
        detailRow('Amount Paid', 'AED ' + ph("total_amount")) +
        detailRow('Payment Method', ph("payment_method"))
      ) +
      alertBox('Your payment has been recorded. A receipt will be available in your account dashboard.', 'success') +
      paragraph('Thank you for your prompt payment. We appreciate your trust in ' + ph("company_name") + '.') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "invoice_number", "total_amount", "payment_method", "company_name"],
    is_active: true,
  },
  {
    template_key: "subscription_activated",
    name: "Subscription Activated",
    description: "Sent when a new subscription starts",
    category: "subscription",
    subject: "🌟 Welcome to " + ph("subscription_name") + "!",
    body: wrap(
      heading('🌟', 'Welcome to Your Plan!', 'Your subscription is now active and services are being scheduled.') +
      greeting(ph("customer_name")) +
      paragraph('We\'re thrilled to welcome you! Your subscription plan is now active and we\'re ready to take care of your property.') +
      detailTable(
        detailRow('Plan', ph("subscription_name")) +
        detailRow('Monthly Amount', 'AED ' + ph("monthly_amount")) +
        detailRow('Start Date', ph("start_date")) +
        detailRow('Property', ph("property_address"))
      ) +
      `<div style="background:linear-gradient(135deg,#064e3b,#065f46);border-radius:12px;padding:24px;margin:20px 0;color:#ffffff;text-align:center;">
        <p style="margin:0 0 8px;font-size:15px;font-weight:700;">Your services will be automatically scheduled</p>
        <p style="margin:0;font-size:13px;opacity:0.8;">Sit back and relax — we handle everything from scheduling to completion.</p>
      </div>` +
      ctaButton('Manage My Subscription', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "subscription_name", "monthly_amount", "start_date", "property_address", "company_name"],
    is_active: true,
  },
  {
    template_key: "subscription_renewal_reminder",
    name: "Subscription Renewal Reminder",
    description: "Sent before subscription auto-renews",
    category: "subscription",
    subject: "🔄 Your Subscription Renews Soon",
    body: wrap(
      heading('🔄', 'Renewal Reminder', 'Your subscription is set to auto-renew soon.') +
      greeting(ph("customer_name")) +
      paragraph('This is a friendly reminder that your subscription is scheduled to automatically renew.') +
      detailTable(
        detailRow('Plan', ph("subscription_name")) +
        detailRow('Renewal Date', ph("renewal_date")) +
        detailRow('Amount', 'AED ' + ph("monthly_amount"))
      ) +
      alertBox('No action is needed if you wish to continue your plan. To modify or cancel, please visit your dashboard <strong>before the renewal date</strong>.', 'info') +
      ctaButton('Manage Subscription', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "subscription_name", "renewal_date", "monthly_amount", "company_name"],
    is_active: true,
  },
  {
    template_key: "subscription_cancelled",
    name: "Subscription Cancelled",
    description: "Sent when subscription is cancelled",
    category: "subscription",
    subject: "Subscription Cancelled — " + ph("subscription_name"),
    body: wrap(
      heading('📋', 'Subscription Cancelled', 'Your cancellation request has been processed.') +
      greeting(ph("customer_name")) +
      paragraph('We have processed your cancellation request. We\'re sorry to see you go!') +
      detailTable(
        detailRow('Plan', ph("subscription_name")) +
        detailRow('Services Active Until', ph("end_date"))
      ) +
      alertBox('Your remaining scheduled services will continue until the end date above.', 'info') +
      paragraph('If you change your mind or need property maintenance in the future, you can resubscribe or book individual services at any time.') +
      ctaButton('Explore Services', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "subscription_name", "end_date", "company_name"],
    is_active: true,
  },
  {
    template_key: "support_ticket_created",
    name: "Support Ticket Created",
    description: "Sent when a customer creates a support ticket",
    category: "support",
    subject: "🎫 Support Ticket #" + ph("ticket_number") + " Received",
    body: wrap(
      heading('🎫', 'Support Request Received', 'We\'ve got your message and our team is on it.') +
      greeting(ph("customer_name")) +
      paragraph('Thank you for reaching out. Your support request has been received and assigned to our team.') +
      detailTable(
        detailRow('Ticket Number', '#' + ph("ticket_number")) +
        detailRow('Subject', ph("ticket_subject")) +
        detailRow('Priority', ph("ticket_priority")) +
        detailRow('Status', 'Open — Under Review')
      ) +
      alertBox('Our support team aims to respond within 4 business hours for standard tickets and within 1 hour for urgent requests.', 'info') +
      paragraph('You can track the status of your ticket at any time from your dashboard.') +
      ctaButton('Track Ticket Status', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "ticket_number", "ticket_subject", "ticket_priority", "company_name"],
    is_active: true,
  },
  {
    template_key: "support_ticket_resolved",
    name: "Support Ticket Resolved",
    description: "Sent when a support ticket is resolved",
    category: "support",
    subject: "✅ Ticket #" + ph("ticket_number") + " Resolved",
    body: wrap(
      heading('✅', 'Ticket Resolved!', 'Your support request has been successfully resolved.') +
      greeting(ph("customer_name")) +
      paragraph('We\'re pleased to inform you that your support ticket has been resolved by our team.') +
      detailTable(
        detailRow('Ticket Number', '#' + ph("ticket_number")) +
        detailRow('Status', 'Resolved')
      ) +
      `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#475569;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Resolution Notes</p>
        <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.6;">` + ph("resolution_notes") + `</p>
      </div>` +
      paragraph('If you need further assistance or have additional questions, please don\'t hesitate to open a new ticket.') +
      ctaButton('Open a New Ticket', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "ticket_number", "resolution_notes", "company_name"],
    is_active: true,
  },
  {
    template_key: "booking_reminder",
    name: "Booking Reminder",
    description: "Sent 24h before a scheduled service",
    category: "booking",
    subject: "⏰ Service Tomorrow — " + ph("service_name"),
    body: wrap(
      heading('⏰', 'Service Tomorrow!', 'A friendly reminder about your scheduled maintenance.') +
      greeting(ph("customer_name")) +
      paragraph('This is a friendly reminder that you have a service visit scheduled for tomorrow. Please ensure everything is ready!') +
      detailTable(
        detailRow('Service', ph("service_name")) +
        detailRow('Date', ph("scheduled_date")) +
        detailRow('Time', ph("scheduled_time")) +
        detailRow('Property', ph("property_address")) +
        detailRow('Booking ID', ph("booking_id"))
      ) +
      `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;">📋 Before Tomorrow — Checklist</p>
        <ul style="margin:0;padding-left:18px;color:#92400e;font-size:13px;line-height:1.8;">
          <li>Ensure property access is available</li>
          <li>Keep the service area accessible</li>
          <li>Have any relevant information ready for the technician</li>
        </ul>
      </div>` +
      paragraph('Need to reschedule? You can do so from your dashboard up to 24 hours before the service.') +
      ctaButton('View or Reschedule Booking', '#') +
      signOff(ph("company_name"))
    ),
    placeholders: ["customer_name", "service_name", "scheduled_date", "scheduled_time", "property_address", "booking_id", "company_name"],
    is_active: true,
  },
];

export default DEFAULT_TEMPLATES;