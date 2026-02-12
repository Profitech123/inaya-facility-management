import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Wrench, Eye, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProviderCurrentAssignment({ booking, service, property }) {
  if (!booking) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Current Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            No active assignment right now
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUrgent = booking.status === 'in_progress';

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Assignment</CardTitle>
          <div className="flex items-center gap-2">
            {isUrgent && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE TRACKING
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Map placeholder */}
          <div className="w-full lg:w-56 h-44 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
            <img
              src="https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/55.27,25.20,12,0/300x250?access_token=pk.placeholder"
              alt="Map"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                const span = document.createElement('span');
                span.className = 'text-slate-400 text-sm';
                span.textContent = '📍 Map View';
                e.target.parentElement.appendChild(span);
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge className={isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                {isUrgent ? 'URGENT MAINTENANCE' : booking.status?.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-400">Job ID: #WO-{booking.id?.slice(0, 4)}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-3">
              {service?.name || 'Service'} {property ? `- ${property.address}` : ''}
            </h3>

            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm mb-4">
              {property && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {property.area || property.address}
                </div>
              )}
              {booking.started_at && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Started {new Date(booking.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Wrench className="w-4 h-4 text-blue-500" />
                {service?.name || 'Service'}
              </div>
              {booking.scheduled_time && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  EST: {booking.scheduled_time}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link to={createPageUrl('AdminBookings')}>
                <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Eye className="w-4 h-4" /> View Full WO
                </Button>
              </Link>
              {property && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Navigation className="w-4 h-4" /> Track Location
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}