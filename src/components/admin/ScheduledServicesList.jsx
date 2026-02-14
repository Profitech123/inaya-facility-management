import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRightLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-green-100 text-green-800',
  skipped: 'bg-slate-100 text-slate-600',
  reassigned: 'bg-orange-100 text-orange-800',
};

export default function ScheduledServicesList() {
  const { data: scheduled = [] } = useQuery({
    queryKey: ['scheduledServices'],
    queryFn: () => base44.entities.ScheduledService.list('-scheduled_date', 100),
    initialData: [],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
    staleTime: 60000,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
    staleTime: 60000,
  });

  const getService = (id) => services.find(s => s.id === id);
  const getProvider = (id) => providers.find(p => p.id === id);
  const getSub = (id) => subscriptions.find(s => s.id === id);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = scheduled.filter(s => s.scheduled_date >= todayStr && s.status !== 'completed' && s.status !== 'skipped');
  const past = scheduled.filter(s => s.scheduled_date < todayStr || s.status === 'completed' || s.status === 'skipped');

  const renderItem = (item) => {
    const svc = getService(item.service_id);
    const provider = getProvider(item.assigned_provider);
    const prevProvider = item.previous_provider ? getProvider(item.previous_provider) : null;

    return (
      <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex flex-col items-center text-center w-14 flex-shrink-0">
            <span className="text-xs text-slate-500">
              {item.scheduled_date ? format(parseISO(item.scheduled_date), 'MMM') : ''}
            </span>
            <span className="text-xl font-bold text-slate-800">
              {item.scheduled_date ? format(parseISO(item.scheduled_date), 'd') : ''}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-800 truncate">{svc?.name || 'Service'}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
              {item.scheduled_time && <span>{item.scheduled_time}</span>}
              {provider && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {provider.full_name}
                </span>
              )}
              {!provider && item.assigned_provider && <span className="text-orange-500">Provider not found</span>}
              {!item.assigned_provider && <span className="text-slate-400">No provider assigned</span>}
            </div>
            {item.status === 'reassigned' && prevProvider && (
              <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                <ArrowRightLeft className="w-3 h-3" />
                Reassigned from {prevProvider.full_name}
                {item.reassignment_reason && <span>— {item.reassignment_reason}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.customer_notified && <Badge variant="outline" className="text-[10px]">Notified</Badge>}
          <Badge className={STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-600'}>
            {item.status}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Upcoming ({upcoming.length})
        </h3>
        {upcoming.length > 0 ? (
          <div className="space-y-2">{upcoming.map(renderItem)}</div>
        ) : (
          <Card><CardContent className="py-8 text-center text-slate-500 text-sm">No upcoming scheduled services. Run the scheduler to generate them.</CardContent></Card>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-3">Past / Completed ({past.length})</h3>
          <div className="space-y-2 opacity-70">{past.map(renderItem)}</div>
        </div>
      )}
    </div>
  );
}