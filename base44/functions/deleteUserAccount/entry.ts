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

    // Delete the user's own account — requires service role per platform docs
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});