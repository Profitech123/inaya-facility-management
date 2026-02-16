import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  ArrowLeft, MapPin, Clock, User, Phone, FileText, Camera,
  Navigation, Truck, Play, CheckCircle2, AlertTriangle, Loader2, X, Image
} from 'lucide-react';
import moment from 'moment';

const STATUS_FLOW = {
  confirmed: { next: 'en_route', label: 'Start Route', icon: Truck, color: 'bg-indigo-600 hover:bg-indigo-700' },
  en_route: { next: 'in_progress', label: 'Arrived — Start Job', icon: Play, color: 'bg-amber-600 hover:bg-amber-700' },
  in_progress: { next: 'completed', label: 'Complete Job', icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700' },
};

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  en_route: { label: 'En Route', color: 'bg-indigo-100 text-indigo-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  delayed: { label: 'Delayed', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

export default function ProviderJobDetail({ booking, service, property, customer, onBack, onUpdate }) {
  const [notes, setNotes] = useState(booking.provider_notes || '');
  const [delayReason, setDelayReason] = useState(booking.delay_reason || '');
  const [photos, setPhotos] = useState(booking.completion_photos || []);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDelay, setShowDelay] = useState(false);

  const statusCfg = STATUS_LABELS[booking.status] || STATUS_LABELS.pending;
  const nextAction = STATUS_FLOW[booking.status];

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    const updateData = { status: newStatus, provider_notes: notes };
    if (newStatus === 'in_progress') updateData.started_at = new Date().toISOString();
    if (newStatus === 'completed') updateData.completed_at = new Date().toISOString();
    if (newStatus === 'completed') updateData.completion_photos = photos;

    await base44.entities.Booking.update(booking.id, updateData);
    toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
    onUpdate();
    setUpdating(false);
  };

  const handleDelay = async () => {
    if (!delayReason.trim()) { toast.error('Please provide a reason for the delay'); return; }
    setUpdating(true);
    await base44.entities.Booking.update(booking.id, {
      status: 'delayed',
      delay_reason: delayReason,
      provider_notes: notes,
    });
    toast.success('Job marked as delayed');
    onUpdate();
    setUpdating(false);
  };

  const handleSaveNotes = async () => {
    await base44.entities.Booking.update(booking.id, { provider_notes: notes });
    toast.success('Notes saved');
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }
    const newPhotos = [...photos, ...uploadedUrls];
    setPhotos(newPhotos);
    await base44.entities.Booking.update(booking.id, { completion_photos: newPhotos });
    toast.success(`${files.length} photo(s) uploaded`);
    setUploading(false);
  };

  const removePhoto = async (idx) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    await base44.entities.Booking.update(booking.id, { completion_photos: newPhotos });
  };

  const openNavigation = () => {
    const address = property?.address || property?.area || '';
    if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Dubai, UAE')}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      {/* Header */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className={`text-xs mb-2 ${statusCfg.color}`}>{statusCfg.label}</Badge>
              <h2 className="text-xl font-bold text-slate-900">{service?.name || 'Service'}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {moment(booking.scheduled_date).format('dddd, MMMM D, YYYY')} · {booking.scheduled_time || 'TBD'}
              </p>
            </div>
            <span className="text-xl font-bold text-emerald-700">AED {booking.total_amount}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 bg-slate-50 rounded-lg p-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{customer?.full_name || 'Customer'}</p>
                <p className="text-slate-500 text-xs">{customer?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 rounded-lg p-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{property?.address || 'Address pending'}</p>
                <p className="text-slate-500 text-xs">{property?.area}{property?.city ? `, ${property.city}` : ''}</p>
              </div>
            </div>
          </div>

          {property?.access_notes && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-amber-800 text-xs mb-0.5">Access Notes</p>
              <p className="text-amber-700">{property.access_notes}</p>
            </div>
          )}

          {booking.customer_notes && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-800 text-xs mb-0.5">Customer Notes</p>
              <p className="text-blue-700">{booking.customer_notes}</p>
            </div>
          )}

          {booking.admin_notes && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-slate-700 text-xs mb-0.5">Admin Notes</p>
              <p className="text-slate-600">{booking.admin_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {!['completed', 'cancelled'].includes(booking.status) && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-slate-900">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={openNavigation} className="gap-2">
                <Navigation className="w-4 h-4" /> Navigate to Location
              </Button>
              {nextAction && (
                <Button
                  onClick={() => handleStatusUpdate(nextAction.next)}
                  disabled={updating}
                  className={`gap-2 text-white ${nextAction.color}`}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <nextAction.icon className="w-4 h-4" />}
                  {nextAction.label}
                </Button>
              )}
              {booking.status !== 'delayed' && booking.status !== 'pending' && (
                <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDelay(!showDelay)}>
                  <AlertTriangle className="w-4 h-4" /> Report Delay
                </Button>
              )}
            </div>

            {showDelay && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-red-800">Reason for delay</p>
                <Textarea value={delayReason} onChange={e => setDelayReason(e.target.value)} placeholder="Traffic, equipment issue, weather..." rows={2} className="bg-white" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowDelay(false)}>Cancel</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelay} disabled={updating}>
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Confirm Delay
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Provider Notes */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" /> Job Notes
          </h3>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this job (visible to admin)..."
            rows={3}
          />
          <Button size="sm" variant="outline" onClick={handleSaveNotes}>Save Notes</Button>
        </CardContent>
      </Card>

      {/* Completion Photos */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-400" /> Completion Photos
          </h3>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  {!['completed', 'cancelled'].includes(booking.status) && (
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {!['completed', 'cancelled'].includes(booking.status) && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload Photos'}
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
            </label>
          )}
          {photos.length === 0 && ['completed', 'cancelled'].includes(booking.status) && (
            <p className="text-sm text-slate-400">No photos uploaded for this job.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}