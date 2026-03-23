import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id } = await req.json();
    if (!booking_id) {
      return Response.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Find the checkout session for this booking
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const session = sessions.data.find(s => s.metadata?.booking_id === booking_id && s.payment_status === 'paid');

    if (!session) {
      console.error(`No paid session found for booking: ${booking_id}`);
      return Response.json({ error: 'No paid session found for this booking' }, { status: 404 });
    }

    const paymentIntentId = session.payment_intent;
    console.log(`Initiating refund for booking: ${booking_id}, payment_intent: ${paymentIntentId}`);

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    console.log(`Refund created: ${refund.id} for booking: ${booking_id}`);

    // Update booking status
    await base44.asServiceRole.entities.Booking.update(booking_id, {
      payment_status: 'refunded',
      status: 'cancelled',
    });

    return Response.json({ success: true, refund_id: refund.id });
  } catch (error) {
    console.error('Refund error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});