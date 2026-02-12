import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, User, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

export default function AdminChatWindow({ conversation, adminUser, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;
    loadMessages();
    markAsRead();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [conversation?.id]);

  const loadMessages = async () => {
    if (!conversation) return;
    const msgs = await base44.entities.ChatMessage.filter(
      { conversation_id: conversation.id }, 'created_date', 200
    );
    setMessages(msgs);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const markAsRead = async () => {
    if (conversation?.unread_admin > 0) {
      await base44.entities.ChatConversation.update(conversation.id, {
        unread_admin: 0,
        assigned_admin: adminUser.email,
      });
      onUpdate?.();
    }
  };

  const sendMessage = async (text) => {
    await base44.entities.ChatMessage.create({
      conversation_id: conversation.id,
      sender_type: 'admin',
      sender_id: adminUser.id,
      sender_name: adminUser.full_name || 'Support',
      message: text,
    });
    await base44.entities.ChatConversation.update(conversation.id, {
      last_message: text.slice(0, 100),
      last_message_at: new Date().toISOString(),
      last_sender: 'admin',
      unread_customer: (conversation.unread_customer || 0) + 1,
      unread_admin: 0,
      assigned_admin: adminUser.email,
    });
    await loadMessages();
    onUpdate?.();
  };

  const resolveChat = async () => {
    await base44.entities.ChatConversation.update(conversation.id, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    });
    toast.success('Chat marked as resolved');
    onUpdate?.();
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">Select a conversation to start</p>
        </div>
      </div>
    );
  }

  const isResolved = conversation.status === 'resolved' || conversation.status === 'closed';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">
              {conversation.customer_name || 'Customer'}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{conversation.customer_email}</span>
              {conversation.assigned_admin && (
                <>
                  <span>·</span>
                  <span>Assigned: {conversation.assigned_admin}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={
            conversation.status === 'active' ? "border-emerald-300 text-emerald-700" : "border-slate-300 text-slate-500"
          }>
            {conversation.status}
          </Badge>
          {!isResolved && (
            <Button size="sm" variant="outline" onClick={resolveChat} className="text-green-700 border-green-300 hover:bg-green-50">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
        {conversation.created_date && (
          <div className="text-center mb-4">
            <span className="text-[10px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full">
              Conversation started {format(new Date(conversation.created_date), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        )}
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_type === 'admin'} />
        ))}
        {isResolved && (
          <div className="text-center my-4">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Resolved {conversation.resolved_at ? format(new Date(conversation.resolved_at), 'MMM d, h:mm a') : ''}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isResolved && (
        <ChatInput onSend={sendMessage} disabled={loading} />
      )}
    </div>
  );
}