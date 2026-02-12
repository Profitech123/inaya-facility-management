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
import CustomerChatWidget from './components/chat/CustomerChatWidget';
import AdminLayout from './components/admin/AdminLayout';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch((error) => {
        // Expected error when not authenticated
        if (error?.status === 401) {
          setUser(null);
        } else {
          console.error('Unexpected auth error:', error);
          setUser(null);
        }
      });
  }, []);

  // Admin pages get their own separate layout — completely hidden from public site
  const isAdminPage = currentPageName?.startsWith('Admin') || currentPageName === 'ProviderPortal' || currentPageName === 'ProviderJobs' || currentPageName === 'ProviderJobDetails';
  
  // If customer tries to access admin page, redirect
  if (isAdminPage && user && user.role !== 'admin') {
    window.location.href = createPageUrl('Dashboard');
    return null;
  }
  
  if (isAdminPage) {
    return <AdminLayout currentPage={currentPageName}>{children}</AdminLayout>;
  }
  
  const isCustomer = user && user.role !== 'admin';

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
                alt="INAYA Facilities Management" 
                className="h-10"
              />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to={createPageUrl('Home')} className="text-slate-700 hover:text-emerald-600 transition-colors text-sm font-medium">
                Home
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-700 hover:text-emerald-600 transition-colors text-sm font-medium cursor-pointer">
                  About
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild><Link to={createPageUrl('About')} className="w-full">Company Overview</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('OurPeople')} className="w-full">Our People</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('BusinessExcellence')} className="w-full">Business Excellence</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-700 hover:text-emerald-600 transition-colors text-sm font-medium cursor-pointer">
                  Services
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild><Link to={createPageUrl('IntegratedFM')} className="w-full">Integrated FM</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('HardServices')} className="w-full">Hard Services</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('SoftServices')} className="w-full">Soft Services</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('ProjectManagement')} className="w-full">Project Management</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('Services')} className="w-full">Book a Service</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={createPageUrl('Subscriptions')} className="text-slate-700 hover:text-emerald-600 transition-colors text-sm font-medium">
                Packages
              </Link>
              <Link to={createPageUrl('Contact')} className="text-slate-700 hover:text-emerald-600 transition-colors text-sm font-medium">
                Contact
              </Link>
              {user && (
                <Link to={createPageUrl('Support')} className="text-slate-700 hover:text-emerald-600 transition-colors text-sm font-medium">
                  Support
                </Link>
              )}
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
                      <Link to={createPageUrl('UserProfile')} className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Dashboard')} className="w-full">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyBookings')} className="w-full">
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('PaymentHistory')} className="w-full">
                        Payment History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Support')} className="w-full">
                        Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(window.location.href)} 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-700"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(window.location.href)} 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create Account
                  </Button>
                </div>
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
              <Link to={createPageUrl('About')} className="block text-slate-700 hover:text-emerald-600">About Us</Link>
              <Link to={createPageUrl('OurPeople')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm">Our People</Link>
              <Link to={createPageUrl('BusinessExcellence')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm">Business Excellence</Link>
              <Link to={createPageUrl('IntegratedFM')} className="block text-slate-700 hover:text-emerald-600">Integrated FM</Link>
              <Link to={createPageUrl('HardServices')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm">Hard Services</Link>
              <Link to={createPageUrl('SoftServices')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm">Soft Services</Link>
              <Link to={createPageUrl('ProjectManagement')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm">Project Management</Link>
              <Link to={createPageUrl('Services')} className="block text-slate-700 hover:text-emerald-600">Book a Service</Link>
              <Link to={createPageUrl('Subscriptions')} className="block text-slate-700 hover:text-emerald-600">Packages</Link>
              <Link to={createPageUrl('Contact')} className="block text-slate-700 hover:text-emerald-600">Contact</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {user && user.role !== 'admin' && <CustomerChatWidget />}

      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
                alt="INAYA Facilities Management" 
                className="h-12 mb-4"
              />
              <p className="text-slate-400 text-sm">
                INAYA Facilities Management Services L.L.C · INAYA Technical Services L.L.C · INAYA Security Services L.L.C · INAYA Property L.L.C
              </p>
              <p className="text-slate-500 text-xs mt-2">A Member of Belhasa Group</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('IntegratedFM')} className="block hover:text-white">Integrated FM</Link>
                <Link to={createPageUrl('HardServices')} className="block hover:text-white">Hard Services</Link>
                <Link to={createPageUrl('SoftServices')} className="block hover:text-white">Soft Services</Link>
                <Link to={createPageUrl('ProjectManagement')} className="block hover:text-white">Project Management</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('About')} className="block hover:text-white">About Us</Link>
                <Link to={createPageUrl('OurPeople')} className="block hover:text-white">Our People</Link>
                <Link to={createPageUrl('BusinessExcellence')} className="block hover:text-white">Business Excellence</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-white">Contact</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>28th Street, Belhasa HO Building, Office M03</p>
                <p>Hor Al Anz East, PO Box 87074, Dubai, UAE</p>
                <p>T: +971 4 882 7001 · F: +971 4 882 7002</p>
                <p>Customer Service: +971 4 815 7300</p>
                <p>info@inaya.ae · BD@inaya.ae</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800/60 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 INAYA Facilities Management Services L.L.C. Part of Belhasa Group.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}