import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import moment from 'moment';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_COLORS = {
  confirmed: '#3b82f6',
  en_route: '#6366f1',
  in_progress: '#f59e0b',
  delayed: '#ef4444',
  pending: '#94a3b8',
};

const STATUS_LABELS = {
  confirmed: 'Confirmed',
  en_route: 'En Route',
  in_progress: 'In Progress',
  delayed: 'Delayed',
  pending: 'Pending',
};

function createIcon(color) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const DUBAI_AREAS = {
  'dubai marina': [25.0805, 55.1403],
  'jbr': [25.0784, 55.1343],
  'palm jumeirah': [25.1124, 55.1390],
  'downtown': [25.1972, 55.2744],
  'business bay': [25.1860, 55.2722],
  'jlt': [25.0712, 55.1416],
  'deira': [25.2697, 55.3095],
  'bur dubai': [25.2532, 55.2966],
  'jumeirah': [25.2106, 55.2533],
  'al barsha': [25.1134, 55.1977],
  'motor city': [25.0467, 55.2367],
  'silicon oasis': [25.1178, 55.3783],
  'arabian ranches': [25.0563, 55.2620],
  'hor al anz': [25.2768, 55.3295],
  'default': [25.2048, 55.2708],
};

function getCoords(property) {
  if (!property) return DUBAI_AREAS.default;
  const text = ((property.area || '') + ' ' + (property.address || '')).toLowerCase();
  for (const [area, coords] of Object.entries(DUBAI_AREAS)) {
    if (area !== 'default' && text.includes(area)) return coords;
  }
  const base = DUBAI_AREAS.default;
  return [base[0] + (Math.random() - 0.5) * 0.04, base[1] + (Math.random() - 0.5) * 0.04];
}

export default function ActiveJobsMap({ bookings, services, properties, providers, onSelectBooking }) {
  const [realtimeBookings, setRealtimeBookings] = useState(bookings);

  useEffect(() => {
    setRealtimeBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    const unsubscribe = base44.entities.Booking.subscribe((event) => {
      if (event.type === 'update') {
        setRealtimeBookings(prev => prev.map(b => b.id === event.id ? event.data : b));
      } else if (event.type === 'create') {
        setRealtimeBookings(prev => [event.data, ...prev]);
      }
    });
    return unsubscribe;
  }, []);

  const activeBookings = realtimeBookings.filter(b =>
    ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status)
  );

  const markers = useMemo(() =>
    activeBookings.map(b => {
      const property = properties.find(p => p.id === b.property_id);
      const service = services.find(s => s.id === b.service_id);
      const provider = providers.find(p => p.id === b.assigned_provider_id);
      return {
        booking: b, property, service, provider,
        coords: getCoords(property),
        color: STATUS_COLORS[b.status] || '#94a3b8',
      };
    }),
    [activeBookings, properties, services, providers]
  );

  const statusCounts = {};
  activeBookings.forEach(b => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Active Jobs — Real-Time Map
            <Badge variant="outline" className="ml-2 text-xs">{activeBookings.length} active</Badge>
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              statusCounts[status] ? (
                <span key={status} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {STATUS_LABELS[status]} ({statusCounts[status]})
                </span>
              ) : null
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {markers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-medium">No active jobs right now</p>
          </div>
        ) : (
          <div className="h-[380px]">
            <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markers.map((m, idx) => (
                <Marker key={idx} position={m.coords} icon={createIcon(m.color)}>
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <p className="font-bold text-slate-900">{m.service?.name || 'Service'}</p>
                      <p className="text-xs text-slate-500 mt-1">{m.property?.address || 'Address'}</p>
                      <p className="text-xs mt-1">
                        {moment(m.booking.scheduled_date).format('MMM D')} · {m.booking.scheduled_time || 'TBD'}
                      </p>
                      {m.provider && (
                        <p className="text-xs text-emerald-700 mt-1 font-medium">Tech: {m.provider.full_name}</p>
                      )}
                      <p className="text-xs mt-1 capitalize font-medium" style={{ color: m.color }}>
                        {m.booking.status.replace('_', ' ')}
                      </p>
                      {onSelectBooking && (
                        <button
                          onClick={() => onSelectBooking(m.booking)}
                          className="text-xs text-blue-600 font-medium hover:underline mt-2 block"
                        >
                          View / Manage →
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}