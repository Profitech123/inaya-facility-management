import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};

    console.log(`Payment success: session ${session.id}, service ${meta.service_id}`);

    if (!meta.service_id || !meta.property_id || !meta.customer_id) {
      console.log('Missing metadata, skipping booking creation');
      return Response.json({ received: true });
    }

    try {
      const base44 = createClientFromRequest(req);

      const booking = await base44.asServiceRole.entities.Booking.create({
        service_id: meta.service_id,
        property_id: meta.property_id,
        customer_id: meta.customer_id,
        scheduled_date: meta.scheduled_date,
        scheduled_time: meta.scheduled_time || undefined,
        status: 'confirmed',
        total_amount: parseFloat(meta.total_amount) || session.amount_total / 100,
        payment_status: 'paid',
        assigned_provider_id: meta.assigned_provider_id || undefined,
        customer_notes: meta.customer_notes || undefined,
        addon_ids: meta.addon_ids ? JSON.parse(meta.addon_ids) : undefined,
        addons_amount: parseFloat(meta.addons_amount) || 0,
        admin_notes: `Payment via Stripe session: ${session.id}`,
      });

      console.log(`Booking created: ${booking.id} for customer ${meta.customer_id}`);
    } catch (err) {
      console.error('Booking creation failed:', err.message);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ received: true });
});