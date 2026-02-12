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

    const { booking_id, service_name, total_amount, success_url, cancel_url } = await req.json();

    if (!booking_id || !total_amount || !service_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const amountInCents = Math.round(total_amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'aed',
          product_data: {
            name: service_name,
            description: `Booking #${booking_id.slice(0, 8)}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        booking_id: booking_id,
        customer_email: user.email,
      },
      customer_email: user.email,
      success_url: success_url || `${req.headers.get('origin')}/BookService?payment=success&booking_id=${booking_id}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/BookService?payment=cancelled&booking_id=${booking_id}`,
    });

    console.log(`Checkout session created: ${session.id} for booking: ${booking_id}`);
    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});