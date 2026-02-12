import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfilePropertiesCard({ userId }) {
  const { data: properties = [] } = useQuery({
    queryKey: ['profileProperties', userId],
    queryFn: () => base44.entities.Property.filter({ owner_id: userId }),
    enabled: !!userId,
    initialData: []
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Properties</CardTitle>
          <Link to={createPageUrl('MyProperties')}>
            <Button variant="ghost" size="sm">Manage <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8">
            <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-3">No properties added</p>
            <Link to={createPageUrl('MyProperties')}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Add Property</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 text-sm capitalize">{p.property_type}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {p.address}
                  </div>
                </div>
                {p.bedrooms && <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">{p.bedrooms} BR</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}