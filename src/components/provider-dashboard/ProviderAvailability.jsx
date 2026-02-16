import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Trash2, MapPin, Clock, Shield, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

const TIME_SLOTS = [
  'all_day', '08:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00'
];

const REASONS = ['Leave', 'Training', 'Personal', 'Medical', 'Other'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProviderAvailability({ provider }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('all_day');
  const [reason, setReason] = useState('Leave');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(moment());
  const queryClient = useQueryClient();

  const { data: blockouts = [], isLoading } = useQuery({
    queryKey: ['myBlockouts', provider.id],
    queryFn: () => base44.entities.TechBlockout.filter({ provider_id: provider.id }, '-date', 100),
    enabled: !!provider.id,
  });

  const { data: serviceAreas = [] } = useQuery({
    queryKey: ['serviceAreas'],
    queryFn: () => base44.entities.ServiceArea.filter({ is_active: true }),
  });

  const addBlockout = useMutation({
    mutationFn: async () => {
      const data = {
        provider_id: provider.id,
        date: isRecurring ? moment().day(recurringDay).format('YYYY-MM-DD') : selectedDate,
        time_slot: selectedSlot,
        reason,
        is_recurring: isRecurring,
      };
      if (isRecurring) data.recurring_day = recurringDay;
      return base44.entities.TechBlockout.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBlockouts'] });
      toast.success('Block-out added');
      setShowForm(false);
      setSelectedDate('');
    },
  });

  const removeBlockout = useMutation({
    mutationFn: (id) => base44.entities.TechBlockout.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBlockouts'] });
      toast.success('Block-out removed');
    },
  });

  // Calendar grid
  const calendarDays = useMemo(() => {
    const start = calendarMonth.clone().startOf('month').startOf('week');
    const end = calendarMonth.clone().endOf('month').endOf('week');
    const days = [];
    const day = start.clone();
    while (day.isSameOrBefore(end)) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    return days;
  }, [calendarMonth]);

  const blockedDates = useMemo(() => {
    const set = new Set();
    blockouts.forEach(b => {
      if (b.is_recurring) {
        // Mark next 8 weeks
        for (let i = 0; i < 8; i++) {
          const d = moment().add(i, 'weeks').day(b.recurring_day).format('YYYY-MM-DD');
          set.add(d);
        }
      } else {
        set.add(b.date);
      }
    });
    return set;
  }, [blockouts]);

  const upcomingBlockouts = blockouts
    .filter(b => b.is_recurring || moment(b.date).isSameOrAfter(moment(), 'day'))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Calendar View */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Availability Calendar
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(m => m.clone().subtract(1, 'month'))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-slate-700 w-28 text-center">{calendarMonth.format('MMMM YYYY')}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(m => m.clone().add(1, 'month'))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isCurrentMonth = day.isSame(calendarMonth, 'month');
                const isToday = day.isSame(moment(), 'day');
                const isBlocked = blockedDates.has(day.format('YYYY-MM-DD'));
                const isPast = day.isBefore(moment(), 'day');

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isPast && isCurrentMonth) {
                        setSelectedDate(day.format('YYYY-MM-DD'));
                        setIsRecurring(false);
                        setShowForm(true);
                      }
                    }}
                    disabled={isPast || !isCurrentMonth}
                    className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all relative ${
                      !isCurrentMonth ? 'text-slate-200' :
                      isPast ? 'text-slate-300 cursor-not-allowed' :
                      isBlocked ? 'bg-red-100 text-red-700 font-semibold' :
                      isToday ? 'bg-emerald-100 text-emerald-700 font-bold ring-2 ring-emerald-500' :
                      'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day.date()}
                    {isBlocked && <span className="absolute bottom-0.5 w-1 h-1 bg-red-500 rounded-full" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Today</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Blocked</span>
            </div>
          </CardContent>
        </Card>

        {/* Block-out Form + List */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Block-out Time</h3>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowForm(!showForm)}>
                  <Plus className="w-3.5 h-3.5" /> Add Block-out
                </Button>
              </div>

              {showForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Recurring weekly?</label>
                    <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                  </div>

                  {isRecurring ? (
                    <Select value={String(recurringDay)} onValueChange={v => setRecurringDay(Number(v))}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={moment().format('YYYY-MM-DD')} />
                  )}

                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(s => <SelectItem key={s} value={s}>{s === 'all_day' ? 'All Day' : s}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={(!isRecurring && !selectedDate) || addBlockout.isPending}
                      onClick={() => addBlockout.mutate()}
                    >
                      {addBlockout.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      Add Block-out
                    </Button>
                  </div>
                </div>
              )}

              {/* Upcoming block-outs */}
              {isLoading ? (
                <div className="py-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></div>
              ) : upcomingBlockouts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No upcoming block-outs. You're fully available!</p>
              ) : (
                <div className="space-y-2">
                  {upcomingBlockouts.map(b => (
                    <div key={b.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {b.is_recurring ? `Every ${DAYS_OF_WEEK[b.recurring_day || 0]}` : moment(b.date).format('ddd, MMM D')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {b.time_slot === 'all_day' ? 'All day' : b.time_slot} · {b.reason}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-100"
                        onClick={() => removeBlockout.mutate(b.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Areas */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-slate-400" /> Service Areas
              </h3>
              {serviceAreas.length === 0 ? (
                <p className="text-sm text-slate-400">No service areas configured.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.map(area => (
                    <Badge key={area.id} variant="outline" className="px-3 py-1.5 text-xs font-medium">
                      {area.area_name}
                      {area.emirate !== 'Dubai' && <span className="text-slate-400 ml-1">({area.emirate})</span>}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-3">
                Service areas are managed by the admin team. Contact your manager to update.
              </p>
            </CardContent>
          </Card>

          {/* Provider Status */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-slate-400" /> My Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active & Available</span>
                  <Badge className={provider.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                    {provider.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Specializations</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {(provider.specialization || []).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                    {(!provider.specialization || provider.specialization.length === 0) && (
                      <span className="text-xs text-slate-400">Not set</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Experience</span>
                  <span className="text-sm font-medium text-slate-900">{provider.years_experience ? `${provider.years_experience} years` : 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}