import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ChevronDown, ChevronUp, MapPin, User, Star, Camera, ZoomIn, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO } from 'date-fns';

function PhotoGallery({ photos, serviceName }) {
  const [lightbox, setLightbox] = useState(null); // index

  if (!photos || !photos.length) return null;

  const mid = Math.ceil(photos.length / 2);
  const before = photos.slice(0, mid);
  const after = photos.slice(mid);

  const allPhotos = [...before, ...after];

  return (
    <div className="mt-4">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Camera className="w-3.5 h-3.5" />
        Service Photos
      </div>

      {before.length && after.length ? (
        <div className="grid grid-cols-2 gap-3">
          {/* Before */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 text-center">Before</div>
            <div className="grid grid-cols-2 gap-1.5">
              {before.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer group"
                  onClick={() => setLightbox(i)}
                >
                  <img src={url} alt={`Before ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* After */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 text-center">After</div>
            <div className="grid grid-cols-2 gap-1.5">
              {after.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer group"
                  onClick={() => setLightbox(mid + i)}
                >
                  <img src={url} alt={`After ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // If only one set, show as a grid
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer group"
              onClick={() => setLightbox(i)}
            >
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-4">
            <button
              className="text-white/40 hover:text-white p-2"
              onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
            >
              ‹
            </button>
            <img
              src={allPhotos[lightbox]}
              alt="Full view"
              className="max-w-4xl max-h-[80vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="text-white/40 hover:text-white p-2 text-4xl leading-none"
              onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(allPhotos.length - 1, l + 1)); }}
            >
              ›
            </button>
          </div>
          <div className="absolute bottom-6 text-white/40 text-sm">
            {lightbox + 1} / {allPhotos.length}
            {lightbox < mid ? ' · Before' : ' · After'}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ booking, service, property, provider }) {
  const [expanded, setExpanded] = useState(false);
  const hasPhotos = booking.completion_photos?.length > 0;

  return (
    <Card className="border-slate-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Main row */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className="bg-emerald-100 text-emerald-700 text-xs font-semibold">Completed</Badge>
                {hasPhotos && (
                  <Badge className="bg-slate-100 text-slate-500 text-xs gap-1 flex items-center">
                    <Camera className="w-3 h-3" />
                    {booking.completion_photos.length} photos
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-slate-900 text-[15px]">{service?.name || 'Service'}</h4>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-sm text-slate-500">
                  {booking.scheduled_date ? format(parseISO(booking.scheduled_date), 'dd MMM yyyy') : ''}
                </span>
                {booking.scheduled_time && (
                  <span className="text-sm text-slate-400">{booking.scheduled_time}</span>
                )}
                {provider && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {provider.full_name}
                  </span>
                )}
                {property && (
                  <span className="text-sm text-slate-500 flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {property.address}
                  </span>
                )}
              </div>

              {booking.total_amount != null && (
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  AED {booking.total_amount.toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to={createPageUrl('BookingDetail') + '?id=' + booking.id}>
                <Button variant="outline" size="sm" className="text-xs hidden sm:flex">
                  Details
                </Button>
              </Link>
              {(hasPhotos || booking.provider_notes || booking.admin_notes) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(e => !e)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded: photos + notes */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 pb-5 pt-4">
            {booking.provider_notes && (
              <div className="mb-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">Technician Notes</div>
                <p className="text-sm text-slate-700 bg-white rounded-xl border border-slate-100 p-3 leading-relaxed">
                  {booking.provider_notes}
                </p>
              </div>
            )}

            <PhotoGallery photos={booking.completion_photos} serviceName={service?.name} />

            {!hasPhotos && !booking.provider_notes && (
              <p className="text-sm text-slate-400 italic">No additional details recorded.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PortalJobHistory({ bookings, services, properties, providers }) {
  const [showAll, setShowAll] = useState(false);

  const completed = bookings
    .filter(b => b.status === 'completed')
    .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));

  const displayed = showAll ? completed : completed.slice(0, 10);

  if (!completed.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
          <History className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No completed jobs yet</h3>
        <p className="text-slate-500 text-sm max-w-sm">Your service history will appear here after your first completed visit.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{completed.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Completed Jobs</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">
            AED {completed.reduce((s, b) => s + (b.total_amount || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Total Spent</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">
            {completed.filter(b => b.completion_photos?.length).length}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Jobs with Photos</div>
        </div>
      </div>

      <div className="space-y-4">
        {displayed.map(booking => (
          <JobCard
            key={booking.id}
            booking={booking}
            service={services.find(s => s.id === booking.service_id)}
            property={properties.find(p => p.id === booking.property_id)}
            provider={providers.find(p => p.id === booking.assigned_provider_id)}
          />
        ))}
      </div>

      {completed.length > 10 && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(s => !s)}
            className="gap-2"
          >
            {showAll ? (
              <><ChevronUp className="w-4 h-4" /> Show Less</>
            ) : (
              <><ChevronDown className="w-4 h-4" /> Load all {completed.length} jobs</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}