import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';

export default function AdminChatList({ conversations, selectedId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <MessageCircle className="w-8 h-8 mb-2" />
        <p className="text-sm">No conversations</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={cn(
            "w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors",
            selectedId === conv.id && "bg-emerald-50 border-r-2 border-emerald-600"
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-slate-900 truncate">
                  {conv.customer_name || conv.customer_email}
                </div>
                <div className="text-xs text-slate-400 truncate">{conv.customer_email}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {conv.last_message_at && (
                <span className="text-[10px] text-slate-400">
                  {format(new Date(conv.last_message_at), 'MMM d, h:mm a')}
                </span>
              )}
              {(conv.unread_admin || 0) > 0 && (
                <Badge className="bg-emerald-600 text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                  {conv.unread_admin}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 truncate pl-10">
            {conv.last_sender === 'admin' && <span className="text-slate-400">You: </span>}
            {conv.last_message || conv.subject || 'No messages yet'}
          </p>
          <div className="pl-10 mt-1">
            <Badge variant="outline" className={cn(
              "text-[10px]",
              conv.status === 'active' ? "border-emerald-300 text-emerald-700" :
              conv.status === 'resolved' ? "border-slate-300 text-slate-500" : "border-slate-300 text-slate-400"
            )}>
              {conv.status}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}