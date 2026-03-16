import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import BookingCalendarDashboard from '@/components/admin/booking-calendar/BookingCalendarDashboard';

export default function AdminBookingCalendarPage() {
  return (
    <AuthGuard requiredRole="admin">
      <BookingCalendarDashboard />
    </AuthGuard>
  );
}