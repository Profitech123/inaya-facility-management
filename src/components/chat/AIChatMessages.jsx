import React from 'react';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

const PAGE_MAP = {
  OnDemandServices: { label: 'Browse Services', page: 'OnDemandServices', icon: '🔧' },
  Services: { label: 'Browse Services', page: 'OnDemandServices', icon: '🔧' },
  Subscriptions: { label: 'View Packages', page: 'Subscriptions', icon: '📦' },
  Packages: { label: 'View Packages', page: 'Subscriptions', icon: '📦' },
  Contact: { label: 'Contact Us', page: 'Contact', icon: '📞' },
  FAQ: { label: 'View FAQ', page: 'FAQ', icon: '❓' },
  HardServices: { label: 'Hard Services', page: 'HardServices', icon: '⚡' },
  SoftServices: { label: 'Soft Services', page: 'SoftServices', icon: '✨' },
  ProjectManagement: { label: 'Project Management', page: 'ProjectManagement', icon: '📋' },
  About: { label: 'About INAYA', page: 'About', icon: '🏢' },
  Support: { label: 'Support', page: 'Support', icon: '🛟' },
  BookService: { label: 'Book a Service', page: 'OnDemandServices', icon: '📅' },
  ServiceFinder: { label: 'Find a Service', page: 'ServiceFinder', icon: '🔍' },
  PackageBuilder: { label: 'Build Package', page: 'PackageBuilder', icon: '🛠️' },
};

function AssistantBubble({ msg }) {
  const pageInfo = msg.suggestedPage ? PAGE_MAP[msg.suggestedPage] : null;
  const followUps = msg.followUpSuggestions || [];

  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="bg-white border border-slate-200/80 text-slate-700 rounded-2xl rounded-tl-md px-4 py-3 text-[13px] leading-relaxed shadow-sm">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-1.5 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-1.5 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="text-[13px]">{children}</li>,
              a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">{children}</a>,
              code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {pageInfo && (
          <Link
            to={createPageUrl(pageInfo.page)}
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-3 py-2 rounded-xl transition-all hover:shadow-sm"
          >
            <span>{pageInfo.icon}</span>
            {pageInfo.label}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}

        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {followUps.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => suggestion.onClick?.(suggestion.text)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ msg }) {
  return (
    <div className="flex items-start gap-2 flex-row-reverse">
      <div className="max-w-[80%]">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-[13px] leading-relaxed shadow-sm">
          {msg.content}
        </div>
      </div>
    </div>
  );
}

export default function AIChatMessages({ messages, onFollowUp }) {
  return (
    <>
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const enrichedMsg = {
          ...msg,
          followUpSuggestions: msg.followUps?.map(text => ({
            text,
            onClick: () => onFollowUp?.(text)
          })) || []
        };

        return isUser
          ? <UserBubble key={idx} msg={msg} />
          : <AssistantBubble key={idx} msg={enrichedMsg} />;
      })}
    </>
  );
}