import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, User, Navigation, Truck, Play, CheckCircle2, AlertTriangle, Loader2, X, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const STATUS_FLOW = {
  confirmed:   { next: 'en_route',    label: 'Start Route',        Icon: Truck,         color: 'bg-indigo-600' },
  en_route:    { next: 'in_progress', label: 'Arrived – Start Job', Icon: Play,          color: 'bg-amber-500' },
  in_progress: { next: 'completed',   label: 'Mark as Completed',   Icon: CheckCircle2,  color: 'bg-emerald-600' },
};

const STATUS_BAR = {
  pending:     'bg-slate-300',
  confirmed:   'bg-blue-500',
  en_route:    'bg-indigo-500',
  in_progress: 'bg-amber-500',
  completed:   'bg-emerald-500',
  delayed:     'bg-red-500',
  cancelled:   'bg-gray-300',
};

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', en_route: 'En Route',
  in_progress: 'In Progress', completed: 'Completed', delayed: 'Delayed', cancelled: 'Cancelled',
};

export default function MobileJobDetail({ booking, service, property, customer, onBack, onStatusUpdate, onPhotoUpload }) {
  const [notes, setNotes] = useState(booking.provider_notes || '');
  const [delayReason, setDelayReason] = useState('');
  const [showDelay, setShowDelay] = useState(false);
  const [photos, setPhotos] = useState(booking.completion_photos || []);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const nextAction = STATUS_FLOW[booking.status];
  const isFinished = ['completed', 'cancelled'].includes(booking.status);
  const barColor = STATUS_BAR[booking.status] || 'bg-slate-300';

  const handleStatus = async () => {
    if (!nextAction) return;
    setUpdating(true);
    await onStatusUpdate(booking, nextAction.next, { provider_notes: notes });
    setUpdating(false);
  };

  const handleDelay = async () => {
    if (!delayReason.trim()) { toast.error('Please provide a delay reason'); return; }
    setUpdating(true);
    await onStatusUpdate(booking, 'delayed', { delay_reason: delayReason, provider_notes: notes });
    setShowDelay(false);
    setUpdating(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.Booking.update(booking.id, { provider_notes: notes });
    toast.success('Notes saved');
    setSavingNotes(false);
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newPhotos = await onPhotoUpload(booking, files);
    setPhotos(newPhotos);
    setUploading(false);
  };

  const removePhoto = async (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    setPhotos(updated);
    await base44.entities.Booking.update(booking.id, { completion_photos: updated });
    toast.success('Photo removed');
  };

  const openMaps = () => {
    const addr = property?.address || property?.area || '';
    if (addr) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr + ', Dubai UAE')}`, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 safe-top">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate text-sm">{service?.name || 'Job Detail'}</p>
          <p className="text-[10px] text-slate-400">{STATUS_LABELS[booking.status] || booking.status}</p>
        </div>
        <span className="text-sm font-bold text-slate-900">AED {booking.total_amount}</span>
      </header>

      {/* Status strip */}
      <div className={`h-1.5 w-full ${barColor} flex-shrink-0`} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Date / time / address */}
        <div className="bg-white mx-4 mt-4 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Scheduled</p>
                <p className="text-sm font-semibold text-slate-900">
                  {moment(booking.scheduled_date).format('ddd, MMM D, YYYY')} · {booking.scheduled_time || 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Location</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{property?.address || 'Address pending'}</p>
                {property?.area && <p className="text-xs text-slate-500">{property.area}</p>}
              </div>
              <button
                onClick={openMaps}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl"
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate
              </button>
            </div>

            {customer && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="text-sm font-semibold text-slate-900">{customer.full_name}</p>
                </div>
              </div>
            )}
          </div>

          {(property?.access_notes || booking.customer_notes || booking.admin_notes) && (
            <div className="border-t border-slate-100 p-4 space-y-2">
              {property?.access_notes && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-0.5">Access Notes</p>
                  <p className="text-xs text-amber-800">{property.access_notes}</p>
                </div>
              )}
              {booking.customer_notes && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">Customer Notes</p>
                  <p className="text-xs text-blue-800">{booking.customer_notes}</p>
                </div>
              )}
              {booking.admin_notes && (
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Admin Notes</p>
                  <p className="text-xs text-slate-700">{booking.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">Photos</p>
            {!isFinished && (
              <label className={`flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl cursor-pointer ${uploading ? 'opacity-60' : ''}`}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading...' : 'Add Photos'}
                <input type="file" multiple accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {!isFinished && (
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">{isFinished ? 'No photos uploaded' : 'No photos yet — tap Add Photos'}</p>
          )}
        </div>

        {/* Notes */}
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-900 mb-2">Job Notes</p>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this job…"
            rows={3}
            className="text-sm resize-none"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="mt-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {savingNotes ? 'Saving…' : 'Save Notes'}
          </button>
        </div>

        {/* Delay section */}
        {!isFinished && booking.status !== 'delayed' && showDelay && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-800">Report a Delay</p>
            <Textarea
              value={delayReason}
              onChange={e => setDelayReason(e.target.value)}
              placeholder="Traffic, equipment issue, weather…"
              rows={2}
              className="text-sm bg-white"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowDelay(false)} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl">
                Cancel
              </button>
              <button onClick={handleDelay} disabled={updating} className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl flex items-center justify-center gap-1">
                {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Delay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {!isFinished && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 safe-bottom space-y-2 z-50">
          {nextAction && (
            <button
              onClick={handleStatus}
              disabled={updating}
              className={`w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${nextAction.color}`}
            >
              {updating
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <nextAction.Icon className="w-5 h-5" />}
              {nextAction.label}
            </button>
          )}
          {booking.status !== 'pending' && (
            <button
              onClick={() => setShowDelay(v => !v)}
              className="w-full py-2.5 rounded-xl text-red-600 text-sm font-medium bg-red-50 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Report Delay
            </button>
          )}
        </div>
      )}
    </div>
  );
}