import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, Save, X, Star, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';

function AdminContentValues() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        content: '',
        rating: 5,
        image: '',
        is_active: true
    });

    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['adminTestimonials'],
        queryFn: () => base44.entities.Testimonial.list('display_order'),
        staleTime: 30000,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Testimonial.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTestimonials']);
            toast.success('Testimonial added');
            setIsCreating(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTestimonials']);
            toast.success('Testimonial updated');
            setEditingId(null);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Testimonial.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTestimonials']);
            toast.success('Testimonial deleted');
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            content: '',
            rating: 5,
            image: '',
            is_active: true
        });
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            role: item.role,
            content: item.content,
            rating: item.rating,
            image: item.image,
            is_active: item.is_active
        });
        setIsCreating(false);
    };

    const handleSave = () => {
        if (!formData.name || !formData.content) {
            toast.error('Name and Content are required');
            return;
        }

        if (isCreating) {
            createMutation.mutate({ ...formData, display_order: testimonials.length + 1 });
        } else if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                        <p className="text-slate-500">Manage website content and testimonials</p>
                    </div>
                    <Button onClick={() => { setIsCreating(true); setEditingId(null); resetForm(); }} disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">Testimonials</h2>

                        {isLoading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : testimonials.length === 0 && !isCreating ? (
                            <div className="text-center py-8 text-slate-400">No testimonials yet. Add one!</div>
                        ) : (
                            testimonials.map((item) => (
                                <Card key={item.id} className={`transition-all ${editingId === item.id ? 'border-emerald-500 shadow-md' : 'hover:shadow-sm'}`}>
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/50'}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-full object-cover bg-slate-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                                    <p className="text-xs text-slate-500">{item.role}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-emerald-600" onClick={() => handleEdit(item)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => {
                                                        if (confirm('Delete this testimonial?')) deleteMutation.mutate(item.id);
                                                    }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex text-amber-400 my-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Editor Section */}
                    <div className="lg:col-span-1">
                        {(isCreating || editingId) && (
                            <Card className="sticky top-24 border-emerald-100 shadow-lg">
                                <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        {isCreating ? 'New Testimonial' : 'Edit Testimonial'}
                                        <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingId(null); }} className="h-8 w-8 p-0">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500">Client Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Sarah Smith"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500">Role / Location</label>
                                        <Input
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            placeholder="e.g. Villa Owner, Jumeirah"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500">Rating (1-5)</label>
                                        <div className="flex gap-2 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className={`focus:outline-none transition-transform hover:scale-110 ${formData.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                                                >
                                                    <Star className={`w-6 h-6 ${formData.rating >= star ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500">Message</label>
                                        <Textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Client feedback..."
                                            className="mt-1 h-32"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500">Image URL</label>
                                        <Input
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                            className="mt-1 text-xs font-mono"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                            <Save className="w-4 h-4 mr-2" /> Save Content
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminContent() {
    return (
        <AuthGuard requiredRole="admin">
            <AdminContentValues />
        </AuthGuard>
    );
}
