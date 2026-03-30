import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, phone, property_type, service_need, message } = await req.json();

    // Send email to INAYA team using service role
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "info@inaya.ae",
      subject: `Service Finder Quote: ${service_need || 'General'} — ${name}`,
      body: `
        <h2>Quote Request from Service Finder</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Property Type:</strong> ${property_type || 'Not specified'}</p>
        <p><strong>Service Need:</strong> ${service_need || 'General inquiry'}</p>
        <p><strong>Additional Details:</strong><br/>${message || 'None'}</p>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendQuoteRequest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});