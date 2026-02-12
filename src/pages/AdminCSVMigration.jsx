import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CSVPreviewTable from '../components/admin/CSVPreviewTable';
import CSVColumnMapper from '../components/admin/CSVColumnMapper';
import AuthGuard from '../components/AuthGuard';

const ENTITY_OPTIONS = [
  { value: 'Service', label: 'Services', fields: ['name', 'slug', 'category_id', 'description', 'price', 'duration_minutes', 'image_url', 'is_active'] },
  { value: 'Property', label: 'Properties', fields: ['property_type', 'address', 'area', 'city', 'bedrooms', 'square_meters', 'access_notes', 'owner_id'] },
  { value: 'Provider', label: 'Providers', fields: ['full_name', 'email', 'phone', 'is_active'] },
  { value: 'ServiceArea', label: 'Service Areas', fields: ['area_name', 'emirate', 'is_active', 'service_fee', 'delivery_time'] },
  { value: 'ServiceAddon', label: 'Service Add-ons', fields: ['name', 'description', 'service_id', 'price', 'is_active'] },
];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  });
  return { headers, rows };
}

function AdminCSVMigrationContent() {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const entityConfig = ENTITY_OPTIONS.find(e => e.value === selectedEntity);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setCsvData(parsed);
      // Auto-map matching columns
      const autoMap = {};
      parsed.headers.forEach(h => {
        const lower = h.toLowerCase().replace(/[\s\-]/g, '_');
        const match = entityConfig?.fields.find(f => f === lower || f === h);
        autoMap[h] = match || '_skip';
      });
      setMapping(autoMap);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData || !entityConfig) return;
    setImporting(true);
    setResult(null);

    const records = csvData.rows.map(row => {
      const obj = {};
      csvData.headers.forEach((h, i) => {
        const field = mapping[h];
        if (field && field !== '_skip') {
          let val = row[i] || '';
          // Type coercion for numbers/booleans
          if (['price', 'duration_minutes', 'bedrooms', 'square_meters', 'service_fee'].includes(field)) {
            val = parseFloat(val) || 0;
          } else if (['is_active'].includes(field)) {
            val = val.toLowerCase() === 'true' || val === '1';
          }
          obj[field] = val;
        }
      });
      return obj;
    }).filter(obj => Object.keys(obj).length > 0);

    if (records.length === 0) {
      toast.error('No valid records to import');
      setImporting(false);
      return;
    }

    let success = 0;
    let failed = 0;
    const BATCH = 20;
    for (let i = 0; i < records.length; i += BATCH) {
      const batch = records.slice(i, i + BATCH);
      try {
        await base44.entities[selectedEntity].bulkCreate(batch);
        success += batch.length;
      } catch {
        failed += batch.length;
      }
    }

    setResult({ success, failed, total: records.length });
    setImporting(false);
    if (failed === 0) toast.success(`Imported ${success} records successfully!`);
    else toast.warning(`Imported ${success} of ${records.length} records (${failed} failed)`);
  };

  const reset = () => {
    setCsvData(null);
    setMapping({});
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">CSV Data Migration</h1>
          <p className="text-slate-300">Import data from CSV files into your platform.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Step 1: Select Entity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800">1</Badge>
              Select Data Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEntity} onValueChange={(val) => { setSelectedEntity(val); reset(); }}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Choose what to import..." />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {entityConfig && (
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-xs text-slate-500 mr-1">Available fields:</span>
                {entityConfig.fields.map(f => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Upload CSV */}
        {selectedEntity && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800">2</Badge>
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-emerald-400 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">Click to upload a .csv file</span>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              {csvData && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">{csvData.rows.length} rows found</span>
                  </div>
                  <CSVPreviewTable headers={csvData.headers} rows={csvData.rows} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Map Columns */}
        {csvData && entityConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800">3</Badge>
                Map Columns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CSVColumnMapper
                csvHeaders={csvData.headers}
                entityFields={entityConfig.fields}
                mapping={mapping}
                onMappingChange={setMapping}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Import */}
        {csvData && entityConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800">4</Badge>
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {result.failed === 0 ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    )}
                    <div>
                      <div className="font-semibold text-lg">
                        {result.failed === 0 ? 'Import Complete!' : 'Import Finished with Errors'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {result.success} of {result.total} records imported successfully
                        {result.failed > 0 && ` (${result.failed} failed)`}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={reset}>Import Another File</Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleImport}
                    disabled={importing || Object.values(mapping).every(v => v === '_skip')}
                  >
                    {importing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Start Import</>
                    )}
                  </Button>
                  <span className="text-sm text-slate-500">
                    {Object.values(mapping).filter(v => v !== '_skip').length} columns mapped
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminCSVMigration() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminCSVMigrationContent />
    </AuthGuard>
  );
}