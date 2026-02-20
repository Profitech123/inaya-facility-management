import { supabase } from './supabase';

/**
 * Creates a table accessor with list, filter, create, update, delete methods.
 * This mirrors the base44.entities.X API shape for easy migration.
 */
function createTable(tableName) {
  return {
    /**
     * List all rows. Optional orderBy (prefix with '-' for desc) and limit.
     * Example: list('-created_at', 50)
     */
    async list(orderBy, limit) {
      if (!supabase) return [];
      let query = supabase.from(tableName).select('*');

      if (orderBy) {
        const desc = orderBy.startsWith('-');
        const col = desc ? orderBy.slice(1) : orderBy;
        // Map common base44 field names to Supabase column names
        const colMap = {
          'created_date': 'created_at',
          'scheduled_date': 'scheduled_date',
          'invoice_date': 'created_at',
          'last_message_at': 'created_at',
          'display_order': 'created_at'
        };
        query = query.order(colMap[col] || col, { ascending: !desc });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) { console.error(`[db] list ${tableName}:`, error.message); return []; }
      return data || [];
    },

    /**
     * Filter rows by an object of key-value pairs.
     * Example: filter({ customer_id: '123' }, '-created_at')
     */
    async filter(filters, orderBy) {
      if (!supabase) return [];
      let query = supabase.from(tableName).select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          // Map common base44 field names
          const colMap = {
            'customer_id': 'user_id',
            'owner_id': 'user_id',
            'assigned_provider_id': 'provider_id'
          };
          query = query.eq(colMap[key] || key, value);
        });
      }

      if (orderBy) {
        const desc = orderBy.startsWith('-');
        const col = desc ? orderBy.slice(1) : orderBy;
        const colMap = {
          'created_date': 'created_at',
          'scheduled_date': 'scheduled_date',
          'invoice_date': 'created_at'
        };
        query = query.order(colMap[col] || col, { ascending: !desc });
      }

      const { data, error } = await query;
      if (error) { console.error(`[db] filter ${tableName}:`, error.message); return []; }
      return data || [];
    },

    /**
     * Create a new row. Returns the created row.
     */
    async create(rowData) {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase.from(tableName).insert(rowData).select().single();
      if (error) throw error;
      return data;
    },

    /**
     * Update a row by id. Returns the updated row.
     */
    async update(id, rowData) {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase.from(tableName).update(rowData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    /**
     * Delete a row by id.
     */
    async delete(id) {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    }
  };
}

/**
 * Database access layer mapping base44 entity names to Supabase tables.
 * Usage: db.Service.list(), db.Booking.create(data), etc.
 */
export const db = {
  // Direct table names (matching Supabase schema)
  Service: createTable('services'),
  ServiceCategory: {
    // No Supabase table for categories - return static data
    async list() {
      const { STATIC_CATEGORIES } = await import('@/data/services');
      return STATIC_CATEGORIES;
    },
    async filter() {
      const { STATIC_CATEGORIES } = await import('@/data/services');
      return STATIC_CATEGORIES;
    },
    async create(data) { return data; },
    async update(id, data) { return { id, ...data }; },
    async delete() {}
  },
  Booking: createTable('bookings'),
  Subscription: createTable('subscriptions'),
  SubscriptionPackage: createTable('packages'),
  Property: createTable('properties'),
  Provider: createTable('providers'),
  SupportTicket: createTable('support_tickets'),
  Invoice: createTable('payments'),
  ProviderReview: createTable('reviews'),
  AuditLog: createTable('audit_logs'),
  ChatConversation: createTable('chat_messages'),
  User: createTable('profiles'),
  ServiceAddon: {
    // No table - return empty
    async list() { return []; },
    async filter() { return []; },
    async create(data) { return data; },
    async update(id, data) { return { id, ...data }; },
    async delete() {}
  },
  CustomPackage: {
    // No table - return empty
    async list() { return []; },
    async filter() { return []; },
    async create(data) { return data; },
    async update(id, data) { return { id, ...data }; },
    async delete() {}
  }
};
