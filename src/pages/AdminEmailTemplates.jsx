import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Pencil, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import EmailTemplateEditor from '../components/admin/EmailTemplateEditor';

const DEFAULT_TEMPLATES = [
  {
    template_key: 'booking_confirmed',
    name: 'Booking Confirmed',
    description: 'Sent when a booking is confirmed by admin',
    category: 'booking',
    subject: 'Your booking {{booking_id}} has been confirmed',
    body: '<h2>Booking Confirmed!</h2><p>Dear {{customer_name}},</p><p>Your booking <strong>{{booking_id}}</strong> for <strong>{{service_name}}</strong> has been confirmed.</p><p><strong>Date:</strong> {{scheduled_date}}<br/><strong>Time:</strong> {{scheduled_time}}<br/><strong>Amount:</strong> AED {{total_amount}}</p><p>Our technician {{provider_name}} will be assigned to your service. We'll notify you when they are on the way.</p><p>Thank you for choosing {{company_name}}.</p>',
    placeholders: ['customer_name', 'customer_email', 'booking_id', 'service_name', 'scheduled_date', 'scheduled_time', 'total_amount', 'provider_name', 'property_address', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'booking_status_update',
    name: 'Booking Status Update',
    description: 'Sent when booking status changes (en route, in progress, completed)',
    category: 'booking',
    subject: 'Booking {{booking_id}} – Status Update',
    body: '<h2>Booking Update</h2><p>Dear {{customer_name}},</p><p>Your booking <strong>{{booking_id}}</strong> for <strong>{{service_name}}</strong> has been updated.</p><p><strong>New Status:</strong> {{booking_status}}</p><p><strong>Date:</strong> {{scheduled_date}} at {{scheduled_time}}</p><p>If you have any questions, feel free to reach out to our support team.</p><p>Best regards,<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'booking_id', 'service_name', 'booking_status', 'scheduled_date', 'scheduled_time', 'provider_name', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'booking_cancelled',
    name: 'Booking Cancelled',
    description: 'Sent when a booking is cancelled',
    category: 'booking',
    subject: 'Booking {{booking_id}} has been cancelled',
    body: '<h2>Booking Cancelled</h2><p>Dear {{customer_name}},</p><p>Your booking <strong>{{booking_id}}</strong> for <strong>{{service_name}}</strong> scheduled on {{scheduled_date}} has been cancelled.</p><p><strong>Cancellation reason:</strong> {{cancellation_reason}}</p><p>If a refund is applicable, it will be processed within 5-7 business days.</p><p>We hope to serve you again soon.<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'booking_id', 'service_name', 'scheduled_date', 'cancellation_reason', 'total_amount', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'technician_assigned',
    name: 'Technician Assigned',
    description: 'Sent when a technician is assigned to a booking',
    category: 'booking',
    subject: 'A technician has been assigned to booking {{booking_id}}',
    body: '<h2>Technician Assigned</h2><p>Dear {{customer_name}},</p><p>Good news! <strong>{{provider_name}}</strong> has been assigned to your upcoming service.</p><p><strong>Service:</strong> {{service_name}}<br/><strong>Date:</strong> {{scheduled_date}}<br/><strong>Time:</strong> {{scheduled_time}}</p><p>You will receive a notification when your technician is en route.</p><p>Best regards,<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'booking_id', 'service_name', 'provider_name', 'scheduled_date', 'scheduled_time', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'technician_en_route',
    name: 'Technician En Route',
    description: 'Sent when the technician is on the way',
    category: 'booking',
    subject: 'Your technician is on the way! – Booking {{booking_id}}',
    body: '<h2>Technician En Route</h2><p>Dear {{customer_name}},</p><p>Your technician <strong>{{provider_name}}</strong> is now on the way to your property at <strong>{{property_address}}</strong>.</p><p><strong>Service:</strong> {{service_name}}<br/><strong>Booking:</strong> {{booking_id}}</p><p>Please ensure access is available. See you shortly!</p><p>{{company_name}}</p>',
    placeholders: ['customer_name', 'provider_name', 'property_address', 'service_name', 'booking_id', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'service_completed',
    name: 'Service Completed',
    description: 'Sent after a service is marked complete',
    category: 'booking',
    subject: 'Service completed – Booking {{booking_id}}',
    body: '<h2>Service Completed!</h2><p>Dear {{customer_name}},</p><p>Your service <strong>{{service_name}}</strong> (Booking {{booking_id}}) has been completed successfully.</p><p><strong>Completed by:</strong> {{provider_name}}<br/><strong>Total:</strong> AED {{total_amount}}</p><p>We'd love to hear your feedback! Please rate your experience in the app.</p><p>Thank you for trusting {{company_name}}.</p>',
    placeholders: ['customer_name', 'booking_id', 'service_name', 'provider_name', 'total_amount', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'invoice_sent',
    name: 'Invoice Sent',
    description: 'Sent when a new invoice is generated',
    category: 'invoice',
    subject: 'Invoice {{invoice_number}} from INAYA',
    body: '<h2>Invoice</h2><p>Dear {{customer_name}},</p><p>A new invoice has been generated for your account.</p><p><strong>Invoice #:</strong> {{invoice_number}}<br/><strong>Amount:</strong> AED {{total_amount}}<br/><strong>Due Date:</strong> {{due_date}}</p><p>Please ensure payment is made by the due date to avoid any service interruptions.</p><p>Thank you,<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'customer_email', 'invoice_number', 'total_amount', 'due_date', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'payment_received',
    name: 'Payment Received',
    description: 'Sent when payment is successfully processed',
    category: 'invoice',
    subject: 'Payment received – {{invoice_number}}',
    body: '<h2>Payment Received</h2><p>Dear {{customer_name}},</p><p>We have received your payment for invoice <strong>{{invoice_number}}</strong>.</p><p><strong>Amount:</strong> AED {{total_amount}}<br/><strong>Payment Method:</strong> {{payment_method}}</p><p>Thank you for your prompt payment!<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'invoice_number', 'total_amount', 'payment_method', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'subscription_activated',
    name: 'Subscription Activated',
    description: 'Sent when a new subscription starts',
    category: 'subscription',
    subject: 'Welcome to {{subscription_name}}!',
    body: '<h2>Subscription Activated</h2><p>Dear {{customer_name}},</p><p>Your subscription to <strong>{{subscription_name}}</strong> is now active!</p><p><strong>Monthly Amount:</strong> AED {{monthly_amount}}<br/><strong>Start Date:</strong> {{start_date}}<br/><strong>Property:</strong> {{property_address}}</p><p>Your scheduled services will begin as per your plan. You can manage your subscription from your dashboard at any time.</p><p>Welcome aboard!<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'subscription_name', 'monthly_amount', 'start_date', 'property_address', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'subscription_renewal_reminder',
    name: 'Subscription Renewal Reminder',
    description: 'Sent before subscription auto-renews',
    category: 'subscription',
    subject: 'Your subscription renews soon',
    body: '<h2>Renewal Reminder</h2><p>Dear {{customer_name}},</p><p>Your <strong>{{subscription_name}}</strong> subscription is set to renew on <strong>{{renewal_date}}</strong>.</p><p><strong>Amount:</strong> AED {{monthly_amount}}</p><p>No action is needed if you wish to continue. To modify or cancel, please visit your dashboard before the renewal date.</p><p>{{company_name}}</p>',
    placeholders: ['customer_name', 'subscription_name', 'renewal_date', 'monthly_amount', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'subscription_cancelled',
    name: 'Subscription Cancelled',
    description: 'Sent when subscription is cancelled',
    category: 'subscription',
    subject: 'Subscription cancelled – {{subscription_name}}',
    body: '<h2>Subscription Cancelled</h2><p>Dear {{customer_name}},</p><p>Your subscription to <strong>{{subscription_name}}</strong> has been cancelled as requested.</p><p>Your remaining services will continue until <strong>{{end_date}}</strong>.</p><p>We're sorry to see you go. If you change your mind, you can resubscribe anytime from your dashboard.</p><p>{{company_name}}</p>',
    placeholders: ['customer_name', 'subscription_name', 'end_date', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'support_ticket_created',
    name: 'Support Ticket Created',
    description: 'Sent when a customer creates a support ticket',
    category: 'support',
    subject: 'Support ticket received – #{{ticket_number}}',
    body: '<h2>We Got Your Request</h2><p>Dear {{customer_name}},</p><p>Your support ticket <strong>#{{ticket_number}}</strong> has been received and is being reviewed.</p><p><strong>Subject:</strong> {{ticket_subject}}<br/><strong>Priority:</strong> {{ticket_priority}}</p><p>Our team will get back to you shortly. You can track the status from your dashboard.</p><p>{{company_name}}</p>',
    placeholders: ['customer_name', 'ticket_number', 'ticket_subject', 'ticket_priority', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'support_ticket_resolved',
    name: 'Support Ticket Resolved',
    description: 'Sent when a support ticket is resolved',
    category: 'support',
    subject: 'Ticket #{{ticket_number}} resolved',
    body: '<h2>Ticket Resolved</h2><p>Dear {{customer_name}},</p><p>Your support ticket <strong>#{{ticket_number}}</strong> has been resolved.</p><p><strong>Resolution:</strong> {{resolution_notes}}</p><p>If you need further assistance, feel free to open a new ticket or contact us directly.</p><p>Best regards,<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'ticket_number', 'resolution_notes', 'company_name'],
    is_active: true,
  },
  {
    template_key: 'booking_reminder',
    name: 'Booking Reminder',
    description: 'Sent 24h before a scheduled service',
    category: 'booking',
    subject: 'Reminder: Service tomorrow – {{service_name}}',
    body: '<h2>Service Reminder</h2><p>Dear {{customer_name}},</p><p>This is a friendly reminder that your <strong>{{service_name}}</strong> service is scheduled for tomorrow.</p><p><strong>Date:</strong> {{scheduled_date}}<br/><strong>Time:</strong> {{scheduled_time}}<br/><strong>Property:</strong> {{property_address}}</p><p>Please ensure access is available for our technician. If you need to reschedule, please do so from your dashboard.</p><p>See you tomorrow!<br/>{{company_name}}</p>',
    placeholders: ['customer_name', 'service_name', 'scheduled_date', 'scheduled_time', 'property_address', 'booking_id', 'company_name'],
    is_active: true,
  },
];

const CATEGORY_COLORS = {
  booking: 'bg-blue-100 text-blue-700',
  subscription: 'bg-purple-100 text-purple-700',
  invoice: 'bg-amber-100 text-amber-800',
  support: 'bg-rose-100 text-rose-700',
  general: 'bg-slate-100 text-slate-600',
};

function AdminEmailTemplatesContent() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list('template_key'),
    initialData: [],
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      setEditingTemplate(null);
      toast.success('Template saved');
    },
  });

  const seedTemplates = async () => {
    setSeeding(true);
    const existing = templates.map(t => t.template_key);
    const missing = DEFAULT_TEMPLATES.filter(d => !existing.includes(d.template_key));
    if (missing.length === 0) {
      toast.info('All templates already exist');
      setSeeding(false);
      return;
    }
    await base44.entities.EmailTemplate.bulkCreate(missing);
    queryClient.invalidateQueries(['emailTemplates']);
    toast.success(`Created ${missing.length} templates`);
    setSeeding(false);
  };

  const handleSave = (templateId, data) => {
    updateMutation.mutate({ id: templateId, data });
  };

  const filtered = templates
    .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
    .filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.template_key?.toLowerCase().includes(search.toLowerCase()));

  const categoryCounts = {
    all: templates.length,
    booking: templates.filter(t => t.category === 'booking').length,
    subscription: templates.filter(t => t.category === 'subscription').length,
    invoice: templates.filter(t => t.category === 'invoice').length,
    support: templates.filter(t => t.category === 'support').length,
  };

  if (editingTemplate) {
    return (
      <div className="space-y-6">
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={(data) => handleSave(editingTemplate.id, data)}
          onCancel={() => setEditingTemplate(null)}
          saving={updateMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-slate-500">Customize system email notifications with dynamic placeholders</p>
        </div>
        {templates.length === 0 && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={seedTemplates} disabled={seeding}>
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Creating...' : 'Initialize Default Templates'}
          </Button>
        )}
        {templates.length > 0 && templates.length < DEFAULT_TEMPLATES.length && (
          <Button variant="outline" className="gap-2" onClick={seedTemplates} disabled={seeding}>
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            Add Missing Templates
          </Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(categoryCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              categoryFilter === key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="pl-10" />
      </div>

      {/* Template List */}
      <div className="space-y-3">
        {filtered.map(template => (
          <Card key={template.id} className={`hover:shadow-md transition-shadow ${template.is_active === false ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      <Badge className={`text-[10px] ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.general}`}>
                        {template.category}
                      </Badge>
                      {template.is_active === false && (
                        <Badge className="bg-red-50 text-red-600 text-[10px]">
                          <XCircle className="w-2.5 h-2.5 mr-0.5" /> Disabled
                        </Badge>
                      )}
                      {template.is_active !== false && (
                        <Badge className="bg-emerald-50 text-emerald-600 text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
                    <div className="mt-2 p-2 bg-slate-50 rounded-md">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Subject</div>
                      <div className="text-xs text-slate-700 font-mono">{template.subject}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(template.placeholders || []).slice(0, 8).map(p => (
                        <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{`{{${p}}}`}</span>
                      ))}
                      {(template.placeholders || []).length > 8 && (
                        <span className="text-[10px] text-slate-400">+{template.placeholders.length - 8} more</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1 flex-shrink-0" onClick={() => setEditingTemplate(template)}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-slate-400">
            {templates.length === 0 ? 'No templates yet. Click "Initialize Default Templates" to get started.' : 'No templates match your filter.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEmailTemplates() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminEmailTemplatesContent />
    </AuthGuard>
  );
}