// Cancellation policy configuration
// Configurable thresholds and fee percentages

export const CANCELLATION_POLICY = {
  // Free cancellation window (hours before scheduled time)
  freeCancellationHours: 24,
  // Late cancellation fee (percentage of total_amount)
  lateCancellationFeePercent: 25,
  // Very late / same-day cancellation fee
  sameDayCancellationFeePercent: 50,
  // Same-day threshold (hours before scheduled time)
  sameDayThresholdHours: 4,
  // Max reschedules allowed per booking
  maxReschedules: 2,
  // Minimum hours before service to reschedule
  minRescheduleHours: 4,
  // Statuses that allow cancellation
  cancellableStatuses: ['pending', 'confirmed'],
  // Statuses that allow rescheduling
  reschedulableStatuses: ['pending', 'confirmed'],
};

export function getCancellationDetails(booking) {
  const policy = CANCELLATION_POLICY;
  const now = new Date();

  // Parse scheduled datetime
  const datePart = booking.scheduled_date;
  const timePart = booking.scheduled_time?.split('-')[0] || '09:00';
  const scheduledDate = new Date(`${datePart}T${timePart}:00`);

  const hoursUntilService = (scheduledDate - now) / (1000 * 60 * 60);
  const canCancel = policy.cancellableStatuses.includes(booking.status);

  if (!canCancel) {
    return {
      allowed: false,
      reason: `Cannot cancel a booking that is "${booking.status?.replace('_', ' ')}".`,
      feePercent: 0,
      feeAmount: 0,
      refundAmount: booking.total_amount,
      tier: 'blocked',
    };
  }

  if (hoursUntilService <= 0) {
    return {
      allowed: false,
      reason: 'Cannot cancel a booking that has already passed its scheduled time.',
      feePercent: 0,
      feeAmount: 0,
      refundAmount: 0,
      tier: 'blocked',
    };
  }

  if (hoursUntilService >= policy.freeCancellationHours) {
    return {
      allowed: true,
      reason: `Free cancellation — more than ${policy.freeCancellationHours}h before your service.`,
      feePercent: 0,
      feeAmount: 0,
      refundAmount: booking.total_amount,
      tier: 'free',
    };
  }

  if (hoursUntilService >= policy.sameDayThresholdHours) {
    const fee = Math.round(booking.total_amount * policy.lateCancellationFeePercent / 100);
    return {
      allowed: true,
      reason: `Late cancellation — a ${policy.lateCancellationFeePercent}% fee applies (less than ${policy.freeCancellationHours}h notice).`,
      feePercent: policy.lateCancellationFeePercent,
      feeAmount: fee,
      refundAmount: booking.total_amount - fee,
      tier: 'late',
    };
  }

  const fee = Math.round(booking.total_amount * policy.sameDayCancellationFeePercent / 100);
  return {
    allowed: true,
    reason: `Same-day cancellation — a ${policy.sameDayCancellationFeePercent}% fee applies (less than ${policy.sameDayThresholdHours}h notice).`,
    feePercent: policy.sameDayCancellationFeePercent,
    feeAmount: fee,
    refundAmount: booking.total_amount - fee,
    tier: 'sameday',
  };
}

export function getRescheduleDetails(booking) {
  const policy = CANCELLATION_POLICY;
  const now = new Date();

  const canReschedule = policy.reschedulableStatuses.includes(booking.status);
  const rescheduleCount = booking.reschedule_count || 0;

  if (!canReschedule) {
    return { allowed: false, reason: `Cannot reschedule a booking that is "${booking.status?.replace('_', ' ')}".` };
  }

  if (rescheduleCount >= policy.maxReschedules) {
    return { allowed: false, reason: `Maximum of ${policy.maxReschedules} reschedules reached. Please cancel and rebook.` };
  }

  const datePart = booking.scheduled_date;
  const timePart = booking.scheduled_time?.split('-')[0] || '09:00';
  const scheduledDate = new Date(`${datePart}T${timePart}:00`);
  const hoursUntilService = (scheduledDate - now) / (1000 * 60 * 60);

  if (hoursUntilService < policy.minRescheduleHours) {
    return { allowed: false, reason: `Cannot reschedule within ${policy.minRescheduleHours} hours of the service time.` };
  }

  return {
    allowed: true,
    reason: `You can reschedule up to ${policy.maxReschedules - rescheduleCount} more time(s).`,
    remainingReschedules: policy.maxReschedules - rescheduleCount,
  };
}