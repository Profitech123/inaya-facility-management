import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Phone, Calendar, Archive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import { format } from 'date-fns';

function AdminInquiriesContent() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    // Fetch Inquiries
    const { data: inquiries = [], isLoading } = useQuery({
        queryKey: ['contactSubmissions'],
        queryFn: () => base44.entities.ContactSubmission.list('-created_at'),
        staleTime: 30000,
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => base44.entities.ContactSubmission.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['contactSubmissions']);
            toast.success('Inquiry updated');
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ContactSubmission.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['contactSubmissions']);
            toast.success('Inquiry deleted');
        },
    });

    const handleStatusChange = (id, newStatus) => {
        updateMutation.mutate({ id, updates: { status: newStatus } });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleReply = (inquiry) => {
        const subject = `Re: Contact Form Submission - ${inquiry.name}`;
        const body = `Hi ${inquiry.name},\n\nThank you for reaching out.\n\nBest regards,\nINAYA Team`;
        window.location.href = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        handleStatusChange(inquiry.id, 'replied');
    };

    // Filtering
    const filteredInquiries = inquiries.filter(item => {
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusColors = {
        new: 'bg-blue-100 text-blue-700 border-blue-200',
        read: 'bg-slate-100 text-slate-700 border-slate-200',
        replied: 'bg-green-100 text-green-700 border-green-200',
        archived: 'bg-amber-100 text-amber-700 border-amber-200',
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Inquiries</h1>
                        <p className="text-slate-500">Manage contact form submissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading inquiries...</div>
                    ) : filteredInquiries.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">No inquiries found</div>
                    ) : (
                        filteredInquiries.map((inquiry) => (
                            <Card key={inquiry.id} className={`hover:shadow-md transition-shadow ${inquiry.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}>
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Header Info */}
                                        <div className="md:w-64 flex-shrink-0 space-y-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{inquiry.name}</h3>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {inquiry.created_at ? format(new Date(inquiry.created_at), 'MMM d, yyyy h:mm a') : 'Just now'}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600">
                                                    <Mail className="w-3.5 h-3.5" /> {inquiry.email}
                                                </a>
                                                {inquiry.phone && (
                                                    <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600">
                                                        <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
                                                    </a>
                                                )}
                                            </div>

                                            <Badge variant="outline" className={`${statusColors[inquiry.status] || 'bg-slate-100'} capitalize`}>
                                                {inquiry.status}
                                            </Badge>
                                        </div>

                                        {/* Message Body */}
                                        <div className="flex-1 min-w-0 border-l border-slate-100 md:pl-6">
                                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap mb-4">
                                                {inquiry.message}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Button size="sm" onClick={() => handleReply(inquiry)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                                    <Mail className="w-4 h-4" /> Reply via Email
                                                </Button>

                                                {inquiry.status === 'new' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(inquiry.id, 'read')} className="gap-2">
                                                        Mark as Read
                                                    </Button>
                                                )}

                                                {inquiry.status !== 'archived' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(inquiry.id, 'archived')} className="gap-2 text-slate-500 hover:text-amber-600">
                                                        <Archive className="w-4 h-4" /> Archive
                                                    </Button>
                                                )}

                                                <div className="flex-1"></div>

                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(inquiry.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminInquiries() {
    return (
        <AuthGuard requiredRole="admin">
            <AdminInquiriesContent />
        </AuthGuard>
    );
}
