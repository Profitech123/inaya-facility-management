export const STATUS_COLORS = {
  pending:    { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-300',   dot: 'bg-amber-500' },
  confirmed:  { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300',    dot: 'bg-blue-500' },
  en_route:   { bg: 'bg-indigo-100',  text: 'text-indigo-800',  border: 'border-indigo-300',  dot: 'bg-indigo-500' },
  in_progress:{ bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-300',  dot: 'bg-purple-500' },
  completed:  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  cancelled:  { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-300',     dot: 'bg-red-400' },
  delayed:    { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-300',  dot: 'bg-orange-500' },
};

export function statusLabel(status) {
  const map = {
    pending: 'Pending', confirmed: 'Confirmed', en_route: 'En Route',
    in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', delayed: 'Delayed',
  };
  return map[status] || status;
}

export function toDateString(date) {
  // Returns YYYY-MM-DD in local time
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}