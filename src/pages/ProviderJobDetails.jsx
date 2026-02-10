import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, Mail, Clock, Camera, MessageSquare, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderJobDetails() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      const providers = await base44.entities.Provider.filter({ email: u.email });
      if (providers.length > 0) setProvider(providers[0]);
    });
    const params = new URLSearchParams(window.location.search);
    setBookingId(params.get('job'));
  }, []);

  const { data: booking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.list();
      return bookings.find(b => b.id === bookingId);
    },
    enabled: !!bookingId
  });

  const { data: service } = useQuery({
    queryKey: ['service', booking?.service_id],
    queryFn: async () => {
      const services = await base44.entities.Service.list();
      return services.find(s => s.id === booking.service_id);
    },
    enabled: !!booking
  });

  const { data: property } = useQuery({
    queryKey: ['property', booking?.property_id],
    queryFn: async () => {
      const properties = await base44.entities.Property.list();
      return properties.find(p => p.id === booking.property_id);
    },
    enabled: !!booking
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => base44.entities.ProviderMessage.filter({ booking_id: bookingId }, 'created_date'),
    enabled: !!bookingId,
    initialData: []
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking']);
      toast.success('Job updated');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ProviderMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessage('');
    }
  });

  const handleStatusUpdate = (newStatus) => {
    const updates = { ...booking, status: newStatus };
    if (newStatus === 'in_progress' && !booking.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (newStatus === 'completed' && !booking.completed_at) {
      updates.completed_at = new Date().toISOString();
    }
    updateBookingMutation.mutate({ id: booking.id, data: updates });
  };

  const handleSendMessage = (text, type = 'text') => {
    sendMessageMutation.mutate({
      booking_id: bookingId,
      sender_type: 'provider',
      sender_id: provider.id,
      message: text,
      message_type: type
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const photos = booking.completion_photos || [];
      updateBookingMutation.mutate({
        id: booking.id,
        data: { ...booking, completion_photos: [...photos, file_url] }
      });
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNotes = () => {
    updateBookingMutation.mutate({
      id: booking.id,
      data: { ...booking, provider_notes: notes }
    });
  };

  if (!booking || !provider) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{service?.name || 'Service'}</h1>
              <p className="text-slate-300">Job #{booking.id.slice(0, 8)}</p>
            </div>
            <Badge className={
              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
              booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }>
              {booking.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-medium">Scheduled</div>
                    <div className="text-slate-600">{booking.scheduled_date} at {booking.scheduled_time}</div>
                  </div>
                </div>

                {property && (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-slate-600">{property.address}</div>
                        {property.access_notes && (
                          <div className="text-sm text-slate-500 mt-1">Access: {property.access_notes}</div>
                        )}
                      </div>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="mt-2">
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                    </a>
                  </>
                )}

                {booking.customer_notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium mb-1">Customer Notes:</div>
                    <div className="text-slate-600">{booking.customer_notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {booking.status === 'confirmed' && (
                  <>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        handleSendMessage('En route to your location', 'status_update');
                        toast.success('Customer notified');
                      }}
                    >
                      Send "En Route"
                    </Button>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700" 
                      onClick={() => {
                        handleSendMessage('Arrived at location', 'status_update');
                        handleStatusUpdate('in_progress');
                      }}
                    >
                      Mark "Arrived" & Start Job
                    </Button>
                  </>
                )}
                
                {booking.status === 'in_progress' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes || booking.provider_notes || ''}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the job..."
                  rows={4}
                  className="mb-3"
                />
                <Button onClick={handleSaveNotes}>Save Notes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {booking.completion_photos?.map((url, idx) => (
                    <img key={idx} src={url} alt="Job" className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="mb-2"
                />
                <Button variant="outline" size="sm" disabled={uploading}>
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-lg ${msg.sender_type === 'provider' ? 'bg-emerald-100 ml-4' : 'bg-slate-100 mr-4'}`}
                    >
                      <div className="text-xs text-slate-500 mb-1">
                        {msg.sender_type === 'provider' ? 'You' : 'Customer'}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && message && handleSendMessage(message)}
                  />
                  <Button 
                    onClick={() => message && handleSendMessage(message)}
                    disabled={!message}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}