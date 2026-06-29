import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Require supplementary identity verification: caller must confirm their own email
    const { confirm_email } = await req.json().catch(() => ({}));
    if (!confirm_email || confirm_email.toLowerCase() !== (user.email || '').toLowerCase()) {
      return Response.json({ error: 'Email confirmation required to delete account' }, { status: 403 });
    }

    // Non-admin users cannot directly trigger irreversible service-role deletion.
    // Instead, create a deletion request ticket that admins must approve before
    // the account is permanently removed.
    if (user.role !== 'admin') {
      await base44.asServiceRole.entities.SupportTicket.create({
        ticket_number: 'DEL-' + Date.now(),
        customer_id: user.id,
        subject: 'Account Deletion Request',
        description: 'User ' + (user.email || '') + ' requested account deletion. Requires admin authorization before proceeding with permanent removal.',
        category: 'general',
        priority: 'high',
        status: 'open'
      });
      return Response.json({ success: true, message: 'Deletion request submitted. An admin will review and process your request.' });
    }

    // Admin-authorized direct deletion — requires service role per platform docs
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});