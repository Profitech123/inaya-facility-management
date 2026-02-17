import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Pencil, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import EmailTemplateEditor from '../components/admin/EmailTemplateEditor';
import DEFAULT_TEMPLATES from '../components/admin/defaultEmailTemplates';

const CATEGORY_COLORS = {
  booking: 'bg-blue-100 text-blue-700',
  subscription: 'bg-purple-100 text-purple-700',
  invoice: 'bg-amber-100 text-amber-800',
  support: 'bg-rose-100 text-rose-700',
  general: 'bg-slate-100 text-slate-600',
};

function AdminEmailTemplatesContent() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list('template_key'),
    initialData: [],
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      setEditingTemplate(null);
      toast.success('Template saved');
    },
  });

  const seedTemplates = async () => {
    setSeeding(true);
    const existing = templates.map(t => t.template_key);
    const missing = DEFAULT_TEMPLATES.filter(d => !existing.includes(d.template_key));
    if (missing.length === 0) {
      toast.info('All templates already exist');
      setSeeding(false);
      return;
    }
    await base44.entities.EmailTemplate.bulkCreate(missing);
    queryClient.invalidateQueries(['emailTemplates']);
    toast.success(`Created ${missing.length} templates`);
    setSeeding(false);
  };

  const handleSave = (templateId, data) => {
    updateMutation.mutate({ id: templateId, data });
  };

  const filtered = templates
    .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
    .filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.template_key?.toLowerCase().includes(search.toLowerCase()));

  const categoryCounts = {
    all: templates.length,
    booking: templates.filter(t => t.category === 'booking').length,
    subscription: templates.filter(t => t.category === 'subscription').length,
    invoice: templates.filter(t => t.category === 'invoice').length,
    support: templates.filter(t => t.category === 'support').length,
  };

  if (editingTemplate) {
    return (
      <div className="space-y-6">
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={(data) => handleSave(editingTemplate.id, data)}
          onCancel={() => setEditingTemplate(null)}
          saving={updateMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-slate-500">Customize system email notifications with dynamic placeholders</p>
        </div>
        {templates.length === 0 && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={seedTemplates} disabled={seeding}>
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Creating...' : 'Initialize Default Templates'}
          </Button>
        )}
        {templates.length > 0 && templates.length < DEFAULT_TEMPLATES.length && (
          <Button variant="outline" className="gap-2" onClick={seedTemplates} disabled={seeding}>
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            Add Missing Templates
          </Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(categoryCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              categoryFilter === key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="pl-10" />
      </div>

      {/* Template List */}
      <div className="space-y-3">
        {filtered.map(template => (
          <Card key={template.id} className={`hover:shadow-md transition-shadow ${template.is_active === false ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      <Badge className={`text-[10px] ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.general}`}>
                        {template.category}
                      </Badge>
                      {template.is_active === false && (
                        <Badge className="bg-red-50 text-red-600 text-[10px]">
                          <XCircle className="w-2.5 h-2.5 mr-0.5" /> Disabled
                        </Badge>
                      )}
                      {template.is_active !== false && (
                        <Badge className="bg-emerald-50 text-emerald-600 text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
                    <div className="mt-2 p-2 bg-slate-50 rounded-md">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Subject</div>
                      <div className="text-xs text-slate-700 font-mono">{template.subject}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(template.placeholders || []).slice(0, 8).map(p => (
                        <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{`{{${p}}}`}</span>
                      ))}
                      {(template.placeholders || []).length > 8 && (
                        <span className="text-[10px] text-slate-400">+{template.placeholders.length - 8} more</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1 flex-shrink-0" onClick={() => setEditingTemplate(template)}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-slate-400">
            {templates.length === 0 ? 'No templates yet. Click "Initialize Default Templates" to get started.' : 'No templates match your filter.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEmailTemplates() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminEmailTemplatesContent />
    </AuthGuard>
  );
}