import React from 'react';

export default function CSVPreviewTable({ headers, rows, maxRows = 5 }) {
  if (!headers || headers.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-auto max-h-64">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 sticky top-0">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-slate-700 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, maxRows).map((row, ri) => (
            <tr key={ri} className="border-t">
              {headers.map((_, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[200px] truncate">
                  {row[ci] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div className="text-center text-xs text-slate-400 py-2 bg-slate-50 border-t">
          Showing {maxRows} of {rows.length} rows
        </div>
      )}
    </div>
  );
}