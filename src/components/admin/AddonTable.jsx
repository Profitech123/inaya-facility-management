import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, PackagePlus } from 'lucide-react';

export default function AddonTable({ addons, services, onEdit, onDelete, onCreate }) {
  const getServiceName = (serviceId) => {
    if (!serviceId) return 'All Services';
    return services.find(s => s.id === serviceId)?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <PackagePlus className="w-4 h-4 text-emerald-600" />
          Service Add-ons ({addons.length})
        </CardTitle>
        <Button size="sm" onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1" /> Add Add-on
        </Button>
      </CardHeader>
      <CardContent>
        {addons.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <PackagePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No add-ons yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Linked Service</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-center">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {addons.map(addon => (
                  <tr key={addon.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-slate-800">{addon.name}</p>
                        {addon.description && <p className="text-xs text-slate-400 line-clamp-1">{addon.description}</p>}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="text-[10px]">{getServiceName(addon.service_id)}</Badge>
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-800">AED {addon.price}</td>
                    <td className="py-3 text-center">
                      <Badge variant={addon.is_active !== false ? 'default' : 'secondary'} className="text-[10px]">
                        {addon.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(addon)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { if (confirm('Delete this add-on?')) onDelete(addon.id); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}