import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, CheckCircle2, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '../components/AuthGuard';
import AIDraftResponse from '../components/support/AIDraftResponse';
import AIRecurringIssuesAnalyzer from '../components/support/AIRecurringIssuesAnalyzer';

function AdminTicketCard({ ticket, onStatusChange, onResolve }) {
  const [showAIDraft, setShowAIDraft] = useState(false);

  const priorityColor = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const borderColor = {
    urgent: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-slate-300'
  };

  return (
    <Card className={`border-l-4 ${borderColor[ticket.priority] || borderColor.medium}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 truncate">{ticket.subject}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">#{ticket.ticket_number}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">
                {ticket.created_date ? new Date(ticket.created_date).toLocaleDateString() : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 ml-2">
            <Badge className={`text-[10px] ${priorityColor[ticket.priority] || priorityColor.medium}`}>
              {ticket.priority}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{ticket.category?.replace('_', ' ')}</Badge>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3 line-clamp-3">{ticket.description}</p>

        {ticket.resolution_notes && (
          <div className="p-2 bg-green-50 rounded text-xs text-green-800 mb-3 border border-green-100">
            <strong>Resolution:</strong> {ticket.resolution_notes}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={ticket.status}
            onValueChange={(val) => onStatusChange(ticket, val)}
          >
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => setShowAIDraft(!showAIDraft)}
              >
                ✨ AI Draft
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const notes = prompt('Resolution notes:');
                  if (notes) onResolve(ticket, notes);
                }}
              >
                Resolve
              </Button>
            </>
          )}
        </div>

        {showAIDraft && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <AIDraftResponse
            ticket={ticket}
            onUseResponse={(response) => {
              onResolve(ticket, response);
              setShowAIDraft(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AdminSupportContent() {
  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['allSupportTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date'),
    initialData: [],
    staleTime: 30000
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allSupportTickets']);
      toast.success('Ticket updated');
    }
  });

  const handleStatusChange = (ticket, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'resolved' && !ticket.resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }
    updateTicketMutation.mutate({ id: ticket.id, data: updates });
  };

  const handleResolve = (ticket, notes) => {
    updateTicketMutation.mutate({
      id: ticket.id,
      data: {
        status: 'resolved',
        resolution_notes: notes,
        resolved_at: new Date().toISOString()
      }
    });
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  const urgentCount = tickets.filter(t => (t.status === 'open' || t.status === 'in_progress') && t.priority === 'urgent').length;
  const highCount = tickets.filter(t => (t.status === 'open' || t.status === 'in_progress') && t.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Tickets', value: tickets.length, icon: MessageSquare, color: 'text-slate-600' },
          { label: 'Open', value: openTickets.length, icon: Clock, color: 'text-amber-600' },
          { label: 'In Progress', value: inProgressTickets.length, icon: Clock, color: 'text-blue-600' },
          { label: 'Resolved', value: resolvedTickets.length, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Urgent / High', value: `${urgentCount} / ${highCount}`, icon: MessageSquare, color: 'text-red-600' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-slate-500">{stat.label}</span>
                </div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Analysis */}
      <AIRecurringIssuesAnalyzer tickets={tickets} />

      {/* Ticket Tabs */}
      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open" className="gap-1">
            Open <Badge variant="outline" className="text-[10px] ml-1">{openTickets.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-1">
            In Progress <Badge variant="outline" className="text-[10px] ml-1">{inProgressTickets.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-1">
            Resolved <Badge variant="outline" className="text-[10px] ml-1">{resolvedTickets.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-3 mt-4">
          {openTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No open tickets</div>
          ) : (
            openTickets.map(t => (
              <AdminTicketCard key={t.id} ticket={t} onStatusChange={handleStatusChange} onResolve={handleResolve} />
            ))
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-3 mt-4">
          {inProgressTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No in-progress tickets</div>
          ) : (
            inProgressTickets.map(t => (
              <AdminTicketCard key={t.id} ticket={t} onStatusChange={handleStatusChange} onResolve={handleResolve} />
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3 mt-4 max-h-[600px] overflow-y-auto">
          {resolvedTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No resolved tickets</div>
          ) : (
            resolvedTickets.map(t => (
              <AdminTicketCard key={t.id} ticket={t} onStatusChange={handleStatusChange} onResolve={handleResolve} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminSupport() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminSupportContent />
    </AuthGuard>
  );
}
