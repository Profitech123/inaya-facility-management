import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, MapPin } from 'lucide-react';

export default function ServiceAreaChecker({ area, city }) {
  const { data: serviceAreas = [] } = useQuery({
    queryKey: ['serviceAreas'],
    queryFn: () => base44.entities.ServiceArea.filter({ is_active: true }),
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  if (!area && !city) return null;

  const searchTerm = (area || city || '').toLowerCase();
  const covered = serviceAreas.some(
    sa =>
      sa.area_name?.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(sa.area_name?.toLowerCase()) ||
      sa.emirate?.toLowerCase() === (city || '').toLowerCase()
  );

  // If no service areas configured at all, don't block
  if (serviceAreas.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${covered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
      {covered ? (
        <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Service available in your area</>
      ) : (
        <><XCircle className="w-4 h-4 flex-shrink-0" /> <span>We may not yet cover <strong>{area || city}</strong>. Contact us to confirm availability.</span></>
      )}
    </div>
  );
}