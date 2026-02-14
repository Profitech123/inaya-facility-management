import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2 } from 'lucide-react';

export default function StepProfile({ provider, onUpdate, onNext }) {
  const [form, setForm] = useState({
    full_name: provider.full_name || '',
    email: provider.email || '',
    phone: provider.phone || '',
    bio: provider.bio || '',
    years_experience: provider.years_experience || '',
    emergency_contact_name: provider.emergency_contact_name || '',
    emergency_contact_phone: provider.emergency_contact_phone || '',
    profile_image: provider.profile_image || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, profile_image: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email || !form.phone) return;
    setSaving(true);
    await onUpdate({ ...form, years_experience: Number(form.years_experience) || 0 });
    setSaving(false);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Let's set up your basic information</p>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {form.profile_image ? (
            <img src={form.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Camera className="w-8 h-8 text-slate-300" />
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors">
            {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
        <div className="text-sm text-slate-500">Upload a professional photo</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Ahmed Hassan" />
        </div>
        <div>
          <Label>Email *</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ahmed@email.com" />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+971 50 123 4567" />
        </div>
        <div>
          <Label>Years of Experience</Label>
          <Input type="number" value={form.years_experience} onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))} placeholder="5" />
        </div>
      </div>

      <div>
        <Label>Short Bio</Label>
        <Textarea
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="A brief introduction about your skills and experience..."
          className="h-20"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Emergency Contact</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Contact Name</Label>
            <Input value={form.emergency_contact_name} onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))} placeholder="Name" />
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input value={form.emergency_contact_phone} onChange={e => setForm(f => ({ ...f, emergency_contact_phone: e.target.value }))} placeholder="+971 ..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !form.full_name || !form.email || !form.phone} className="bg-emerald-600 hover:bg-emerald-700 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Continue
        </Button>
      </div>
    </div>
  );
}