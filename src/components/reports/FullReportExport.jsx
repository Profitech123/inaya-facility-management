import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(val) {
  const str = String(val ?? '');
  return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function FullReportExport({ bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate }) {
  
  const handleFullCSV = () => {
    const fb = bookings.filter(b => b.scheduled_date >= startDate && b.scheduled_date <= endDate);
    const fi = invoices.filter(i => (i.invoice_date || '') >= startDate && (i.invoice_date || '') <= endDate);
    const fr = reviews.filter(r => {
      const d = r.review_date || (r.created_date || '').substring(0, 10);
      return d >= startDate && d <= endDate;
    });

    let csv = '=== BOOKINGS ===\n';
    csv += 'ID,Service,Date,Time,Status,Amount,Payment Status,Provider\n';
    fb.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const prov = providers.find(p => p.id === b.assigned_provider_id);
      csv += [b.id?.slice(0, 8), escapeCSV(svc?.name || ''), b.scheduled_date, b.scheduled_time || '', b.status, b.total_amount || 0, b.payment_status || '', escapeCSV(prov?.full_name || '')].join(',') + '\n';
    });

    csv += '\n=== INVOICES ===\n';
    csv += 'Invoice #,Date,Status,Amount,Payment Method\n';
    fi.forEach(i => {
      csv += [escapeCSV(i.invoice_number), i.invoice_date, i.status, i.total_amount || 0, i.payment_method || ''].join(',') + '\n';
    });

    csv += '\n=== TECHNICIANS ===\n';
    csv += 'Name,Active,Rating,Jobs Completed,Specializations\n';
    providers.forEach(p => {
      csv += [escapeCSV(p.full_name), p.is_active ? 'Yes' : 'No', p.average_rating || 0, p.total_jobs_completed || 0, escapeCSV((p.specialization || []).join('; '))].join(',') + '\n';
    });

    csv += '\n=== REVIEWS ===\n';
    csv += 'Date,Technician,Rating,Comment\n';
    fr.forEach(r => {
      const prov = providers.find(p => p.id === r.provider_id);
      csv += [r.review_date || (r.created_date || '').substring(0, 10), escapeCSV(prov?.full_name || ''), r.rating, escapeCSV(r.comment || '')].join(',') + '\n';
    });

    csv += '\n=== SUBSCRIPTIONS ===\n';
    csv += 'ID,Status,Start Date,End Date,Monthly Amount\n';
    subscriptions.forEach(s => {
      csv += [s.id?.slice(0, 8), s.status, s.start_date || '', s.end_date || '', s.monthly_amount || 0].join(',') + '\n';
    });

    downloadCSV(csv, `INAYA_Full_Report_${startDate}_to_${endDate}.csv`);
  };

  const handleFullPDF = () => {
    const doc = new jsPDF();
    const fb = bookings.filter(b => b.scheduled_date >= startDate && b.scheduled_date <= endDate);
    const fi = invoices.filter(i => (i.invoice_date || '') >= startDate && (i.invoice_date || '') <= endDate);
    const fr = reviews.filter(r => {
      const d = r.review_date || (r.created_date || '').substring(0, 10);
      return d >= startDate && d <= endDate;
    });

    // Title page
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text('INAYA Facilities Management', 14, 30);
    doc.setFontSize(16);
    doc.setTextColor(51, 65, 85);
    doc.text('Comprehensive Report', 14, 42);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 54);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 62);

    let y = 80;
    const addSection = (title) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(title, 14, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
    };

    // Summary
    addSection('Executive Summary');
    const totalRevenue = fi.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0);
    const completed = fb.filter(b => b.status === 'completed').length;
    const avgRating = fr.length > 0 ? (fr.reduce((s, r) => s + (r.rating || 0), 0) / fr.length).toFixed(1) : 'N/A';
    const summaryLines = [
      `Total Bookings: ${fb.length}`,
      `Completed: ${completed}`,
      `Total Revenue (Paid): AED ${totalRevenue.toLocaleString()}`,
      `Active Subscriptions: ${subscriptions.filter(s => s.status === 'active').length}`,
      `Active Technicians: ${providers.filter(p => p.is_active).length}`,
      `Reviews: ${fr.length} (Avg: ${avgRating})`,
    ];
    summaryLines.forEach(line => {
      doc.text(line, 14, y);
      y += 6;
    });
    y += 6;

    // Top bookings
    addSection('Bookings Summary (Top 30)');
    fb.slice(0, 30).forEach(b => {
      if (y > 275) { doc.addPage(); y = 20; }
      const svc = services.find(s => s.id === b.service_id);
      doc.text(`${b.scheduled_date} | ${svc?.name || 'Unknown'} | ${b.status} | AED ${b.total_amount || 0}`, 14, y);
      y += 5;
    });
    y += 6;

    // Technician overview
    addSection('Technician Overview');
    providers.forEach(p => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(`${p.full_name} | Rating: ${p.average_rating || 0} | Jobs: ${p.total_jobs_completed || 0} | ${p.is_active ? 'Active' : 'Inactive'}`, 14, y);
      y += 5;
    });
    y += 6;

    // Recent feedback
    addSection('Recent Customer Feedback (Top 15)');
    fr.slice(0, 15).forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      const prov = providers.find(p => p.id === r.provider_id);
      doc.text(`★${r.rating} - ${prov?.full_name || 'Unknown'} - ${r.comment ? r.comment.substring(0, 80) : 'No comment'}`, 14, y);
      y += 5;
    });

    doc.save(`INAYA_Full_Report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl">
      <FileText className="w-5 h-5 text-emerald-600" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">Export Full Combined Report</p>
        <p className="text-xs text-slate-500">All sections combined into a single file ({startDate} to {endDate})</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleFullCSV} className="text-xs bg-white">
        <Download className="w-3.5 h-3.5 mr-1" /> Full CSV
      </Button>
      <Button size="sm" onClick={handleFullPDF} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
        <Download className="w-3.5 h-3.5 mr-1" /> Full PDF Report
      </Button>
    </div>
  );
}