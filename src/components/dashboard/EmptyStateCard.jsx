import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmptyStateCard({ icon: Icon, title, description, actionLabel, actionPage, className = '' }) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center text-center py-14 px-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">{description}</p>
        {actionLabel && actionPage && (
          <Link to={createPageUrl(actionPage)}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">{actionLabel}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}