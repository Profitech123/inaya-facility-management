import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin } from 'lucide-react';
import moment from 'moment';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
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
};

function createIcon(color) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Dubai area coordinates for geocoding approximation
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
  'sports city': [25.0415, 55.2230],
  'arabian ranches': [25.0563, 55.2620],
  'hor al anz': [25.2768, 55.3295],
  'default': [25.2048, 55.2708],
};

function getApproxCoords(property) {
  if (!property) return DUBAI_AREAS.default;
  const text = ((property.area || '') + ' ' + (property.address || '')).toLowerCase();
  for (const [area, coords] of Object.entries(DUBAI_AREAS)) {
    if (area !== 'default' && text.includes(area)) return coords;
  }
  // Add small random offset for visual spread
  const base = DUBAI_AREAS.default;
  return [base[0] + (Math.random() - 0.5) * 0.05, base[1] + (Math.random() - 0.5) * 0.05];
}

export default function ProviderJobMap({ bookings, services, properties, onSelectBooking }) {
  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));

  const markers = useMemo(() => 
    activeBookings.map(b => {
      const property = properties.find(p => p.id === b.property_id);
      const service = services.find(s => s.id === b.service_id);
      const coords = getApproxCoords(property);
      return { booking: b, property, service, coords, color: STATUS_COLORS[b.status] || '#64748b' };
    }),
    [activeBookings, properties, services]
  );

  if (markers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No active jobs to display on map</p>
          <p className="text-sm mt-1">Active jobs will appear here with location pins</p>
        </CardContent>
      </Card>
    );
  }

  const center = markers.length > 0 ? markers[0].coords : DUBAI_AREAS.default;

  return (
    <Card className="overflow-hidden">
      <div className="h-[400px] sm:h-[450px]">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m, idx) => (
            <Marker key={idx} position={m.coords} icon={createIcon(m.color)}>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-bold">{m.service?.name || 'Service'}</p>
                  <p className="text-slate-500 text-xs mt-1">{m.property?.address || 'Address'}</p>
                  <p className="text-xs mt-1">{moment(m.booking.scheduled_date).format('MMM D')} · {m.booking.scheduled_time || 'TBD'}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onSelectBooking(m.booking)}
                      className="text-xs text-emerald-700 font-medium hover:underline"
                    >
                      View Details
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((m.property?.address || '') + ', Dubai, UAE')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      Navigate
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="px-4 py-2.5 bg-slate-50 border-t flex items-center gap-4 text-xs text-slate-500 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}