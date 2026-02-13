import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthDiff(a, b) {
  const da = new Date(a + '-01');
  const db = new Date(b + '-01');
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
}

export default function CohortRetentionChart({ bookings }) {
  const cohortData = useMemo(() => {
    // Group customers by their first booking month (cohort)
    const customerFirst = {};
    const customerActivityMonths = {};

    const sorted = [...bookings].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    sorted.forEach(b => {
      if (!b.customer_id || !b.created_date) return;
      const month = getMonthKey(b.created_date);
      if (!month) return;

      if (!customerFirst[b.customer_id]) {
        customerFirst[b.customer_id] = month;
        customerActivityMonths[b.customer_id] = new Set();
      }
      customerActivityMonths[b.customer_id].add(month);
    });

    // Build cohorts (last 6 months)
    const allMonths = [...new Set(Object.values(customerFirst))].sort();
    const recentMonths = allMonths.slice(-6);

    const cohorts = recentMonths.map(cohortMonth => {
      const cohortCustomers = Object.entries(customerFirst)
        .filter(([_, first]) => first === cohortMonth)
        .map(([id]) => id);

      const size = cohortCustomers.length;
      if (size === 0) return { month: cohortMonth, size, retention: [] };

      // Calculate retention for months 0..5
      const retention = [];
      for (let offset = 0; offset <= 5; offset++) {
        const targetParts = cohortMonth.split('-');
        const targetDate = new Date(parseInt(targetParts[0]), parseInt(targetParts[1]) - 1 + offset, 1);
        const targetMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

        if (new Date(targetMonth + '-01') > new Date()) break;

        const retained = cohortCustomers.filter(id => customerActivityMonths[id]?.has(targetMonth)).length;
        retention.push(Math.round((retained / size) * 100));
      }

      return { month: cohortMonth, size, retention };
    });

    return cohorts.filter(c => c.size > 0);
  }, [bookings]);

  const getCellColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500 text-white';
    if (pct >= 60) return 'bg-emerald-400 text-white';
    if (pct >= 40) return 'bg-emerald-300 text-emerald-900';
    if (pct >= 20) return 'bg-emerald-200 text-emerald-800';
    if (pct > 0) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-50 text-slate-300';
  };

  const monthLabels = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Customer Cohort Retention
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cohortData.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">Not enough data for cohort analysis</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Cohort</th>
                  <th className="text-center py-2 px-1 text-slate-500 font-medium">Size</th>
                  {monthLabels.map(m => (
                    <th key={m} className="text-center py-2 px-1 text-slate-500 font-medium">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortData.map(cohort => (
                  <tr key={cohort.month}>
                    <td className="py-1.5 px-2 font-medium text-slate-700">{cohort.month}</td>
                    <td className="py-1.5 px-1 text-center text-slate-500">{cohort.size}</td>
                    {monthLabels.map((_, idx) => (
                      <td key={idx} className="py-1.5 px-1 text-center">
                        {cohort.retention[idx] !== undefined ? (
                          <span className={`inline-block w-10 py-0.5 rounded text-[10px] font-semibold ${getCellColor(cohort.retention[idx])}`}>
                            {cohort.retention[idx]}%
                          </span>
                        ) : (
                          <span className="text-slate-200">–</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 justify-end">
          <span className="text-[9px] text-slate-400">Low</span>
          {[10, 30, 50, 70, 90].map(v => (
            <span key={v} className={`w-4 h-3 rounded-sm ${getCellColor(v)}`} />
          ))}
          <span className="text-[9px] text-slate-400">High</span>
        </div>
      </CardContent>
    </Card>
  );
}