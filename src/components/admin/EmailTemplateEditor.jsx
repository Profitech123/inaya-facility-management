import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Save, Eye, Code, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailTemplateEditor({ template, onSave, onCancel, saving }) {
  const [subject, setSubject] = useState(template.subject || '');
  const [body, setBody] = useState(template.body || '');
  const [isActive, setIsActive] = useState(template.is_active !== false);
  const [previewMode, setPreviewMode] = useState(false);
  const quillRef = useRef(null);

  const placeholders = template.placeholders || [];

  const insertPlaceholder = (placeholder) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, `{{${placeholder}}}`);
      quill.setSelection(range.index + placeholder.length + 4);
    }
  };

  const insertPlaceholderToSubject = (placeholder) => {
    setSubject(prev => prev + `{{${placeholder}}}`);
  };

  const copyPlaceholder = (placeholder) => {
    navigator.clipboard.writeText(`{{${placeholder}}}`);
    toast.success(`Copied {{${placeholder}}}`);
  };

  const getPreviewHtml = () => {
    let preview = body;
    const sampleData = {
      customer_name: 'Ahmed Al Rashid',
      customer_email: 'ahmed@example.com',
      booking_id: 'BK-2026-0042',
      service_name: 'AC Maintenance',
      scheduled_date: '20 Feb 2026',
      scheduled_time: '09:00 - 12:00',
      total_amount: '350',
      payment_status: 'Paid',
      provider_name: 'Hassan Ali',
      invoice_number: 'INV-202602-0015',
      due_date: '15 Mar 2026',
      subscription_name: 'Villa Care Essentials',
      property_address: 'Villa 42, Arabian Ranches, Dubai',
      ticket_number: 'TKT-0089',
      company_name: 'INAYA Facilities Management',
    };
    Object.entries(sampleData).forEach(([key, val]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), `<span style="background:#d1fae5;padding:1px 4px;border-radius:3px;font-weight:600">${val}</span>`);
    });
    return preview;
  };

  const handleSave = () => {
    onSave({ subject, body, is_active: isActive });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{template.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
          <Badge className="mt-1.5 bg-slate-100 text-slate-600 text-[10px]">{template.template_key}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-xs text-slate-500">{isActive ? 'Active' : 'Disabled'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Placeholders */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-400" />
            Available Placeholders
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {placeholders.map(p => (
              <button
                key={p}
                onClick={() => copyPlaceholder(p)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Click to copy"
              >
                <span>{`{{${p}}}`}</span>
                <Copy className="w-2.5 h-2.5 opacity-50" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Click to copy · Use toolbar buttons below editor to insert into body</p>
        </CardContent>
      </Card>

      {/* Subject */}
      <div>
        <Label className="text-sm font-semibold">Subject Line</Label>
        <Input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="mt-1 font-mono text-sm"
          placeholder="e.g. Your booking {{booking_id}} has been confirmed"
        />
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {placeholders.slice(0, 6).map(p => (
            <button key={p} onClick={() => insertPlaceholderToSubject(p)} className="text-[10px] text-blue-600 hover:underline cursor-pointer">
              + {p}
            </button>
          ))}
        </div>
      </div>

      {/* Body Editor / Preview Toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold">Email Body</Label>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-3 h-3" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>

        {previewMode ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-xs text-slate-400 mb-3 uppercase font-semibold tracking-wider">Preview with sample data</div>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <ReactQuill
              ref={quillRef}
              value={body}
              onChange={setBody}
              modules={modules}
              theme="snow"
              className="bg-white"
              style={{ minHeight: 250 }}
            />
            <div className="bg-slate-50 border-t px-3 py-2 flex gap-1 flex-wrap">
              <span className="text-[10px] text-slate-400 mr-1 self-center">Insert:</span>
              {placeholders.map(p => (
                <button
                  key={p}
                  onClick={() => insertPlaceholder(p)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-pointer font-mono"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </div>
  );
}