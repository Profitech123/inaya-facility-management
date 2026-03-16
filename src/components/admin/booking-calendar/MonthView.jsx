import React, { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, isToday
} from 'date-fns';
import BookingChip from './BookingChip';
import { toDateString } from './calendarUtils';

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE = 3;

export default function MonthView({ currentDate, bookings, serviceMap, onDrop, onBookingClick }) {
  const [dragOver, setDragOver] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

  const days = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const bookingsByDay = {};
  bookings.forEach(b => {
    const key = b.scheduled_date?.slice(0, 10);
    if (!bookingsByDay[key]) bookingsByDay[key] = [];
    bookingsByDay[key].push(b);
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

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAY_HEADERS.map(h => (
          <div key={h} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wide border-r border-slate-100 last:border-r-0">
            {h}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0" style={{ minHeight: '110px' }}>
          {week.map((day, di) => {
            const dateStr = toDateString(day);
            const dayBookings = bookingsByDay[dateStr] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isT = isToday(day);
            const isDragTarget = dragOver === dateStr;
            const isExpanded = expanded === dateStr;
            const visible = isExpanded ? dayBookings : dayBookings.slice(0, MAX_VISIBLE);
            const hiddenCount = dayBookings.length - MAX_VISIBLE;

            return (
              <div
                key={di}
                className={`
                  border-r border-slate-100 last:border-r-0 p-1.5 space-y-1 relative
                  transition-colors duration-100
                  ${!isCurrentMonth ? 'bg-slate-50/60' : ''}
                  ${isT ? 'bg-emerald-50/50' : ''}
                  ${isDragTarget ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : ''}
                `}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                {/* Date number */}
                <div className="flex items-center justify-between">
                  <span className={`
                    text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                    ${isT ? 'bg-emerald-500 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] text-slate-400">{dayBookings.length}</span>
                  )}
                </div>

                {/* Booking chips */}
                {visible.map(b => (
                  <BookingChip
                    key={b.id}
                    booking={b}
                    service={serviceMap[b.service_id]}
                    onClick={onBookingClick}
                  />
                ))}

                {!isExpanded && hiddenCount > 0 && (
                  <button
                    onClick={() => setExpanded(dateStr)}
                    className="text-[10px] text-blue-500 hover:text-blue-700 font-medium pl-1"
                  >
                    +{hiddenCount} more
                  </button>
                )}
                {isExpanded && (
                  <button
                    onClick={() => setExpanded(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-medium pl-1"
                  >
                    Show less
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}