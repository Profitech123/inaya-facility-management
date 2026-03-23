import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Webhook event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        console.log(`Payment successful for booking: ${bookingId}, payment_intent: ${session.payment_intent}`);
        await base44.asServiceRole.entities.Booking.update(bookingId, {
          payment_status: 'paid',
          status: 'confirmed',
        });
        console.log(`Booking ${bookingId} updated to paid/confirmed`);
      }
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;

      // Find the booking by looking up the original checkout session
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      if (sessions.data.length > 0) {
        const bookingId = sessions.data[0].metadata?.booking_id;
        if (bookingId) {
          console.log(`Refund processed for booking: ${bookingId}`);
          await base44.asServiceRole.entities.Booking.update(bookingId, {
            payment_status: 'refunded',
          });
          console.log(`Booking ${bookingId} updated to refunded`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});