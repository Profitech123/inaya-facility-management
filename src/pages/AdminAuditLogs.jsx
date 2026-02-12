import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Search, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import AuthGuard from '../components/AuthGuard';

const ACTION_COLORS = {
  booking_status_changed: 'bg-blue-100 text-blue-800',
  provider_assigned: 'bg-purple-100 text-purple-800',
  subscription_updated: 'bg-amber-100 text-amber-800',
  service_created: 'bg-green-100 text-green-800',
  service_updated: 'bg-teal-100 text-teal-800',
  service_deleted: 'bg-red-100 text-red-800',
  ticket_resolved: 'bg-emerald-100 text-emerald-800',
  package_created: 'bg-indigo-100 text-indigo-800',
  package_updated: 'bg-cyan-100 text-cyan-800',
  package_deleted: 'bg-red-100 text-red-800',
};

function AdminAuditLogsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 200),
    initialData: []
  });

  const filtered = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const entityTypes = [...new Set(logs.map(l => l.entity_type))];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Audit Logs</h1>
          <p className="text-slate-300">Track all administrative actions across the platform.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by details, admin, or entity ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypes.map(et => (
                <SelectItem key={et} value={et}>{et}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold">{logs.length}</div>
                <div className="text-xs text-slate-500">Total Events</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{new Set(logs.map(l => l.admin_email)).size}</div>
                <div className="text-xs text-slate-500">Active Admins</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {logs.filter(l => {
                    const d = new Date(l.created_date);
                    const now = new Date();
                    return (now - d) < 24 * 60 * 60 * 1000;
                  }).length}
                </div>
                <div className="text-xs text-slate-500">Last 24h</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{entityTypes.length}</div>
                <div className="text-xs text-slate-500">Entity Types</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No audit logs found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(log => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-800'}>
                          {log.action?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline">{log.entity_type}</Badge>
                      </div>
                      <p className="text-sm text-slate-800 font-medium">{log.details}</p>
                      {(log.old_value || log.new_value) && (
                        <div className="flex gap-4 mt-1 text-xs text-slate-500">
                          {log.old_value && <span>From: <span className="text-red-600">{log.old_value}</span></span>}
                          {log.new_value && <span>To: <span className="text-green-600">{log.new_value}</span></span>}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{log.admin_name || log.admin_email}</div>
                      <div>{log.created_date ? format(new Date(log.created_date), 'MMM d, yyyy h:mm a') : ''}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAuditLogs() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminAuditLogsContent />
    </AuthGuard>
  );
}