import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSupport() {
  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['allSupportTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date'),
    initialData: []
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allSupportTickets']);
      toast.success('Ticket updated');
    }
  });

  const handleStatusChange = (ticket, newStatus) => {
    const updates = { ...ticket, status: newStatus };
    if (newStatus === 'resolved' && !ticket.resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }
    updateTicketMutation.mutate({ id: ticket.id, data: updates });
  };

  const handleResolve = (ticket, notes) => {
    updateTicketMutation.mutate({
      id: ticket.id,
      data: {
        ...ticket,
        status: 'resolved',
        resolution_notes: notes,
        resolved_at: new Date().toISOString()
      }
    });
  };

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Customer Support</h1>
          <p className="text-slate-300">Manage support tickets and customer inquiries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Open & In Progress ({openTickets.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {openTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No open tickets</div>
              ) : (
                openTickets.map(ticket => (
                  <Card key={ticket.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{ticket.subject}</h4>
                          <p className="text-sm text-slate-500">#{ticket.ticket_number}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={
                            ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 mb-3">{ticket.description}</p>

                      <div className="flex gap-2">
                        <Select 
                          value={ticket.status} 
                          onValueChange={(val) => handleStatusChange(ticket, val)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {ticket.status !== 'resolved' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const notes = prompt('Resolution notes:');
                              if (notes) handleResolve(ticket, notes);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolved & Closed ({resolvedTickets.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {resolvedTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No resolved tickets</div>
              ) : (
                resolvedTickets.map(ticket => (
                  <Card key={ticket.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{ticket.subject}</h4>
                          <p className="text-sm text-slate-500">#{ticket.ticket_number}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {ticket.status}
                        </Badge>
                      </div>

                      {ticket.resolution_notes && (
                        <div className="p-2 bg-green-50 rounded text-sm text-green-900 mt-2">
                          <strong>Resolution:</strong> {ticket.resolution_notes}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 mt-2">
                        Resolved: {ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString() : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}