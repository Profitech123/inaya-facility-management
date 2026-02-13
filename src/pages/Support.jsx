import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';
import SmartFAQSuggestions from '../components/support/SmartFAQSuggestions';
import { classifyTicket } from '../components/support/AITicketClassifier';

function SupportContent() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [classifying, setClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);

  useEffect(() => {
    clientAuth.me().then(setUser).catch(() => window.location.href = createPageUrl('Home'));
  }, []);

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets', user?.id],
    queryFn: () => base44.entities.SupportTicket.filter({ customer_id: user?.id }, '-created_date'),
    enabled: !!user,
    initialData: []
  });

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supportTickets']);
      setShowForm(false);
      setFormData({ subject: '', description: '', category: 'general', priority: 'medium' });
      toast.success('Support ticket created');
    }
  });

  const handleClassifyAndSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) return;

    setClassifying(true);
    const classification = await classifyTicket(formData.subject, formData.description);
    setAiClassification(classification);

    const ticketNumber = 'TKT-' + Date.now().toString().slice(-8);
    createTicketMutation.mutate({
      ...formData,
      category: classification.category,
      priority: classification.priority,
      ticket_number: ticketNumber,
      customer_id: user.id
    });
    setClassifying(false);
    setAiClassification(null);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Support</h1>
              <p className="text-slate-300">Get help with your services and account</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-white text-slate-900 hover:bg-slate-100">
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? 'Cancel' : 'New Ticket'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClassifyAndSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your issue"
                    rows={5}
                    required
                  />
                </div>

                {/* AI FAQ Suggestions — appears as user types */}
                <SmartFAQSuggestions
                  subject={formData.subject}
                  description={formData.description}
                />

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-medium text-slate-600">AI will automatically categorize and prioritize your ticket</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Category and priority are assigned based on your description for faster routing.</p>
                </div>

                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  disabled={classifying}
                >
                  {classifying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Classifying & Submitting...</>
                  ) : (
                    'Submit Ticket'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No support tickets</h3>
                <p className="text-slate-600 mb-4">You haven't created any support tickets yet</p>
                <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            tickets.map(ticket => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{ticket.subject}</h3>
                        <Badge className={
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'closed' ? 'bg-slate-100 text-slate-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {ticket.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">Ticket #{ticket.ticket_number}</p>
                    </div>
                    <Badge className={
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-800'
                    }>
                      {ticket.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-slate-700 mb-4">{ticket.description}</p>
                  
                  {ticket.resolution_notes && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-900 mb-1">Resolution:</div>
                      <div className="text-sm text-green-800">{ticket.resolution_notes}</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 mt-4">
                    Created: {new Date(ticket.created_date).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Support() {
  return (
    <AuthGuard requiredRole="customer">
      <SupportContent />
    </AuthGuard>
  );
}
