/**
 * Internal SMS sender — called by other backend functions (no auth required).
 * Pass { to, message } in the request body.
 * Gracefully skips if Twilio is not configured.
 */
Deno.serve(async (req) => {
  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return Response.json({ error: 'Missing to or message' }, { status: 400 });
    }

    // Normalize phone: ensure +971 format for UAE numbers
    let phone = to.trim();
    if (phone.startsWith('0') && !phone.startsWith('+')) {
      phone = '+971' + phone.slice(1);
    } else if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio not configured — SMS skipped');
      return Response.json({ success: true, skipped: true });
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    const body = new URLSearchParams({ From: fromNumber, To: phone, Body: message });

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
      console.error('Twilio error:', JSON.stringify(data));
      return Response.json({ error: data.message }, { status: 500 });
    }

    console.log('SMS sent sid:', data.sid, 'to:', phone);
    return Response.json({ success: true, sid: data.sid });
  } catch (error) {
    console.error('sendSMSInternal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});