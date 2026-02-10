import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const publicPages = ['Home', 'About', 'Services', 'Subscriptions', 'Contact'];
  const customerPages = ['Dashboard', 'MyBookings', 'MySubscriptions', 'MyProperties'];
  const adminPages = ['AdminDashboard', 'AdminServices', 'AdminBookings', 'AdminSubscriptions'];

  const isPublicPage = publicPages.includes(currentPageName);
  const isCustomerPage = customerPages.includes(currentPageName);
  const isAdminPage = adminPages.includes(currentPageName);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">INAYA</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('Home')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Home
              </Link>
              <Link to={createPageUrl('About')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                About
              </Link>
              <Link to={createPageUrl('Services')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Services
              </Link>
              <Link to={createPageUrl('Subscriptions')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Packages
              </Link>
              <Link to={createPageUrl('Contact')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {user.full_name || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl(user.role === 'admin' ? 'AdminDashboard' : 'Dashboard')} className="w-full">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => base44.auth.redirectToLogin()} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Login
                </Button>
              )}
              
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-6 py-4 space-y-3">
              <Link to={createPageUrl('Home')} className="block text-slate-700 hover:text-emerald-600">Home</Link>
              <Link to={createPageUrl('About')} className="block text-slate-700 hover:text-emerald-600">About</Link>
              <Link to={createPageUrl('Services')} className="block text-slate-700 hover:text-emerald-600">Services</Link>
              <Link to={createPageUrl('Subscriptions')} className="block text-slate-700 hover:text-emerald-600">Packages</Link>
              <Link to={createPageUrl('Contact')} className="block text-slate-700 hover:text-emerald-600">Contact</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold">INAYA</span>
              </div>
              <p className="text-slate-400 text-sm">
                Professional facilities management for your home. Part of Belhasa Group.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('Services')} className="block hover:text-white">Soft Services</Link>
                <Link to={createPageUrl('Services')} className="block hover:text-white">Hard Services</Link>
                <Link to={createPageUrl('Services')} className="block hover:text-white">Specialized Services</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('About')} className="block hover:text-white">About Us</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-white">Contact</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>Belhasa HO Building, Office M03</p>
                <p>Hor Al Anz East, Dubai</p>
                <p>Phone: +971 4 882 7001</p>
                <p>Email: info@inaya.ae</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 INAYA Facilities Management Services L.L.C. Part of Belhasa Group.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}