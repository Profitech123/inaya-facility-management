import React, { useState } from 'react';
import { addDays, format, isToday } from 'date-fns';
import BookingChip from './BookingChip';
import { toDateString } from './calendarUtils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekView({ startDate, bookings, serviceMap, providerMap, onDrop, onBookingClick }) {
  const [dragOver, setDragOver] = useState(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const bookingsByDay = {};
  days.forEach(d => {
    bookingsByDay[toDateString(d)] = [];
  });
  bookings.forEach(b => {
    const key = b.scheduled_date?.slice(0, 10);
    if (bookingsByDay[key]) bookingsByDay[key].push(b);
  });

  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(dateStr);
  };

  const handleDrop = (e, dateStr) => {
    e.preventDefault();
    setDragOver(null);
    const bookingId = e.dataTransfer.getData('bookingId');
    if (bookingId) onDrop(bookingId, dateStr);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {days.map((day, i) => {
            const isT = isToday(day);
            return (
              <div key={i} className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${isT ? 'bg-emerald-50' : ''}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isT ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {DAYS[day.getDay()]}
                </p>
                <p className={`text-xl font-bold mt-0.5 ${isT ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </p>
                <p className={`text-[10px] ${isT ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {format(day, 'MMM')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Content rows */}
        <div className="grid grid-cols-7" style={{ minHeight: '520px' }}>
          {days.map((day, i) => {
            const dateStr = toDateString(day);
            const dayBookings = bookingsByDay[dateStr] || [];
            const isT = isToday(day);
            const isDragTarget = dragOver === dateStr;

            return (
              <div
                key={i}
                className={`
                  border-r border-slate-100 last:border-r-0 p-2 space-y-1.5
                  transition-colors duration-100
                  ${isT ? 'bg-emerald-50/40' : ''}
                  ${isDragTarget ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : ''}
                `}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                {dayBookings.map(b => (
                  <BookingChip
                    key={b.id}
                    booking={b}
                    service={serviceMap[b.service_id]}
                    onClick={onBookingClick}
                  />
                ))}
                {dayBookings.length === 0 && (
                  <div className="h-full min-h-[60px] flex items-center justify-center">
                    <span className="text-[10px] text-slate-300">Drop here</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}