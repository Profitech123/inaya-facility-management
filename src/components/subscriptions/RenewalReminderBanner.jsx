import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Mail, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';

export default function RenewalReminderBanner({ subscription, packageName, userEmail }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!subscription?.end_date || dismissed) return null;

  const daysUntilEnd = differenceInDays(parseISO(subscription.end_date), new Date());
  
  if (daysUntilEnd > 30 || daysUntilEnd < 0) return null;

  const handleSendReminder = async () => {
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: `Subscription Renewal Reminder - ${packageName}`,
      body: `
        <h2>Your subscription is expiring soon</h2>
        <p>Dear Customer,</p>
        <p>Your <strong>${packageName}</strong> subscription will expire in <strong>${daysUntilEnd} days</strong>.</p>
        <p>${subscription.auto_renew 
          ? 'Your subscription is set to auto-renew. No action is needed.' 
          : 'Please renew your subscription to continue enjoying uninterrupted services.'
        }</p>
        <p>If you have any questions, please contact us at info@inaya.ae or call 6005-INAYA (6005-46292).</p>
        <p>Best regards,<br/>INAYA Facilities Management</p>
      `
    });
    await base44.entities.Subscription.update(subscription.id, { renewal_reminder_sent: true });
    toast.success('Renewal reminder email sent');
    setSending(false);
  };

  const urgencyColor = daysUntilEnd <= 7 ? 'bg-red-50 border-red-200' : 
                        daysUntilEnd <= 14 ? 'bg-orange-50 border-orange-200' : 
                        'bg-blue-50 border-blue-200';
  const urgencyText = daysUntilEnd <= 7 ? 'text-red-800' : 
                      daysUntilEnd <= 14 ? 'text-orange-800' : 
                      'text-blue-800';

  return (
    <div className={`${urgencyColor} border rounded-lg p-4 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        <Bell className={`w-5 h-5 ${urgencyText}`} />
        <div>
          <p className={`font-medium ${urgencyText}`}>
            Subscription expires in {daysUntilEnd} day{daysUntilEnd !== 1 ? 's' : ''}
          </p>
          <p className={`text-sm ${urgencyText} opacity-80`}>
            {subscription.auto_renew 
              ? 'Auto-renewal is enabled for this subscription.'
              : 'This subscription will not auto-renew. Renew to continue services.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!subscription.renewal_reminder_sent && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSendReminder}
            disabled={sending}
          >
            <Mail className="w-4 h-4 mr-1" />
            {sending ? 'Sending...' : 'Send Reminder'}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}