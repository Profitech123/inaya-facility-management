import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { MapPin, User, GripVertical, CheckCircle, AlertCircle, Clock, Truck, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import moment from 'moment';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_CONFIG = {
  pending:     { color: '#94a3b8', bg: 'bg-slate-100',   text: 'text-slate-600',   label: 'Pending',      icon: Clock },
  confirmed:   { color: '#3b82f6', bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Confirmed',    icon: CheckCircle },
  en_route:    { color: '#6366f1', bg: 'bg-indigo-100',  text: 'text-indigo-700',  label: 'En Route',     icon: Truck },
  in_progress: { color: '#f59e0b', bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'In Progress',  icon: Loader2 },
  delayed:     { color: '#ef4444', bg: 'bg-red-100',     text: 'text-red-700',     label: 'Delayed',      icon: AlertCircle },
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'];

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
  return [base[0] + (Math.random() - 0.5) * 0.05, base[1] + (Math.random() - 0.5) * 0.05];
}

function createMarkerIcon(color, isSelected) {
  const size = isSelected ? 32 : 24;
  const border = isSelected ? 4 : 3;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35);transition:all 0.2s;${isSelected ? 'ring:3px solid ' + color : ''}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyToMarker({ coords }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 0.8 });
  }, [coords, map]);
  return null;
}

