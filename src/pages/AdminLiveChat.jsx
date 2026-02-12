import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPageUrl } from '@/utils';
import AdminChatList from '../components/chat/AdminChatList';
import AdminChatWindow from '../components/chat/AdminChatWindow';
import AuthGuard from '../components/AuthGuard';

function AdminLiveChatContent() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('active');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ['adminChats'],
    queryFn: () => base44.entities.ChatConversation.list('-last_message_at', 200),
    enabled: !!user,
    refetchInterval: 5000,
    initialData: [],
  });

  const activeConvos = conversations.filter(c => c.status === 'active');
  const resolvedConvos = conversations.filter(c => c.status === 'resolved' || c.status === 'closed');
  const totalUnread = activeConvos.reduce((s, c) => s + (c.unread_admin || 0), 0);

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminChats'] });
    // Refresh selected conversation
    if (selected) {
      const updated = conversations.find(c => c.id === selected.id);
      if (updated) setSelected(updated);
    }
  };

  // Keep selected conversation in sync
  useEffect(() => {
    if (selected) {
      const updated = conversations.find(c => c.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [conversations]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-1">Live Chat Support</h1>
          <p className="text-slate-300 text-sm">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up'}
            {' · '}{activeConvos.length} active conversation{activeConvos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card className="overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-[340px] border-r flex flex-col flex-shrink-0">
              <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
                <div className="p-3 border-b">
                  <TabsList className="w-full">
                    <TabsTrigger value="active" className="flex-1">
                      Active {activeConvos.length > 0 && `(${activeConvos.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="flex-1">
                      Resolved {resolvedConvos.length > 0 && `(${resolvedConvos.length})`}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="active" className="m-0">
                    <AdminChatList
                      conversations={activeConvos}
                      selectedId={selected?.id}
                      onSelect={setSelected}
                    />
                  </TabsContent>
                  <TabsContent value="resolved" className="m-0">
                    <AdminChatList
                      conversations={resolvedConvos}
                      selectedId={selected?.id}
                      onSelect={setSelected}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Chat Window */}
            <div className="flex-1">
              <AdminChatWindow
                conversation={selected}
                adminUser={user}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLiveChat() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminLiveChatContent />
    </AuthGuard>
  );
}