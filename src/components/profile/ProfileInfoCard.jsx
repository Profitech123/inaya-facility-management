import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Save, X, Camera, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

function validatePhone(phone) {
  if (!phone || phone.trim() === '') return 'Phone number is required';
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 7) return 'Phone number is too short (min 7 digits)';
  if (cleaned.length > 15) return 'Phone number is too long (max 15 digits)';
  if (!PHONE_REGEX.test(phone)) return 'Invalid phone format. Use digits, spaces, dashes, or start with +';
  return null;
}

export default function ProfileInfoCard({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    preferred_language: user?.preferred_language || 'english'
  });
  const [phoneError, setPhoneError] = useState(null);

  const handleSave = async () => {
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    setPhoneError(null);
    setSaving(true);
    await base44.auth.updateMe(formData);
    toast.success('Profile updated successfully');
    setSaving(false);
    setEditing(false);
    onUpdate?.();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_image: file_url });
    toast.success('Profile picture updated');
    setUploadingPhoto(false);
    onUpdate?.();
  };

  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative group">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 border-2 border-emerald-200">
                {initials}
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingPhoto ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{user?.full_name || 'User'}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 capitalize mt-1">{user?.role} account</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <Input
                value={formData.phone}
                onChange={e => {
                  setFormData({...formData, phone: e.target.value});
                  if (phoneError) setPhoneError(null);
                }}
                placeholder="+971 50 000 0000"
                className={phoneError ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {phoneError}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Your address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Dubai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Language</label>
              <Select value={formData.preferred_language} onValueChange={val => setFormData({...formData, preferred_language: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoField label="Phone" value={user?.phone || 'Not set'} />
            <InfoField label="Address" value={user?.address || 'Not set'} />
            <InfoField label="City" value={user?.city || 'Not set'} />
            <InfoField label="Language" value={user?.preferred_language === 'arabic' ? 'Arabic' : 'English'} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}