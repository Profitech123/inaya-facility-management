import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Pencil, Trash2, ShoppingCart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SavedPackagesList({ packages, services, onDelete, onEdit }) {
  if (packages.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Your Saved Packages</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(pkg => {
          const serviceNames = (pkg.services || []).map(s => {
            const svc = services.find(sv => sv.id === s.service_id);
            return svc?.name || 'Service';
          });

          return (
            <Card key={pkg.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pkg.duration_months || 1} month{(pkg.duration_months || 1) > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    AED {pkg.monthly_price}/mo
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {serviceNames.slice(0, 4).map((name, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-slate-500">
                      {name}
                    </Badge>
                  ))}
                  {serviceNames.length > 4 && (
                    <Badge variant="outline" className="text-[10px] text-slate-400">
                      +{serviceNames.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={() => onEdit(pkg)}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Link to={createPageUrl('SubscribePackage') + '?custom_package=' + pkg.id} className="flex-1">
                    <Button size="sm" className="w-full h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                      <ShoppingCart className="w-3 h-3" /> Subscribe
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-300 hover:text-red-500"
                    onClick={() => onDelete(pkg.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}