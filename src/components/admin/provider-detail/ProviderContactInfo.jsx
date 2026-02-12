import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, User } from 'lucide-react';

export default function ProviderContactInfo({ provider }) {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 tracking-wider">EMAIL</div>
            <div className="text-sm font-medium text-slate-800">{provider.email || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 tracking-wider">PHONE</div>
            <div className="text-sm font-medium text-slate-800">{provider.phone || '—'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 tracking-wider">PROVIDER ID</div>
            <div className="text-sm font-medium text-slate-800">TEC-{provider.id?.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}