import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Minus, Send, Loader2, Bot, Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AIChatMessages from './AIChatMessages';

const SYSTEM_CONTEXT = `You are INAYA's smart AI assistant for their facilities management platform in Dubai, UAE (part of Belhasa Group). You are modern, efficient, and professional.

KEY INFORMATION:
- Services: AC Maintenance, Plumbing, Electrical, MEP Maintenance, Fire Safety, Cleaning, Security, Pest Control, Landscaping, Pool Maintenance, Project Management (fit-out, refurbishment)
- Packages: Essential, Silver, Gold subscription plans for regular home maintenance (monthly billing, scheduled visits)
- On-demand services are also available for one-time bookings
- Service areas: Dubai and Abu Dhabi (Marina, JBR, Downtown, Palm Jumeirah, Arabian Ranches, JVC, etc.)
- Contact: Toll-free 6005-INAYA (6005-46292), Customer Service +971 4 815 7300, Email info@inaya.ae
- Office: 28th Street, Belhasa HO Building, Office M03, Hor Al Anz East, Dubai
- Hours: 24/7 Customer Service Centre, Office Sun-Thu 8AM-6PM
- Payment: Credit/debit cards, bank transfers, cash
- All technicians are certified and background-checked
- Emergency services available 24/7

PAGES YOU CAN DIRECT USERS TO (use these exact page names in suggested_page):
OnDemandServices, Subscriptions, PackageBuilder, ServiceFinder, Contact, Support, FAQ, HardServices, SoftServices, ProjectManagement, About, BookService

FORMATTING RULES:
- Use **bold** for important info, service names, prices
- Use bullet points for lists
- Keep answers concise (2-4 sentences for simple questions, use formatting for complex answers)
- Use emojis sparingly for warmth (1-2 max per message)

BEHAVIOR:
- Be helpful, professional, and warm
- If someone wants to book, direct them to On-Demand Services or the Service Finder
- If someone needs a quote, ask for details: property type, area, what service they need
- If you don't know something specific (like exact pricing), suggest they contact the team or request a quote
- Always personalize if you have user context
- Use AED for currency
- Do NOT make up specific prices
- For villa owners, emphasize pool maintenance, landscaping, and AC
- For apartment owners, emphasize cleaning, AC, and pest control

SMART RESPONSES:
- Booking status → "My Bookings" page
- Rescheduling → Contact +971 4 815 7300 or Support page (24h notice required)
- Cancellation → Free up to 24h before. After that, fee may apply
- Emergency → 24/7, call 6005-INAYA (6005-46292)
- Warranty → Satisfaction guarantee, free revisit within 7 days
- Complaints → Apologize, direct to Support page, escalation within 24h

FOLLOW-UP SUGGESTIONS:
Always provide 2-3 short follow-up suggestions the user might want to ask next. These should be contextual and relevant to the conversation.`;

const WELCOME_MSG = {
  role: 'assistant',
  content: "Hi there! 👋 I'm **INAYA's AI assistant**. I can help you find services, check packages, get quotes, or answer any questions about our facilities management solutions.\n\nWhat can I help you with today?",
  followUps: ["What services do you offer?", "I need AC maintenance", "Show me packages"]
};

