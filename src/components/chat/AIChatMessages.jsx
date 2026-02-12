import React from 'react';
import { Bot, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PAGE_MAP = {
  OnDemandServices: { label: 'Browse Services', page: 'OnDemandServices' },
  Services: { label: 'Browse Services', page: 'OnDemandServices' },
  Subscriptions: { label: 'View Packages', page: 'Subscriptions' },
  Packages: { label: 'View Packages', page: 'Subscriptions' },
  Contact: { label: 'Contact Us', page: 'Contact' },
  FAQ: { label: 'View FAQ', page: 'FAQ' },
  HardServices: { label: 'Hard Services', page: 'HardServices' },
  SoftServices: { label: 'Soft Services', page: 'SoftServices' },
  ProjectManagement: { label: 'Project Management', page: 'ProjectManagement' },
  About: { label: 'About INAYA', page: 'About' },
  Support: { label: 'Support', page: 'Support' },
  BookService: { label: 'Book a Service', page: 'OnDemandServices' },
};

export default function AIChatMessages({ messages }) {
  return (
    <>
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const pageInfo = msg.suggestedPage ? PAGE_MAP[msg.suggestedPage] : null;

        return (
          <div key={idx} className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            {!isUser && (
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            <div className={`max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? 'bg-emerald-600 text-white rounded-tr-sm'
                  : 'bg-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              {pageInfo && (
                <Link
                  to={createPageUrl(pageInfo.page)}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  {pageInfo.label} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}