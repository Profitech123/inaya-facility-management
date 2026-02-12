import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Download, DollarSign, FileText } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PaymentHistory() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = createPageUrl('Home'));
  }, []);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: user?.id }, '-invoice_date'),
    enabled: !!user,
    initialData: []
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total_amount, 0);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Payment History</h1>
          <p className="text-slate-300">View your invoices and payment records</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Paid</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">AED {totalPaid.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">AED {totalPending.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invoices</CardTitle>
              <FileText className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No invoices yet</h3>
              <p className="text-slate-600">Your payment history will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map(invoice => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Invoice #{invoice.invoice_number}
                        </h3>
                        <Badge className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Issued: {invoice.invoice_date}
                        </div>
                        {invoice.due_date && (
                          <div>Due: {invoice.due_date}</div>
                        )}
                        {invoice.payment_date && (
                          <div>Paid: {new Date(invoice.payment_date).toLocaleDateString()}</div>
                        )}
                      </div>

                      {invoice.line_items && invoice.line_items.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          {invoice.line_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.description}</span>
                              <span>AED {item.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-slate-900 mb-2">
                        AED {invoice.total_amount.toFixed(2)}
                      </div>
                      {invoice.payment_method && (
                        <div className="text-sm text-slate-500 mb-3">
                          via {invoice.payment_method}
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}