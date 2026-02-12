import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

function convertToCSV(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row => row.map(cell => {
    const str = String(cell ?? '');
    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','));
  return [headerLine, ...dataLines].join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ title, headers, rows }) {
  const handleCSV = () => {
    const csv = convertToCSV(headers, rows);
    downloadFile(csv, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    const startY = 36;
    const cellPadding = 4;
    const colWidth = (doc.internal.pageSize.width - 28) / headers.length;
    let y = startY;

    // Header row
    doc.setFillColor(30, 41, 59);
    doc.setTextColor(255);
    doc.setFontSize(7);
    doc.rect(14, y, doc.internal.pageSize.width - 28, 8, 'F');
    headers.forEach((h, i) => {
      doc.text(String(h), 14 + i * colWidth + cellPadding, y + 5.5);
    });
    y += 8;

    // Data rows
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(7);
    rows.forEach((row, rowIdx) => {
      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }
      if (rowIdx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, doc.internal.pageSize.width - 28, 7, 'F');
      }
      row.forEach((cell, i) => {
        const text = String(cell ?? '').substring(0, 30);
        doc.text(text, 14 + i * colWidth + cellPadding, y + 4.5);
      });
      y += 7;
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleCSV} className="text-xs">
        <Download className="w-3 h-3 mr-1" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handlePDF} className="text-xs">
        <Download className="w-3 h-3 mr-1" /> PDF
      </Button>
    </div>
  );
}