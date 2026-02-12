import { base44 } from '@/api/base44Client';

export async function logAuditEvent({ action, entity_type, entity_id, details, old_value, new_value }) {
  const user = await base44.auth.me();
  await base44.entities.AuditLog.create({
    action,
    entity_type,
    entity_id,
    admin_email: user.email,
    admin_name: user.full_name || user.email,
    details,
    old_value: old_value || '',
    new_value: new_value || ''
  });
}