import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, RotateCcw } from 'lucide-react';

const PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '12 Months', days: 365 },
];

export default function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange, onReset }) {
  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onStartChange(start.toISOString().split('T')[0]);
    onEndChange(end.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border rounded-lg p-3">
      <Calendar className="w-4 h-4 text-slate-400" />
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="w-auto h-8 text-sm"
      />
      <span className="text-slate-400 text-sm">to</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="w-auto h-8 text-sm"
      />
      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <Button key={p.days} variant="ghost" size="sm" className="text-xs h-7"
            onClick={() => applyPreset(p.days)}>
            {p.label}
          </Button>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="h-7" onClick={onReset}>
        <RotateCcw className="w-3 h-3 mr-1" /> Reset
      </Button>
    </div>
  );
}