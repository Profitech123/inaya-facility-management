import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, PlusCircle } from 'lucide-react';

export default function AddPropertyDialog({ open, onClose, existingProperties, onRequest }) {
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [newProperty, setNewProperty] = useState({ address: '', area: '', property_type: 'villa', bedrooms: '' });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async () => {
    setIsSubmitting(true);
    const payload = mode === 'existing'
      ? { type: 'existing', property_id: selectedPropertyId, notes }
      : { type: 'new', property: newProperty, notes };
    await onRequest(payload);
    setIsSubmitting(false);
    onClose();
  };

  const canSubmit = mode === 'existing' ? !!selectedPropertyId : !!(newProperty.address && newProperty.area);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Add Property to Subscription
          </DialogTitle>
          <DialogDescription>
            Extend your subscription coverage to another property. Our team will review and adjust your plan accordingly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'existing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setMode('existing')}
            >
              My Properties
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'new' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setMode('new')}
            >
              New Property
            </button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-3">
              {existingProperties.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No other properties found. Add a new property below.</p>
              ) : (
                <div className="space-y-2">
                  {existingProperties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPropertyId(p.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedPropertyId === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.address}</p>
                          <p className="text-xs text-slate-500">{p.area} · {p.property_type} · {p.bedrooms} bed</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Property address"
                value={newProperty.address}
                onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
              />
              <Input
                placeholder="Area / Community (e.g. Dubai Marina)"
                value={newProperty.area}
                onChange={e => setNewProperty({ ...newProperty, area: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newProperty.property_type} onValueChange={v => setNewProperty({ ...newProperty, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Bedrooms"
                  value={newProperty.bedrooms}
                  onChange={e => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                />
              </div>
            </div>
          )}

          <Textarea
            placeholder="Any notes or special requirements (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleRequest}
            disabled={!canSubmit || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Sending...' : 'Submit Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}