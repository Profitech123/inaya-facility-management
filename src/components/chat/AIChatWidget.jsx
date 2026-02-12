import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AIChatMessages from './AIChatMessages';

const SYSTEM_CONTEXT = `You are INAYA's friendly AI assistant for their facilities management website in Dubai, UAE (part of Belhasa Group).

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

PAGES YOU CAN DIRECT USERS TO:
- Book a service: "On-Demand Services page" or "Book Service page"
- View packages: "Subscriptions/Packages page"
- Contact us: "Contact page"
- Get support: "Support page"  
- See FAQs: "FAQ page"
- Hard services info: "Hard Services page"
- Soft services info: "Soft Services page"
- Project management: "Project Management page"
- About the company: "About page"

BEHAVIOR:
- Be helpful, professional, and friendly
- Keep answers concise (2-4 sentences max)
- If someone wants to book, direct them to the On-Demand Services or Packages page
- If someone needs a quote, ask for: their name, email, phone, property type, and what service they need - then tell them you've noted their details and the team will contact them within 24 hours
- If you don't know something specific (like exact pricing for their property), suggest they contact the team or request a quote
- Always be encouraging and helpful
- Use AED for currency
- Do NOT make up specific prices unless they are common knowledge from the packages`;

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 I'm INAYA's virtual assistant. I can help you with information about our services, packages, bookings, and more. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context (last 10 messages)
      const historyForPrompt = updatedMessages.slice(-10).map(m =>
        `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}\n\nConversation so far:\n${historyForPrompt}\n\nRespond to the customer's latest message. Be concise and helpful.`,
        response_json_schema: {
          type: "object",
          properties: {
            reply: { type: "string", description: "Your response to the customer" },
            suggested_page: { type: "string", description: "If you recommend a page, put the page name here (e.g. OnDemandServices, Subscriptions, Contact, FAQ, HardServices, SoftServices, ProjectManagement, About). Leave empty if no page recommendation." },
            is_quote_request: { type: "boolean", description: "True if the user is requesting a quote and has provided enough info (name + email/phone + service need)" }
          }
        }
      });

      const assistantMsg = {
        role: 'assistant',
        content: response.reply,
        suggestedPage: response.suggested_page || null,
        isQuoteRequest: response.is_quote_request || false
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble right now. Please try again or call us at 6005-INAYA (6005-46292) for immediate help."
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

  const quickActions = [
    { label: "View Services", action: "What on-demand services do you offer?" },
    { label: "See Packages", action: "Tell me about your subscription packages" },
    { label: "Get a Quote", action: "I'd like to request a quote" },
    { label: "Contact Info", action: "How can I contact INAYA?" },
  ];

  const handleQuickAction = (text) => {
    setInput(text);
    setTimeout(() => {
      setInput('');
      const userMsg = { role: 'user', content: text };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      const updatedMessages = [...messages, userMsg];
      const historyForPrompt = updatedMessages.slice(-10).map(m =>
        `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`
      ).join('\n');

      base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}\n\nConversation so far:\n${historyForPrompt}\n\nRespond to the customer's latest message. Be concise and helpful.`,
        response_json_schema: {
          type: "object",
          properties: {
            reply: { type: "string" },
            suggested_page: { type: "string" },
            is_quote_request: { type: "boolean" }
          }
        }
      }).then(response => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.reply,
          suggestedPage: response.suggested_page || null,
          isQuoteRequest: response.is_quote_request || false
        }]);
        setIsTyping(false);
      }).catch(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble right now. Please call us at 6005-INAYA (6005-46292)."
        }]);
        setIsTyping(false);
      });
    }, 0);
  };

  const showQuickActions = messages.length <= 1;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">INAYA Assistant</div>
                  <div className="text-emerald-200 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block" />
                    Online — Ask me anything
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AIChatMessages messages={messages} />

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              {showQuickActions && !isTyping && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {quickActions.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(qa.action)}
                      className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">AI-powered · For urgent matters call 6005-INAYA</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}