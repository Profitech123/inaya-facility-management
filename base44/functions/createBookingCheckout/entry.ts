import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_data, success_url, cancel_url } = await req.json();

    if (!booking_data || !success_url) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Fetch service to get name and price
    let serviceDetails = null;
    if (booking_data.service_id) {
      const services = await base44.asServiceRole.entities.Service.filter({ id: booking_data.service_id });
      serviceDetails = services?.[0] || null;
    }

    const serviceName = serviceDetails?.name || 'Facility Management Service';
    const basePrice = serviceDetails?.price || booking_data.base_price || 0;
    const addonsAmount = booking_data.addons_amount || 0;
    const totalAmount = booking_data.total_amount || (basePrice + addonsAmount);

    const lineItems = [
      {
        price_data: {
          currency: 'aed',
          product_data: {
            name: serviceName,
            description: booking_data.scheduled_date
              ? `Scheduled: ${booking_data.scheduled_date}${booking_data.scheduled_time ? ' at ' + booking_data.scheduled_time : ''}`
              : undefined,
          },
          unit_amount: Math.round(basePrice * 100),
        },
        quantity: 1,
      },
    ];

    if (addonsAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'aed',
          product_data: { name: 'Add-ons & Extras' },
          unit_amount: Math.round(addonsAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url || success_url,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        service_id: booking_data.service_id || '',
        property_id: booking_data.property_id || '',
        customer_id: booking_data.customer_id || '',
        scheduled_date: booking_data.scheduled_date || '',
        scheduled_time: booking_data.scheduled_time || '',
        assigned_provider_id: booking_data.assigned_provider_id || '',
        customer_notes: (booking_data.customer_notes || '').substring(0, 500),
        addon_ids: JSON.stringify(booking_data.addon_ids || []),
        addons_amount: String(addonsAmount),
        total_amount: String(totalAmount),
      },
    });

    console.log(`Stripe checkout session created: ${session.id} for ${serviceName} AED ${totalAmount}`);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createBookingCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});