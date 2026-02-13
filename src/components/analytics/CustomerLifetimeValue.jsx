import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

export default function CustomerLifetimeValue({ bookings, subscriptions }) {
  const clvData = useMemo(() => {
    const customerMap = {};

    bookings.forEach(b => {
      if (!b.customer_id) return;
      if (!customerMap[b.customer_id]) {
        customerMap[b.customer_id] = { bookingRevenue: 0, subRevenue: 0, bookingCount: 0, firstDate: b.created_date, lastDate: b.created_date };
      }
      customerMap[b.customer_id].bookingRevenue += (b.total_amount || 0);
      customerMap[b.customer_id].bookingCount += 1;
      if (b.created_date < customerMap[b.customer_id].firstDate) customerMap[b.customer_id].firstDate = b.created_date;
      if (b.created_date > customerMap[b.customer_id].lastDate) customerMap[b.customer_id].lastDate = b.created_date;
    });

    subscriptions.forEach(s => {
      if (!s.customer_id) return;
      if (!customerMap[s.customer_id]) {
        customerMap[s.customer_id] = { bookingRevenue: 0, subRevenue: 0, bookingCount: 0, firstDate: s.created_date, lastDate: s.created_date };
      }
      const start = new Date(s.start_date || s.created_date);
      const end = s.end_date ? new Date(s.end_date) : new Date();
      const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
      customerMap[s.customer_id].subRevenue += (s.monthly_amount || 0) * months;
      if (s.created_date && s.created_date < customerMap[s.customer_id].firstDate) customerMap[s.customer_id].firstDate = s.created_date;
    });

    const clvValues = Object.entries(customerMap).map(([id, d]) => ({
      id,
      total: d.bookingRevenue + d.subRevenue,
      bookingRevenue: d.bookingRevenue,
      subRevenue: d.subRevenue,
      bookingCount: d.bookingCount,
      lifespanMonths: Math.max(1, Math.round((new Date(d.lastDate) - new Date(d.firstDate)) / (1000 * 60 * 60 * 24 * 30)))
    }));

    clvValues.sort((a, b) => b.total - a.total);

    // Distribution buckets
    const buckets = [
      { range: '0-500', min: 0, max: 500, count: 0 },
      { range: '500-1K', min: 500, max: 1000, count: 0 },
      { range: '1K-2.5K', min: 1000, max: 2500, count: 0 },
      { range: '2.5K-5K', min: 2500, max: 5000, count: 0 },
      { range: '5K-10K', min: 5000, max: 10000, count: 0 },
      { range: '10K+', min: 10000, max: Infinity, count: 0 },
    ];
    clvValues.forEach(c => {
      const bucket = buckets.find(b => c.total >= b.min && c.total < b.max);
      if (bucket) bucket.count++;
    });

    const avgCLV = clvValues.length > 0 ? clvValues.reduce((s, c) => s + c.total, 0) / clvValues.length : 0;
    const medianCLV = clvValues.length > 0 ? clvValues[Math.floor(clvValues.length / 2)].total : 0;
    const top10 = clvValues.slice(0, 10);
    const topPct = clvValues.length >= 10 ? (clvValues.slice(0, Math.ceil(clvValues.length * 0.1)).reduce((s, c) => s + c.total, 0) / clvValues.reduce((s, c) => s + c.total, 0) * 100) : 0;

    return { buckets, avgCLV, medianCLV, top10, topPct, totalCustomers: clvValues.length };
  }, [bookings, subscriptions]);

  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#f0fdf4'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Customer Lifetime Value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-700">{clvData.avgCLV.toLocaleString('en-AE', { maximumFractionDigits: 0 })} AED</div>
            <div className="text-[10px] text-emerald-600">Avg CLV</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-700">{clvData.medianCLV.toLocaleString('en-AE', { maximumFractionDigits: 0 })} AED</div>
            <div className="text-[10px] text-blue-600">Median CLV</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-700">{clvData.topPct.toFixed(0)}%</div>
            <div className="text-[10px] text-purple-600">Revenue from Top 10%</div>
          </div>
        </div>

        {/* Distribution chart */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">CLV Distribution (AED)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={clvData.buckets} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} customers`, 'Count']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {clvData.buckets.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top customers */}
        {clvData.top10.length > 0 && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Top Customers by CLV</div>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {clvData.top10.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
                    <span className="text-xs text-slate-600 truncate max-w-[100px]">Customer #{c.id.slice(-6)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[9px]">{c.bookingCount} bookings</Badge>
                    <span className="text-xs font-semibold text-slate-800">{c.total.toLocaleString()} AED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}