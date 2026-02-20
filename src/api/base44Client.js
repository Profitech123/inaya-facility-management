/**
 * Compatibility shim - replaces the old base44 SDK with Supabase-backed db layer.
 * All existing `import { base44 } from '@/api/base44Client'` still work.
 */
import { db } from '@/lib/db';

export const base44 = {
  entities: db
};
