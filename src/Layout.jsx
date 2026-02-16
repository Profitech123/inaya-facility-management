import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import AIChatWidget from './components/chat/AIChatWidget';
import AdminLayout from './components/admin/AdminLayout';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) {
        setUser(null);
        return;
      }
      base44.auth.me()
        .then(setUser)
        .catch(() => setUser(null));
    });
  }, []);

  // Provider dashboard gets its own layout (no nav/footer)
  if (currentPageName === 'ProviderDashboard') {
    return <>{children}</>;
  }

  // Admin pages get their own separate layout
  const isAdminPage = currentPageName?.startsWith('Admin');
  
  if (isAdminPage && user && user.role !== 'admin') {
    window.location.href = createPageUrl('Dashboard');
    return null;
  }
  
  if (isAdminPage) {
    return <AdminLayout currentPage={currentPageName}>{children}</AdminLayout>;
  }

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isActivePage = (pageName) => currentPageName === pageName;
  const navLinkClass = (pageName) => 
    `transition-colors text-sm font-medium ${isActivePage(pageName) ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
                alt="INAYA Facilities Management" 
                className="h-10"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
              <Link to={createPageUrl('Home')} className={navLinkClass('Home')}>Home</Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={`transition-colors text-sm font-medium cursor-pointer ${['About','OurPeople','BusinessExcellence'].includes(currentPageName) ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>
                  About
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild><Link to={createPageUrl('About')} className="w-full">Company Overview</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('OurPeople')} className="w-full">Our People</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('BusinessExcellence')} className="w-full">Business Excellence</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger className={`transition-colors text-sm font-medium cursor-pointer ${['IntegratedFM','HardServices','SoftServices','ProjectManagement'].includes(currentPageName) ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>
                  Services
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild><Link to={createPageUrl('IntegratedFM')} className="w-full">Integrated FM</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('HardServices')} className="w-full">Hard Services</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('SoftServices')} className="w-full">Soft Services</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('ProjectManagement')} className="w-full">Project Management</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={createPageUrl('ServiceFinder')} className={navLinkClass('ServiceFinder')}>Service Finder</Link>
              <Link to={createPageUrl('OnDemandServices')} className={navLinkClass('OnDemandServices')}>On-Demand</Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={`transition-colors text-sm font-medium cursor-pointer ${['Subscriptions','PackageBuilder'].includes(currentPageName) ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>
                  Packages
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild><Link to={createPageUrl('Subscriptions')} className="w-full">Pre-built Plans</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('PackageBuilder')} className="w-full">Custom Package Builder</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={createPageUrl('FAQ')} className={navLinkClass('FAQ')}>FAQ</Link>
              <Link to={createPageUrl('Contact')} className={navLinkClass('Contact')}>Contact</Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('ServiceFinder')} className="hidden lg:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md">
                Find a Service
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-slate-200">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline text-slate-700">{user.full_name?.split(' ')[0] || 'Account'}</span>
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
                      <Link to={createPageUrl('MyBookings')} className="w-full">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('PaymentHistory')} className="w-full">Payment History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Support')} className="w-full">Support</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-600"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Create Account
                  </Button>
                </div>
              )}
              
              <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-6 py-4 space-y-3">
              <Link to={createPageUrl('Home')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to={createPageUrl('About')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to={createPageUrl('OurPeople')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Our People</Link>
              <Link to={createPageUrl('BusinessExcellence')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Business Excellence</Link>
              <Link to={createPageUrl('IntegratedFM')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Integrated FM</Link>
              <Link to={createPageUrl('HardServices')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Hard Services</Link>
              <Link to={createPageUrl('SoftServices')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Soft Services</Link>
              <Link to={createPageUrl('ProjectManagement')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Project Management</Link>
              <Link to={createPageUrl('ServiceFinder')} className="block" onClick={() => setMobileMenuOpen(false)}>
                <span className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold w-full justify-center shadow-sm">
                  Find a Service
                </span>
              </Link>
              <Link to={createPageUrl('Subscriptions')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Packages</Link>
              <Link to={createPageUrl('PackageBuilder')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Custom Builder</Link>
              <Link to={createPageUrl('FAQ')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link to={createPageUrl('Contact')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              {!user && (
                <div className="pt-3 border-t space-y-2">
                  <Button onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Sign In / Create Account
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <AIChatWidget />

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
                <Link to={createPageUrl('OnDemandServices')} className="block hover:text-white">On-Demand Services</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('About')} className="block hover:text-white">About Us</Link>
                <Link to={createPageUrl('OurPeople')} className="block hover:text-white">Our People</Link>
                <Link to={createPageUrl('BusinessExcellence')} className="block hover:text-white">Business Excellence</Link>
                <Link to={createPageUrl('Subscriptions')} className="block hover:text-white">Packages</Link>
                <Link to={createPageUrl('FAQ')} className="block hover:text-white">FAQ</Link>
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
          
          <div className="border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; 2026 INAYA Facilities Management Services L.L.C. Part of Belhasa Group.</p>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('TermsOfService')} className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}