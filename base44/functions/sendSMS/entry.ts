import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, message } = await req.json();

    if (!to || !message) {
      return Response.json({ error: 'Missing to or message' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured, skipping SMS');
      return Response.json({ success: true, skipped: true, reason: 'SMS not configured' });
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    const body = new URLSearchParams({
      From: fromNumber,
      To: to,
      Body: message,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Twilio error:', data);
      return Response.json({ error: data.message || 'SMS failed' }, { status: 500 });
    }

    console.log('SMS sent:', data.sid, 'to:', to);
    return Response.json({ success: true, sid: data.sid });
  } catch (error) {
    console.error('sendSMS error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});