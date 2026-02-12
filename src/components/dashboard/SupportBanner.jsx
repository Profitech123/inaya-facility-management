import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SupportBanner() {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-white font-bold text-lg mb-1">Having an issue at your property?</h3>
        <p className="text-slate-400 text-sm">Our support team and emergency technicians are available 24/7 to assist you with any urgent facility matters.</p>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        <Link to={createPageUrl('Support')}>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 rounded-full gap-2">
            <Phone className="w-4 h-4" /> Help Center
          </Button>
        </Link>
        <Link to={createPageUrl('Contact')}>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full gap-2">
            <MessageSquare className="w-4 h-4" /> Live Support
          </Button>
        </Link>
      </div>
    </div>
  );
}