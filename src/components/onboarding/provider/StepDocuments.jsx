import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Check, X, Loader2, Plus } from 'lucide-react';

function DocumentUploader({ label, description, value, onChange, required }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className={`p-4 rounded-xl border-2 border-dashed transition-colors ${value ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${value ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            {value ? <Check className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-slate-400" />}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800">
              {label} {required && <span className="text-red-400">*</span>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            {value && (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline mt-1 inline-block">
                View uploaded file
              </a>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {value ? (
            <Button variant="ghost" size="sm" onClick={() => onChange('')} className="text-slate-400 hover:text-red-500 h-8">
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <label>
              <Button variant="outline" size="sm" className="cursor-pointer h-8" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                  Upload
                </span>
              </Button>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StepDocuments({ provider, onUpdate, onNext, onBack }) {
  const [emiratesId, setEmiratesId] = useState(provider.document_emirates_id || '');
  const [passport, setPassport] = useState(provider.document_passport || '');
  const [tradeLicense, setTradeLicense] = useState(provider.document_trade_license || '');
  const [certifications, setCertifications] = useState(provider.document_certifications || []);
  const [saving, setSaving] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  const addCertification = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCertifications(prev => [...prev, file_url]);
    setCertUploading(false);
  };

  const removeCertification = (idx) => {
    setCertifications(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({
      document_emirates_id: emiratesId,
      document_passport: passport,
      document_trade_license: tradeLicense,
      document_certifications: certifications,
    });
    setSaving(false);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Document Uploads</h2>
        <p className="text-slate-500 text-sm mt-1">Upload required identification and certification documents</p>
      </div>

      <div className="space-y-3">
        <DocumentUploader
          label="Emirates ID"
          description="Front and back of your UAE Emirates ID card"
          value={emiratesId}
          onChange={setEmiratesId}
          required
        />
        <DocumentUploader
          label="Passport"
          description="Valid passport – data page"
          value={passport}
          onChange={setPassport}
          required
        />
        <DocumentUploader
          label="Trade License"
          description="Your trade license or company license (if applicable)"
          value={tradeLicense}
          onChange={setTradeLicense}
        />
      </div>

      {/* Certifications (multiple) */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 mb-2 block">Professional Certifications</Label>
        <p className="text-xs text-slate-500 mb-3">Upload any relevant certifications (HVAC, electrical, safety, etc.)</p>
        <div className="space-y-2">
          {certifications.map((url, idx) => (
            <div key={idx} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 hover:underline truncate">
                  Certificate {idx + 1}
                </a>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeCertification(idx)} className="h-6 text-slate-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <label>
            <Button variant="outline" size="sm" className="cursor-pointer gap-1.5" asChild disabled={certUploading}>
              <span>
                {certUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Certification
              </span>
            </Button>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={addCertification} disabled={certUploading} />
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onNext} className="text-slate-500">Skip for now</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}