function JobCard({ booking, service, property, provider, isSelected, onSelect, isDragging }) {
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <div
      onClick={() => onSelect(booking)}
      className={`p-3 rounded-lg border cursor-pointer transition-all text-left w-full
        ${isSelected ? 'border-emerald-400 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}
        ${isDragging ? 'shadow-lg rotate-1 opacity-90' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs text-slate-800 truncate">{service?.name || 'Service'}</p>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{property?.address || property?.area || 'Unknown location'}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {moment(booking.scheduled_date).format('MMM D')} · {booking.scheduled_time || 'TBD'}
          </p>
        </div>
        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
          <Icon className="w-2.5 h-2.5" />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

export default function DispatchMap({ bookings, services, properties, providers: initialProviders, onRefresh }) {
  const [localBookings, setLocalBookings] = useState(bookings);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [saving, setSaving] = useState(null);
  const [savedMsg, setSavedMsg] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Sync with parent prop changes
  React.useEffect(() => { setLocalBookings(bookings); }, [bookings]);

  const activeBookings = useMemo(() =>
    localBookings.filter(b => ACTIVE_STATUSES.includes(b.status)),
    [localBookings]
  );

  const filteredBookings = useMemo(() =>
    filterStatus === 'all' ? activeBookings : activeBookings.filter(b => b.status === filterStatus),
    [activeBookings, filterStatus]
  );

  const markers = useMemo(() =>
    filteredBookings.map(b => ({
      booking: b,
      property: properties.find(p => p.id === b.property_id),
      service: services.find(s => s.id === b.service_id),
      provider: initialProviders.find(p => p.id === b.assigned_provider_id),
      coords: getCoords(properties.find(p => p.id === b.property_id)),
      color: STATUS_CONFIG[b.status]?.color || '#94a3b8',
    })),
    [filteredBookings, properties, services, initialProviders]
  );

  // Group bookings by provider for the sidebar
  const providerGroups = useMemo(() => {
    const groups = {};
    // Unassigned bucket
    groups['__unassigned__'] = { provider: null, bookings: [] };
    initialProviders.forEach(p => { groups[p.id] = { provider: p, bookings: [] }; });
    filteredBookings.forEach(b => {
      const key = b.assigned_provider_id && groups[b.assigned_provider_id] ? b.assigned_provider_id : '__unassigned__';
      groups[key].bookings.push(b);
    });
    return groups;
  }, [filteredBookings, initialProviders]);

  const assignProvider = useCallback(async (bookingId, newProviderId) => {
    setSaving(bookingId);
    setSavedMsg(null);
    const provider = initialProviders.find(p => p.id === newProviderId);
    const updateData = {
      assigned_provider_id: newProviderId || null,
      assigned_provider: provider?.full_name || null,
    };
    await base44.entities.Booking.update(bookingId, updateData);
    setLocalBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updateData } : b));
    if (selectedBooking?.id === bookingId) setSelectedBooking(prev => ({ ...prev, ...updateData }));
    setSaving(null);
    setSavedMsg(bookingId);
    setTimeout(() => setSavedMsg(null), 2000);
  }, [initialProviders, selectedBooking]);

  const onDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    const newProviderId = destination.droppableId === '__unassigned__' ? null : destination.droppableId;
    await assignProvider(draggableId, newProviderId);
  }, [assignProvider]);

  const handleMarkerClick = (m) => {
    setSelectedBooking(m.booking);
    setFlyTo(m.coords);
  };

  const statusCounts = {};
  activeBookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Dispatch Map
            <Badge variant="outline" className="text-xs">{activeBookings.length} active jobs</Badge>
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status legend */}
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) =>
              statusCounts[status] ? (
                <button
                  key={status}
                  onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all
                    ${filterStatus === status ? 'border-slate-400 bg-slate-100 font-semibold' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label} ({statusCounts[status]})
                </button>
              ) : null
            )}
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1 h-7 text-xs">
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex h-[560px]">
          {/* Map */}
          <div className="flex-1 relative">
            {markers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MapPin className="w-10 h-10 mb-3 text-slate-300" />
                <p className="font-medium">No active jobs to display</p>
                <p className="text-sm mt-1">Adjust filters or wait for bookings</p>
              </div>
            ) : (
              <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {flyTo && <FlyToMarker coords={flyTo} />}
                {markers.map((m, idx) => {
                  const isSelected = selectedBooking?.id === m.booking.id;
                  return (
                    <Marker
                      key={m.booking.id}
                      position={m.coords}
                      icon={createMarkerIcon(m.color, isSelected)}
                      eventHandlers={{ click: () => handleMarkerClick(m) }}
                    >
                      <Popup>
                        <div className="text-sm min-w-[200px]">
                          <p className="font-bold text-slate-900">{m.service?.name || 'Service'}</p>
                          <p className="text-xs text-slate-500 mt-1">{m.property?.address || m.property?.area || '—'}</p>
                          <p className="text-xs mt-1">{moment(m.booking.scheduled_date).format('MMM D')} · {m.booking.scheduled_time || 'TBD'}</p>
                          <p className="text-xs mt-1" style={{ color: m.color }}>
                            ● {STATUS_CONFIG[m.booking.status]?.label || m.booking.status}
                          </p>
                          {m.provider ? (
                            <p className="text-xs text-emerald-700 mt-1 font-medium">👷 {m.provider.full_name}</p>
                          ) : (
                            <p className="text-xs text-red-500 mt-1 font-medium">⚠ Unassigned</p>
                          )}
                          <p className="text-xs font-semibold text-slate-600 mt-1">AED {m.booking.total_amount}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}

            {/* Selected booking detail overlay */}
            {selectedBooking && (() => {
              const m = markers.find(x => x.booking.id === selectedBooking.id);
              if (!m) return null;
              const cfg = STATUS_CONFIG[selectedBooking.status] || STATUS_CONFIG.pending;
              return (
                <div className="absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-[1000]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400">AED {selectedBooking.total_amount}</span>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">{m.service?.name || 'Service'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.property?.address || m.property?.area}</p>
                      <p className="text-xs text-slate-400">{moment(selectedBooking.scheduled_date).format('ddd, MMM D')} · {selectedBooking.scheduled_time || 'TBD'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500 mb-1.5 font-medium">Assign to</p>
                      <Select
                        value={selectedBooking.assigned_provider_id || '__none__'}
                        onValueChange={val => assignProvider(selectedBooking.id, val === '__none__' ? null : val)}
                        disabled={saving === selectedBooking.id}
                      >
                        <SelectTrigger className="w-44 h-8 text-xs">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Unassigned</SelectItem>
                          {initialProviders.filter(p => p.is_active).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {saving === selectedBooking.id && <p className="text-[10px] text-blue-500 mt-1">Saving…</p>}
                      {savedMsg === selectedBooking.id && <p className="text-[10px] text-emerald-600 mt-1">✓ Saved</p>}
                    </div>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-sm leading-none">✕</button>
                </div>
              );
            })()}
          </div>

          {/* Provider Sidebar with Drag & Drop */}
          <div className="w-72 border-l border-slate-100 flex flex-col bg-slate-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 bg-white">
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Provider Queue
                <span className="text-slate-400 font-normal ml-auto">Drag jobs to reassign</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <DragDropContext onDragEnd={onDragEnd}>
                {/* Unassigned first */}
                {[
                  '__unassigned__',
                  ...initialProviders.map(p => p.id)
                ].map(key => {
                  const group = providerGroups[key];
                  if (!group) return null;
                  const isUnassigned = key === '__unassigned__';
                  const providerName = isUnassigned ? 'Unassigned' : group.provider?.full_name || 'Unknown';
                  const jobCount = group.bookings.length;

                  return (
                    <div key={key} className="border-b border-slate-100 last:border-0">
                      <div className={`px-3 py-2 flex items-center gap-2 sticky top-0 z-10 ${isUnassigned ? 'bg-red-50' : 'bg-white'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${isUnassigned ? 'bg-red-200 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isUnassigned ? '!' : providerName[0]}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate flex-1">{providerName}</span>
                        {jobCount > 0 && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                            ${isUnassigned ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {jobCount}
                          </span>
                        )}
                      </div>

                      <Droppable droppableId={key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`px-2 pb-2 min-h-[40px] transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50/60' : ''}`}
                          >
                            {group.bookings.length === 0 && !snapshot.isDraggingOver && (
                              <p className="text-[11px] text-slate-400 text-center py-2 italic">Drop jobs here</p>
                            )}
                            {group.bookings.map((b, idx) => {
                              const svc = services.find(s => s.id === b.service_id);
                              const prop = properties.find(p => p.id === b.property_id);
                              const prov = initialProviders.find(p => p.id === b.assigned_provider_id);
                              return (
                                <Draggable key={b.id} draggableId={b.id} index={idx}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      className="mb-1.5"
                                    >
                                      <div className="flex items-center gap-1">
                                        <div {...dragProvided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 py-1">
                                          <GripVertical className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1">
                                          <JobCard
                                            booking={b}
                                            service={svc}
                                            property={prop}
                                            provider={prov}
                                            isSelected={selectedBooking?.id === b.id}
                                            onSelect={(bk) => {
                                              setSelectedBooking(bk);
                                              const marker = markers.find(m => m.booking.id === bk.id);
                                              if (marker) setFlyTo(marker.coords);
                                            }}
                                            isDragging={dragSnapshot.isDragging}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </DragDropContext>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}