const QUICK_ACTIONS = [
  { label: "🔧 Services", action: "What on-demand services do you offer?", color: "emerald" },
  { label: "📦 Packages", action: "Tell me about subscription packages", color: "blue" },
  { label: "💰 Get Quote", action: "I'd like to request a quote for my property", color: "amber" },
  { label: "🚨 Emergency", action: "I need emergency service right now", color: "red" },
  { label: "📅 My Bookings", action: "How do I check my booking status?", color: "purple" },
  { label: "❓ FAQ", action: "What are your most frequently asked questions?", color: "slate" },
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) return;
        
        const user = await base44.auth.me();
        if (!user) return;
        const [bookings, properties, subscriptions] = await Promise.all([
          base44.entities.Booking.list('-created_date', 10).then(all => all.filter(b => b.customer_id === user.id)),
          base44.entities.Property.list().then(all => all.filter(p => p.owner_id === user.id)),
          base44.entities.Subscription.list().then(all => all.filter(s => s.customer_id === user.id && s.status === 'active')),
        ]);
        const ctx = `\n\nLOGGED-IN USER CONTEXT:
- Name: ${user.full_name || 'Customer'}
- Properties: ${properties.length > 0 ? properties.map(p => `${p.property_type} in ${p.area || p.address} (${p.bedrooms || '?'} BR)`).join(', ') : 'None registered'}
- Active subscription: ${subscriptions.length > 0 ? 'Yes' : 'No'}
- Recent bookings: ${bookings.length > 0 ? bookings.slice(0, 5).map(b => `${b.status} on ${b.scheduled_date}`).join(', ') : 'None'}
- Total past bookings: ${bookings.length}`;
        setUserContext(ctx);
      } catch {
        // Not logged in
      }
    })();
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const callAI = useCallback(async (allMessages) => {
    const historyForPrompt = allMessages.slice(-12).map(m =>
      `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_CONTEXT}${userContext}\n\nConversation:\n${historyForPrompt}\n\nRespond to the customer's latest message. Use markdown formatting. Personalize if user context is available.`,
      response_json_schema: {
        type: "object",
        properties: {
          reply: { type: "string", description: "Your markdown-formatted response" },
          suggested_page: { type: "string", description: "Page name to suggest (OnDemandServices, Subscriptions, Contact, FAQ, HardServices, SoftServices, ProjectManagement, About, Support, ServiceFinder, PackageBuilder, BookService). Empty if none." },
          follow_up_suggestions: {
            type: "array",
            items: { type: "string" },
            description: "2-3 short follow-up questions the user might want to ask next, contextual to this conversation"
          },
          detected_intent: { type: "string", description: "The user's intent: info, booking, quote, complaint, emergency, general" }
        }
      }
    });

    return {
      role: 'assistant',
      content: response.reply,
      suggestedPage: response.suggested_page || null,
      followUps: response.follow_up_suggestions || [],
      intent: response.detected_intent || 'general'
    };
  }, [userContext]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || isTyping) return;

    setHasInteracted(true);
    const userMsg = { role: 'user', content: msgText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);

    try {
      const assistantMsg = await callAI(updated);
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a brief hiccup 😅. Please try again, or call us directly at **6005-INAYA** (6005-46292) for immediate help.",
        followUps: ["Try again", "Contact support"]
      }]);
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFollowUp = (text) => {
    sendMessage(text);
  };

  const resetChat = () => {
    setMessages([WELCOME_MSG]);
    setHasInteracted(false);
  };

  const showQuickActions = !hasInteracted;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-br from-emerald-500 to-emerald-700 text-white w-14 h-14 rounded-full shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-110 hover:shadow-2xl hover:shadow-emerald-600/40"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-amber-900" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden"
            style={{ height: '560px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    INAYA Assistant
                    <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-normal">AI</span>
                  </div>
                  <div className="text-emerald-200 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block animate-pulse" />
                    Online — Ready to help
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasInteracted && (
                  <button onClick={resetChat} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors" title="New chat">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              <AIChatMessages messages={messages} onFollowUp={handleFollowUp} />

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick action grid */}
              {showQuickActions && !isTyping && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {QUICK_ACTIONS.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(qa.action)}
                      className="text-left text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all shadow-sm hover:shadow"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-slate-200 bg-white p-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 bg-slate-50 placeholder:text-slate-400 transition-all"
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-200 disabled:to-slate-300 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-sm hover:shadow disabled:shadow-none"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Sparkles className="w-3 h-3 text-slate-300" />
                <p className="text-[10px] text-slate-400">Powered by AI · For urgent matters call 6005-INAYA</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}