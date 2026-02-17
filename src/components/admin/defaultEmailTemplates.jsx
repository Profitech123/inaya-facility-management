/* eslint-disable */
// Default email template definitions
// Stored in a .js file to avoid JSX parser issues with {{ }} in strings

const ph = (name) => "{{" + name + "}}";

const DEFAULT_TEMPLATES = [
  {
    template_key: "booking_confirmed",
    name: "Booking Confirmed",
    description: "Sent when a booking is confirmed by admin",
    category: "booking",
    subject: "Your booking " + ph("booking_id") + " has been confirmed",
    body:
      "<h2>Booking Confirmed!</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your booking <strong>" + ph("booking_id") + "</strong> for <strong>" + ph("service_name") + "</strong> has been confirmed.</p>" +
      "<p><strong>Date:</strong> " + ph("scheduled_date") + "<br/><strong>Time:</strong> " + ph("scheduled_time") + "<br/><strong>Amount:</strong> AED " + ph("total_amount") + "</p>" +
      "<p>Our technician " + ph("provider_name") + " will be assigned to your service. We will notify you when they are on the way.</p>" +
      "<p>Thank you for choosing " + ph("company_name") + ".</p>",
    placeholders: ["customer_name", "customer_email", "booking_id", "service_name", "scheduled_date", "scheduled_time", "total_amount", "provider_name", "property_address", "company_name"],
    is_active: true,
  },
  {
    template_key: "booking_status_update",
    name: "Booking Status Update",
    description: "Sent when booking status changes (en route, in progress, completed)",
    category: "booking",
    subject: "Booking " + ph("booking_id") + " - Status Update",
    body:
      "<h2>Booking Update</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your booking <strong>" + ph("booking_id") + "</strong> for <strong>" + ph("service_name") + "</strong> has been updated.</p>" +
      "<p><strong>New Status:</strong> " + ph("booking_status") + "</p>" +
      "<p><strong>Date:</strong> " + ph("scheduled_date") + " at " + ph("scheduled_time") + "</p>" +
      "<p>If you have any questions, feel free to reach out to our support team.</p>" +
      "<p>Best regards,<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "booking_id", "service_name", "booking_status", "scheduled_date", "scheduled_time", "provider_name", "company_name"],
    is_active: true,
  },
  {
    template_key: "booking_cancelled",
    name: "Booking Cancelled",
    description: "Sent when a booking is cancelled",
    category: "booking",
    subject: "Booking " + ph("booking_id") + " has been cancelled",
    body:
      "<h2>Booking Cancelled</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your booking <strong>" + ph("booking_id") + "</strong> for <strong>" + ph("service_name") + "</strong> scheduled on " + ph("scheduled_date") + " has been cancelled.</p>" +
      "<p><strong>Cancellation reason:</strong> " + ph("cancellation_reason") + "</p>" +
      "<p>If a refund is applicable, it will be processed within 5-7 business days.</p>" +
      "<p>We hope to serve you again soon.<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "booking_id", "service_name", "scheduled_date", "cancellation_reason", "total_amount", "company_name"],
    is_active: true,
  },
  {
    template_key: "technician_assigned",
    name: "Technician Assigned",
    description: "Sent when a technician is assigned to a booking",
    category: "booking",
    subject: "A technician has been assigned to booking " + ph("booking_id"),
    body:
      "<h2>Technician Assigned</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Good news! <strong>" + ph("provider_name") + "</strong> has been assigned to your upcoming service.</p>" +
      "<p><strong>Service:</strong> " + ph("service_name") + "<br/><strong>Date:</strong> " + ph("scheduled_date") + "<br/><strong>Time:</strong> " + ph("scheduled_time") + "</p>" +
      "<p>You will receive a notification when your technician is en route.</p>" +
      "<p>Best regards,<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "booking_id", "service_name", "provider_name", "scheduled_date", "scheduled_time", "company_name"],
    is_active: true,
  },
  {
    template_key: "technician_en_route",
    name: "Technician En Route",
    description: "Sent when the technician is on the way",
    category: "booking",
    subject: "Your technician is on the way! - Booking " + ph("booking_id"),
    body:
      "<h2>Technician En Route</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your technician <strong>" + ph("provider_name") + "</strong> is now on the way to your property at <strong>" + ph("property_address") + "</strong>.</p>" +
      "<p><strong>Service:</strong> " + ph("service_name") + "<br/><strong>Booking:</strong> " + ph("booking_id") + "</p>" +
      "<p>Please ensure access is available. See you shortly!</p>" +
      "<p>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "provider_name", "property_address", "service_name", "booking_id", "company_name"],
    is_active: true,
  },
  {
    template_key: "service_completed",
    name: "Service Completed",
    description: "Sent after a service is marked complete",
    category: "booking",
    subject: "Service completed - Booking " + ph("booking_id"),
    body:
      "<h2>Service Completed!</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your service <strong>" + ph("service_name") + "</strong> (Booking " + ph("booking_id") + ") has been completed successfully.</p>" +
      "<p><strong>Completed by:</strong> " + ph("provider_name") + "<br/><strong>Total:</strong> AED " + ph("total_amount") + "</p>" +
      "<p>We would love to hear your feedback! Please rate your experience in the app.</p>" +
      "<p>Thank you for trusting " + ph("company_name") + ".</p>",
    placeholders: ["customer_name", "booking_id", "service_name", "provider_name", "total_amount", "company_name"],
    is_active: true,
  },
  {
    template_key: "invoice_sent",
    name: "Invoice Sent",
    description: "Sent when a new invoice is generated",
    category: "invoice",
    subject: "Invoice " + ph("invoice_number") + " from INAYA",
    body:
      "<h2>Invoice</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>A new invoice has been generated for your account.</p>" +
      "<p><strong>Invoice #:</strong> " + ph("invoice_number") + "<br/><strong>Amount:</strong> AED " + ph("total_amount") + "<br/><strong>Due Date:</strong> " + ph("due_date") + "</p>" +
      "<p>Please ensure payment is made by the due date to avoid any service interruptions.</p>" +
      "<p>Thank you,<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "customer_email", "invoice_number", "total_amount", "due_date", "company_name"],
    is_active: true,
  },
  {
    template_key: "payment_received",
    name: "Payment Received",
    description: "Sent when payment is successfully processed",
    category: "invoice",
    subject: "Payment received - " + ph("invoice_number"),
    body:
      "<h2>Payment Received</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>We have received your payment for invoice <strong>" + ph("invoice_number") + "</strong>.</p>" +
      "<p><strong>Amount:</strong> AED " + ph("total_amount") + "<br/><strong>Payment Method:</strong> " + ph("payment_method") + "</p>" +
      "<p>Thank you for your prompt payment!<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "invoice_number", "total_amount", "payment_method", "company_name"],
    is_active: true,
  },
  {
    template_key: "subscription_activated",
    name: "Subscription Activated",
    description: "Sent when a new subscription starts",
    category: "subscription",
    subject: "Welcome to " + ph("subscription_name") + "!",
    body:
      "<h2>Subscription Activated</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your subscription to <strong>" + ph("subscription_name") + "</strong> is now active!</p>" +
      "<p><strong>Monthly Amount:</strong> AED " + ph("monthly_amount") + "<br/><strong>Start Date:</strong> " + ph("start_date") + "<br/><strong>Property:</strong> " + ph("property_address") + "</p>" +
      "<p>Your scheduled services will begin as per your plan. You can manage your subscription from your dashboard at any time.</p>" +
      "<p>Welcome aboard!<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "subscription_name", "monthly_amount", "start_date", "property_address", "company_name"],
    is_active: true,
  },
  {
    template_key: "subscription_renewal_reminder",
    name: "Subscription Renewal Reminder",
    description: "Sent before subscription auto-renews",
    category: "subscription",
    subject: "Your subscription renews soon",
    body:
      "<h2>Renewal Reminder</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your <strong>" + ph("subscription_name") + "</strong> subscription is set to renew on <strong>" + ph("renewal_date") + "</strong>.</p>" +
      "<p><strong>Amount:</strong> AED " + ph("monthly_amount") + "</p>" +
      "<p>No action is needed if you wish to continue. To modify or cancel, please visit your dashboard before the renewal date.</p>" +
      "<p>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "subscription_name", "renewal_date", "monthly_amount", "company_name"],
    is_active: true,
  },
  {
    template_key: "subscription_cancelled",
    name: "Subscription Cancelled",
    description: "Sent when subscription is cancelled",
    category: "subscription",
    subject: "Subscription cancelled - " + ph("subscription_name"),
    body:
      "<h2>Subscription Cancelled</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your subscription to <strong>" + ph("subscription_name") + "</strong> has been cancelled as requested.</p>" +
      "<p>Your remaining services will continue until <strong>" + ph("end_date") + "</strong>.</p>" +
      "<p>We are sorry to see you go. If you change your mind, you can resubscribe anytime from your dashboard.</p>" +
      "<p>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "subscription_name", "end_date", "company_name"],
    is_active: true,
  },
  {
    template_key: "support_ticket_created",
    name: "Support Ticket Created",
    description: "Sent when a customer creates a support ticket",
    category: "support",
    subject: "Support ticket received - #" + ph("ticket_number"),
    body:
      "<h2>We Got Your Request</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your support ticket <strong>#" + ph("ticket_number") + "</strong> has been received and is being reviewed.</p>" +
      "<p><strong>Subject:</strong> " + ph("ticket_subject") + "<br/><strong>Priority:</strong> " + ph("ticket_priority") + "</p>" +
      "<p>Our team will get back to you shortly. You can track the status from your dashboard.</p>" +
      "<p>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "ticket_number", "ticket_subject", "ticket_priority", "company_name"],
    is_active: true,
  },
  {
    template_key: "support_ticket_resolved",
    name: "Support Ticket Resolved",
    description: "Sent when a support ticket is resolved",
    category: "support",
    subject: "Ticket #" + ph("ticket_number") + " resolved",
    body:
      "<h2>Ticket Resolved</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>Your support ticket <strong>#" + ph("ticket_number") + "</strong> has been resolved.</p>" +
      "<p><strong>Resolution:</strong> " + ph("resolution_notes") + "</p>" +
      "<p>If you need further assistance, feel free to open a new ticket or contact us directly.</p>" +
      "<p>Best regards,<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "ticket_number", "resolution_notes", "company_name"],
    is_active: true,
  },
  {
    template_key: "booking_reminder",
    name: "Booking Reminder",
    description: "Sent 24h before a scheduled service",
    category: "booking",
    subject: "Reminder: Service tomorrow - " + ph("service_name"),
    body:
      "<h2>Service Reminder</h2><p>Dear " + ph("customer_name") + ",</p>" +
      "<p>This is a friendly reminder that your <strong>" + ph("service_name") + "</strong> service is scheduled for tomorrow.</p>" +
      "<p><strong>Date:</strong> " + ph("scheduled_date") + "<br/><strong>Time:</strong> " + ph("scheduled_time") + "<br/><strong>Property:</strong> " + ph("property_address") + "</p>" +
      "<p>Please ensure access is available for our technician. If you need to reschedule, please do so from your dashboard.</p>" +
      "<p>See you tomorrow!<br/>" + ph("company_name") + "</p>",
    placeholders: ["customer_name", "service_name", "scheduled_date", "scheduled_time", "property_address", "booking_id", "company_name"],
    is_active: true,
  },
];

export default DEFAULT_TEMPLATES;