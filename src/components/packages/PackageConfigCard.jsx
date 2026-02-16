import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'any', label: 'Any Property', emoji: '🏠' },
  { value: 'villa', label: 'Villa', emoji: '🏡' },
  { value: 'apartment', label: 'Apartment', emoji: '🏢' },
  { value: 'townhouse', label: 'Townhouse', emoji: '🏘️' },
];

const DURATIONS = [
  { value: '1', label: '1 Month', discount: '' },
  { value: '3', label: '3 Months', discount: '5% off' },
  { value: '6', label: '6 Months', discount: '10% off' },
  { value: '12', label: '12 Months', discount: '15% off' },
];

export default function PackageConfigCard({ packageName, setPackageName, propertyType, setPropertyType, duration, setDuration, editingId }) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-600" />
          {editingId ? 'Edit Package Settings' : 'Package Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Package Name</label>
            <Input
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              placeholder="e.g. My Villa Care Plan"
              className="h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(pt => (
                  <SelectItem key={pt.value} value={pt.value}>
                    <span className="flex items-center gap-2">{pt.emoji} {pt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contract Duration</label>
            <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label} {d.discount && <span className="text-emerald-600 ml-1">({d.discount})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}