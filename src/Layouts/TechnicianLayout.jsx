import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function TechnicianLayout({ children }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        base44.auth.logout('/Login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Bar relative */}
            <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                            IN
                        </div>
                        <span className="font-semibold text-slate-800">Technician Portal</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* Bottom Navigation (Mobile First) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between z-20 md:hidden">
                <Link to="/TechnicianDashboard" className={`flex flex-col items-center gap-1 ${isActive('/TechnicianDashboard') ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium">My Jobs</span>
                </Link>
                <Link to="/TechnicianSchedule" className={`flex flex-col items-center gap-1 ${isActive('/TechnicianSchedule') ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Schedule</span>
                </Link>
                <Link to="/TechnicianProfile" className={`flex flex-col items-center gap-1 ${isActive('/TechnicianProfile') ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </nav>

            {/* Desktop Sidebar (Simple) */}
            <div className="hidden md:block fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-slate-200 p-4">
                <div className="space-y-1">
                    <Link to="/TechnicianDashboard">
                        <Button variant={isActive('/TechnicianDashboard') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                            <Home className="w-4 h-4" /> My Jobs
                        </Button>
                    </Link>
                    <Link to="/TechnicianSchedule">
                        <Button variant={isActive('/TechnicianSchedule') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                            <Calendar className="w-4 h-4" /> Schedule
                        </Button>
                    </Link>
                    <Link to="/TechnicianProfile">
                        <Button variant={isActive('/TechnicianProfile') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                            <User className="w-4 h-4" /> Profile
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
