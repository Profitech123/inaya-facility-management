import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

export default function CustomerChatWidget() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Load or create conversation when chat opens
  useEffect(() => {
    if (!open || !user) return;
    loadConversation();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, user]);

  // Poll for new messages
  useEffect(() => {
    if (!open || !conversation) return;
    pollRef.current = setInterval(() => loadMessages(conversation.id), 3000);
    return () => clearInterval(pollRef.current);
  }, [open, conversation?.id]);

  // Poll unread count in background
  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      const convos = await base44.entities.ChatConversation.filter(
        { customer_id: user.id, status: 'active' }
      );
      const total = convos.reduce((s, c) => s + (c.unread_customer || 0), 0);
      setUnread(total);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadConversation = async () => {
    setLoading(true);
    // Find existing active conversation
    const existing = await base44.entities.ChatConversation.filter(
      { customer_id: user.id, status: 'active' },
      '-created_date', 1
    );
    if (existing.length > 0) {
      setConversation(existing[0]);
      await loadMessages(existing[0].id);
      // Mark as read
      if (existing[0].unread_customer > 0) {
        await base44.entities.ChatConversation.update(existing[0].id, { unread_customer: 0 });
      }
    }
    setLoading(false);
  };

  const loadMessages = async (convoId) => {
    const msgs = await base44.entities.ChatMessage.filter(
      { conversation_id: convoId }, 'created_date', 200
    );
    setMessages(msgs);
    // Mark customer unread as 0
    if (open) {
      const conv = await base44.entities.ChatConversation.filter({ customer_id: user?.id, status: 'active' }, '-created_date', 1);
      if (conv[0]?.unread_customer > 0) {
        await base44.entities.ChatConversation.update(conv[0].id, { unread_customer: 0 });
        setUnread(0);
      }
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const startNewChat = async () => {
    setLoading(true);
    const conv = await base44.entities.ChatConversation.create({
      customer_id: user.id,
      customer_name: user.full_name || user.email,
      customer_email: user.email,
      status: 'active',
      subject: 'New support chat',
      last_message: '',
      last_message_at: new Date().toISOString(),
      last_sender: 'customer',
      unread_admin: 0,
      unread_customer: 0,
    });
    setConversation(conv);
    setMessages([]);
    setLoading(false);
  };

  const sendMessage = async (text) => {
    if (!conversation) {
      // Create conversation first
      const conv = await base44.entities.ChatConversation.create({
        customer_id: user.id,
        customer_name: user.full_name || user.email,
        customer_email: user.email,
        status: 'active',
        subject: text.slice(0, 80),
        last_message: text.slice(0, 100),
        last_message_at: new Date().toISOString(),
        last_sender: 'customer',
        unread_admin: 1,
        unread_customer: 0,
      });
      setConversation(conv);
      await base44.entities.ChatMessage.create({
        conversation_id: conv.id,
        sender_type: 'customer',
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        message: text,
      });
      await loadMessages(conv.id);
      return;
    }

    await base44.entities.ChatMessage.create({
      conversation_id: conversation.id,
      sender_type: 'customer',
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      message: text,
    });
    await base44.entities.ChatConversation.update(conversation.id, {
      last_message: text.slice(0, 100),
      last_message_at: new Date().toISOString(),
      last_sender: 'customer',
      unread_admin: (conversation.unread_admin || 0) + 1,
    });
    await loadMessages(conversation.id);
  };

  if (!user) return null;

  const isResolved = conversation?.status === 'resolved' || conversation?.status === 'closed';

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="font-semibold text-base">INAYA Support</div>
                <div className="text-emerald-200 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full inline-block" />
                  We typically reply in minutes
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading...</div>
              ) : messages.length === 0 && !conversation ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Start a conversation</h3>
                  <p className="text-sm text-slate-500 mb-4">We're here to help. Send us a message and we'll respond as soon as we can.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_type === 'customer'} />
                  ))}
                  {isResolved && (
                    <div className="text-center my-4">
                      <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                        This conversation has been resolved
                      </span>
                      <button
                        onClick={startNewChat}
                        className="block mx-auto mt-2 text-emerald-600 text-xs font-medium hover:underline"
                      >
                        Start a new conversation
                      </button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {!isResolved && (
              <ChatInput onSend={sendMessage} disabled={loading} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}