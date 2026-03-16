import React from 'react';
import { STATUS_COLORS } from './calendarUtils';

export default function BookingChip({ booking, service, onClick, isDragging }) {
  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
  const label = service?.name || 'Service';
  const time = booking.scheduled_time?.split('-')[0] || '';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('bookingId', booking.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`
        group cursor-grab active:cursor-grabbing select-none
        rounded-lg border px-2 py-1 text-xs font-medium
        flex items-center gap-1.5 truncate
        transition-all hover:shadow-md hover:-translate-y-px
        ${colors.bg} ${colors.text} ${colors.border}
        ${isDragging ? 'opacity-50' : ''}
      `}
      title={`${label} — ${booking.status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
      {time && <span className="flex-shrink-0 font-semibold">{time}</span>}
      <span className="truncate">{label}</span>
    </div>
  );
}