import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function DashboardHeader({ user }) {
  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] tracking-tight">
          {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-sm text-[hsl(210,10%,55%)]">Here is your property maintenance overview.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-white rounded-xl px-4 py-2.5 gap-2 w-56 border border-[hsl(40,10%,90%)]">
          <Search className="w-4 h-4 text-[hsl(210,10%,65%)]" />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] w-full" />
        </div>
        <button className="relative p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-[hsl(40,10%,90%)] transition-all">
          <Bell className="w-[18px] h-[18px] text-[hsl(210,10%,45%)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(160,60%,38%)] rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-[hsl(210,20%,10%)]">{user?.full_name || 'User'}</div>
            <div className="text-[10px] text-[hsl(160,60%,38%)] font-semibold uppercase tracking-wider">Premium Member</div>
          </div>
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-[hsl(160,60%,38%)]/20" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
