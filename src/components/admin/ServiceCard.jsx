import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, PackagePlus } from 'lucide-react';

export default function ServiceCard({ service, categoryName, addonCount, onEdit, onDelete, onManageAddons }) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {service.image_url && (
          <div className="h-32 rounded-lg overflow-hidden mb-3 bg-slate-100">
            <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-slate-900 text-base leading-tight">{service.name}</h3>
          <Badge variant={service.is_active !== false ? 'default' : 'secondary'} className="text-[10px] ml-2 flex-shrink-0">
            {service.is_active !== false ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {categoryName && <Badge variant="outline" className="text-[10px] mb-2">{categoryName}</Badge>}
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{service.description || 'No description'}</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-slate-900">AED {service.price}</span>
          {service.duration_minutes && (
            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration_minutes} min</span>
          )}
        </div>
        {addonCount > 0 && (
          <p className="text-xs text-emerald-600 font-medium mb-3">{addonCount} add-on{addonCount > 1 ? 's' : ''}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={onEdit}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Button>
          <Button size="sm" variant="outline" onClick={onManageAddons}><PackagePlus className="w-3.5 h-3.5 mr-1" /> Add-ons</Button>
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => { if (confirm('Delete this service?')) onDelete(); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}