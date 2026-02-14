import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row => row.map(cell => {
    const str = String(cell ?? '');
    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export default function AnalyticsExportPanel({
  bookings, subscriptions, providers, services, startDate, endDate
}) {
  const exports = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;

    return {
      bookings: {
        headers: ['Date', 'Service', 'Status', 'Payment', 'Amount (AED)', 'Provider'],
        rows: bookings
          .filter(b => inRange(b.scheduled_date))
          .map(b => {
            const svc = services.find(s => s.id === b.service_id);
            const prov = providers.find(p => p.id === b.assigned_provider_id);
            return [
              b.scheduled_date,
              svc?.name || 'Unknown',
              b.status,
              b.payment_status,
              b.total_amount || 0,
              prov?.full_name || 'Unassigned',
            ];
          }),
      },
      subscriptions: {
        headers: ['Customer ID', 'Package ID', 'Status', 'Monthly (AED)', 'Start', 'End', 'Auto-Renew'],
        rows: subscriptions.map(s => [
          s.customer_id,
          s.package_id,
          s.status,
          s.monthly_amount,
          s.start_date,
          s.end_date || 'N/A',
          s.auto_renew ? 'Yes' : 'No',
        ]),
      },
      technicians: {
        headers: ['Name', 'Email', 'Active', 'Rating', 'Jobs Completed', 'Specializations'],
        rows: providers.map(p => [
          p.full_name,
          p.email,
          p.is_active ? 'Yes' : 'No',
          p.average_rating || 0,
          p.total_jobs_completed || 0,
          (p.specialization || []).join('; '),
        ]),
      },
    };
  }, [bookings, subscriptions, providers, services, startDate, endDate]);

  const handleCSVExport = (key) => {
    const exp = exports[key];
    const csv = toCSV(exp.headers, exp.rows);
    downloadCSV(csv, `INAYA_${key}_${startDate}_to_${endDate}.csv`);
  };

  const handleFullPDFReport = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.width;

    // Title page
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text('INAYA Analytics Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 47);

    let y = 65;

    const addSection = (title, headers, rows) => {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(title, 14, y);
      y += 8;

      const colW = (pageW - 28) / headers.length;

      // Header
      doc.setFillColor(30, 41, 59);
      doc.setTextColor(255);
      doc.setFontSize(7);
      doc.rect(14, y, pageW - 28, 7, 'F');
      headers.forEach((h, i) => doc.text(String(h), 14 + i * colW + 2, y + 5));
      y += 7;

      // Rows
      doc.setTextColor(51, 65, 85);
      rows.slice(0, 50).forEach((row, ri) => {
        if (y > doc.internal.pageSize.height - 15) { doc.addPage(); y = 20; }
        if (ri % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, pageW - 28, 6, 'F');
        }
        row.forEach((cell, i) => doc.text(String(cell ?? '').substring(0, 25), 14 + i * colW + 2, y + 4.5));
        y += 6;
      });
      y += 10;
    };

    addSection(`Bookings (${exports.bookings.rows.length})`, exports.bookings.headers, exports.bookings.rows);
    addSection(`Subscriptions (${exports.subscriptions.rows.length})`, exports.subscriptions.headers, exports.subscriptions.rows);
    addSection(`Technicians (${exports.technicians.rows.length})`, exports.technicians.headers, exports.technicians.rows);

    doc.save(`INAYA_Analytics_Report_${startDate}_${endDate}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleFullPDFReport}>
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          Full PDF Report
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleCSVExport('bookings')}>
          <Table className="w-4 h-4 mr-2 text-emerald-500" />
          Bookings CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCSVExport('subscriptions')}>
          <Table className="w-4 h-4 mr-2 text-blue-500" />
          Subscriptions CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCSVExport('technicians')}>
          <Table className="w-4 h-4 mr-2 text-violet-500" />
          Technicians CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}