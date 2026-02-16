import { supabase } from './client';

/**
 * Supabase API Client
 * Provides helper functions for database operations to replace Base44 entities
 */

// ============= PROFILES =============
export const profiles = {
  async get(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('profiles').select('*');
    
    if (filters.role) query = query.eq('role', filters.role);
    if (filters.limit) query = query.limit(filters.limit);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

// ============= PROPERTIES =============
export const properties = {
  async create(propertyData) {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(propertyId) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(userId) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async update(propertyId, updates) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(propertyId) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    if (error) throw error;
    return true;
  },
};

// ============= SERVICES =============
export const services = {
  async create(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(serviceId) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('services').select('*');
    
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.active !== undefined) query = query.eq('is_active', filters.active);
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(serviceId, updates) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(serviceId) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
    return true;
  },
};

// ============= PROVIDERS =============
export const providers = {
  async create(providerData) {
    const { data, error } = await supabase
      .from('providers')
      .insert(providerData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(providerId) {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('providers').select('*');
    
    if (filters.verified !== undefined) query = query.eq('is_verified', filters.verified);
    if (filters.active !== undefined) query = query.eq('is_active', filters.active);
    
    query = query.order('company_name', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(providerId, updates) {
    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('id', providerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(providerId) {
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', providerId);
    
    if (error) throw error;
    return true;
  },
};

// ============= TECHNICIANS =============
export const technicians = {
  async create(technicianData) {
    const { data, error } = await supabase
      .from('technicians')
      .insert(technicianData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(technicianId) {
    const { data, error } = await supabase
      .from('technicians')
      .select('*, provider:providers(*)')
      .eq('id', technicianId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('technicians').select('*, provider:providers(*)');
    
    if (filters.providerId) query = query.eq('provider_id', filters.providerId);
    if (filters.available !== undefined) query = query.eq('is_available', filters.available);
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(technicianId, updates) {
    const { data, error } = await supabase
      .from('technicians')
      .update(updates)
      .eq('id', technicianId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(technicianId) {
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', technicianId);
    
    if (error) throw error;
    return true;
  },
};

// ============= BOOKINGS =============
export const bookings = {
  async create(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        property:properties(*),
        technician:technicians(*, provider:providers(*))
      `)
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('bookings').select(`
      *,
      service:services(*),
      property:properties(*),
      technician:technicians(*)
    `);
    
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.providerId) {
      query = query.eq('technicians.provider_id', filters.providerId);
    }
    
    query = query.order('scheduled_date', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async listAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        property:properties(*),
        technician:technicians(*)
      `)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async update(bookingId, updates) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(bookingId) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    
    if (error) throw error;
    return true;
  },
};

// ============= PACKAGES =============
export const packages = {
  async create(packageData) {
    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(packageId) {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('packages').select('*');
    
    if (filters.active !== undefined) query = query.eq('is_active', filters.active);
    
    query = query.order('name', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(packageId, updates) {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('id', packageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(packageId) {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId);
    
    if (error) throw error;
    return true;
  },
};

// ============= SUBSCRIPTIONS =============
export const subscriptions = {
  async create(subscriptionData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(subscriptionId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        package:packages(*),
        property:properties(*)
      `)
      .eq('id', subscriptionId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('subscriptions').select(`
      *,
      package:packages(*),
      property:properties(*)
    `);
    
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.status) query = query.eq('status', filters.status);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(subscriptionId, updates) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(subscriptionId) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);
    
    if (error) throw error;
    return true;
  },
};

// ============= PAYMENTS =============
export const payments = {
  async create(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async get(paymentId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('payments').select('*');
    
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.status) query = query.eq('status', filters.status);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(paymentId, updates) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============= REVIEWS =============
export const reviews = {
  async create(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('reviews').select(`
      *,
      booking:bookings(*),
      customer:profiles(*)
    `);
    
    if (filters.bookingId) query = query.eq('booking_id', filters.bookingId);
    if (filters.providerId) query = query.eq('provider_id', filters.providerId);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

// ============= CHAT MESSAGES =============
export const chatMessages = {
  async create(messageData) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('chat_messages').select('*');
    
    if (filters.bookingId) query = query.eq('booking_id', filters.bookingId);
    if (filters.senderId) query = query.eq('sender_id', filters.senderId);
    
    query = query.order('created_at', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async markAsRead(messageId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============= AUDIT LOGS =============
export const auditLogs = {
  async create(logData) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(logData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('audit_logs').select('*');
    
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.limit) query = query.limit(filters.limit);
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

// ============= TECHNICIAN SCHEDULES =============
export const technicianSchedules = {
  async create(scheduleData) {
    const { data, error } = await supabase
      .from('technician_schedules')
      .insert(scheduleData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('technician_schedules').select('*');
    
    if (filters.technicianId) query = query.eq('technician_id', filters.technicianId);
    if (filters.date) query = query.eq('date', filters.date);
    
    query = query.order('date', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(scheduleId, updates) {
    const { data, error } = await supabase
      .from('technician_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(scheduleId) {
    const { error } = await supabase
      .from('technician_schedules')
      .delete()
      .eq('id', scheduleId);
    
    if (error) throw error;
    return true;
  },
};

// ============= TIME SLOTS =============
export const timeSlots = {
  async create(slotData) {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(slotData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase.from('time_slots').select('*');
    
    if (filters.scheduleId) query = query.eq('schedule_id', filters.scheduleId);
    if (filters.isBooked !== undefined) query = query.eq('is_booked', filters.isBooked);
    
    query = query.order('start_time', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(slotId, updates) {
    const { data, error } = await supabase
      .from('time_slots')
      .update(updates)
      .eq('id', slotId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Export all APIs
export const api = {
  profiles,
  properties,
  services,
  providers,
  technicians,
  bookings,
  packages,
  subscriptions,
  payments,
  reviews,
  chatMessages,
  auditLogs,
  technicianSchedules,
  timeSlots,
};
