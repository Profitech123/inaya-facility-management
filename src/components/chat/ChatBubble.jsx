import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ChatBubble({ message, isOwn }) {
  return (
    <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5",
        isOwn
          ? "bg-emerald-600 text-white rounded-br-md"
          : "bg-slate-100 text-slate-800 rounded-bl-md"
      )}>
        {!isOwn && (
          <div className="text-xs font-semibold text-emerald-700 mb-0.5">
            {message.sender_name || 'Support'}
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
        <div className={cn(
          "text-[10px] mt-1",
          isOwn ? "text-emerald-200" : "text-slate-400"
        )}>
          {message.created_date ? format(new Date(message.created_date), 'h:mm a') : ''}
        </div>
      </div>
    </div>
  );
}