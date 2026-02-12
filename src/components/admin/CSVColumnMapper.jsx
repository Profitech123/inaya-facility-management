import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CSVColumnMapper({ csvHeaders, entityFields, mapping, onMappingChange }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-700 mb-2">Map CSV columns to entity fields:</div>
      <div className="grid gap-3">
        {csvHeaders.map(header => (
          <div key={header} className="flex items-center gap-3">
            <div className="w-1/3 text-sm font-mono bg-slate-100 px-3 py-2 rounded truncate" title={header}>
              {header}
            </div>
            <span className="text-slate-400">→</span>
            <Select
              value={mapping[header] || '_skip'}
              onValueChange={(val) => onMappingChange({ ...mapping, [header]: val })}
            >
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Skip this column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_skip">— Skip —</SelectItem>
                {entityFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}