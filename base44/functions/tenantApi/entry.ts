import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Tenant API — handles all tenant-facing requests from external apps.
 *
 * POST /functions/tenantApi
 * Body: { action: string, payload: object }
 *
 * Actions:
 *   - get_profile          → current tenant profile
 *   - get_properties       → tenant's saved properties
 *   - create_property      → add a new property
 *   - get_services         → list available active services
 *   - get_bookings         → tenant's bookings (optional status filter)
 *   - get_booking          → single booking by id
 *   - create_service_request → create a new booking/service request
 *   - cancel_booking       → cancel an existing booking
 *   - get_subscriptions    → tenant's active subscriptions
 *
 * Auth: user must be authenticated (base44.auth.me()).
 */

const ALLOWED_ACTIONS = [
  'get_profile',
  'get_properties',
  'create_property',
  'get_services',
  'get_bookings',
  'get_booking',
  'create_service_request',
  'cancel_booking',
  'get_subscriptions',
];

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payload } = await req.json();

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return Response.json(
        { error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const data = payload || {};

    // ── GET PROFILE ──────────────────────────────────────────
    if (action === 'get_profile') {
      return Response.json({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_date: user.created_date,
      });
    }

    // ── GET PROPERTIES ───────────────────────────────────────
    if (action === 'get_properties') {
      const properties = await base44.entities.Property.filter({
        owner_id: user.id,
      });
      return Response.json({ properties });
    }

    // ── CREATE PROPERTY ──────────────────────────────────────
    if (action === 'create_property') {
      const required = ['property_type', 'address'];
      for (const field of required) {
        if (!data[field]) {
          return Response.json(
            { error: `Missing field: ${field}` },
            { status: 400 }
          );
        }
      }
      const property = await base44.entities.Property.create({
        property_type: data.property_type,
        address: data.address,
        area: data.area || '',
        city: data.city || 'Dubai',
        bedrooms: data.bedrooms || null,
        square_meters: data.square_meters || null,
        access_notes: data.access_notes || '',
        owner_id: user.id,
      });
      return Response.json({ property }, { status: 201 });
    }

    // ── GET SERVICES ─────────────────────────────────────────
    if (action === 'get_services') {
      const services = await base44.asServiceRole.entities.Service.filter({
        is_active: true,
      });
      return Response.json({ services });
    }

    // ── GET BOOKINGS ─────────────────────────────────────────
    if (action === 'get_bookings') {
      const query = { customer_id: user.id };
      if (data.status) {
        query.status = data.status;
      }
      const bookings = await base44.entities.Booking.filter(
        query,
        '-created_date',
        data.limit || 50
      );
      return Response.json({ bookings });
    }

    // ── GET SINGLE BOOKING ───────────────────────────────────
    if (action === 'get_booking') {
      if (!data.booking_id) {
        return Response.json(
          { error: 'Missing field: booking_id' },
          { status: 400 }
        );
      }
      const booking = await base44.entities.Booking.get(data.booking_id);
      if (!booking || booking.customer_id !== user.id) {
        return Response.json({ error: 'Booking not found' }, { status: 404 });
      }
      return Response.json({ booking });
    }

    // ── CREATE SERVICE REQUEST ───────────────────────────────
    if (action === 'create_service_request') {
      const required = ['service_id', 'property_id', 'scheduled_date', 'total_amount'];
      for (const field of required) {
        if (data[field] === undefined || data[field] === null) {
          return Response.json(
            { error: `Missing field: ${field}` },
            { status: 400 }
          );
        }
      }
      const booking = await base44.entities.Booking.create({
        service_id: data.service_id,
        property_id: data.property_id,
        customer_id: user.id,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time || '',
        total_amount: data.total_amount,
        status: 'pending',
        payment_status: 'pending',
        customer_notes: data.customer_notes || '',
        addon_ids: data.addon_ids || [],
        addons_amount: data.addons_amount || 0,
      });
      return Response.json({ booking }, { status: 201 });
    }

    // ── CANCEL BOOKING ──────────────────────────────────────
    if (action === 'cancel_booking') {
      if (!data.booking_id) {
        return Response.json(
          { error: 'Missing field: booking_id' },
          { status: 400 }
        );
      }
      const booking = await base44.entities.Booking.get(data.booking_id);
      if (!booking || booking.customer_id !== user.id) {
        return Response.json({ error: 'Booking not found' }, { status: 404 });
      }
      if (['completed', 'cancelled'].includes(booking.status)) {
        return Response.json(
          { error: `Cannot cancel a ${booking.status} booking` },
          { status: 400 }
        );
      }
      const updated = await base44.entities.Booking.update(data.booking_id, {
        status: 'cancelled',
        cancellation_reason: data.reason || 'Cancelled by tenant',
        cancelled_at: new Date().toISOString(),
      });
      return Response.json({ booking: updated });
    }

    // ── GET SUBSCRIPTIONS ───────────────────────────────────
    if (action === 'get_subscriptions') {
      const query = { customer_id: user.id };
      if (data.status) {
        query.status = data.status;
      }
      const subscriptions = await base44.entities.Subscription.filter(
        query,
        '-created_date',
        data.limit || 50
      );
      return Response.json({ subscriptions });
    }

    return Response.json({ error: 'Action not implemented' }, { status: 501 });
  } catch (error) {
    console.error('tenantApi error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});