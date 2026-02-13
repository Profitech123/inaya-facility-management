import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import WhatsAppButton from './components/WhatsAppButton';
import MobileStickyCTA from './components/MobileStickyCTA';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch((error) => {
        if (error?.status === 401) {
          setUser(null);
        } else {
          setUser(null);
        }
      });
  }, []);

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
              <Link to={createPageUrl('OnDemandServices')} className="hidden lg:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md">
                Book a Service
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
                    onClick={() => base44.auth.redirectToLogin(window.location.href)} 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-600"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(window.location.href)} 
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
              <Link to={createPageUrl('OnDemandServices')} className="block text-emerald-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>On-Demand Services</Link>
              <Link to={createPageUrl('Subscriptions')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Packages</Link>
              <Link to={createPageUrl('PackageBuilder')} className="block text-slate-700 hover:text-emerald-600 pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Custom Builder</Link>
              <Link to={createPageUrl('FAQ')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link to={createPageUrl('Contact')} className="block text-slate-700 hover:text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              {!user && (
                <div className="pt-3 border-t space-y-2">
                  <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Sign In / Create Account
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pb-16 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <WhatsAppButton />
      <MobileStickyCTA />
      <AIChatWidget />

      <footer className="bg-slate-950 text-white py-16 mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto px-6">
          {/* Newsletter Signup */}
          <div className="bg-slate-900 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Stay Updated</h3>
              <p className="text-slate-400 text-sm mt-1">Get maintenance tips and exclusive offers delivered to your inbox.</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); const input = e.target.querySelector('input'); if (input) input.value = ''; }}
              className="flex w-full md:w-auto gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

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
              {/* Social Media Links */}
              <div className="flex items-center gap-3 mt-4">
                <a href="https://linkedin.com/company/inaya-fm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://instagram.com/inayafm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://facebook.com/inayafm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://x.com/inayafm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors" aria-label="X (Twitter)">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('IntegratedFM')} className="block hover:text-white transition-colors">Integrated FM</Link>
                <Link to={createPageUrl('HardServices')} className="block hover:text-white transition-colors">Hard Services</Link>
                <Link to={createPageUrl('SoftServices')} className="block hover:text-white transition-colors">Soft Services</Link>
                <Link to={createPageUrl('ProjectManagement')} className="block hover:text-white transition-colors">Project Management</Link>
                <Link to={createPageUrl('OnDemandServices')} className="block hover:text-white transition-colors">On-Demand Services</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('About')} className="block hover:text-white transition-colors">About Us</Link>
                <Link to={createPageUrl('OurPeople')} className="block hover:text-white transition-colors">Our People</Link>
                <Link to={createPageUrl('BusinessExcellence')} className="block hover:text-white transition-colors">Business Excellence</Link>
                <Link to={createPageUrl('Subscriptions')} className="block hover:text-white transition-colors">Packages</Link>
                <Link to={createPageUrl('FAQ')} className="block hover:text-white transition-colors">FAQ</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>28th Street, Belhasa HO Building, Office M03</p>
                <p>Hor Al Anz East, PO Box 87074, Dubai, UAE</p>
                <p>T: +971 4 882 7001 · F: +971 4 882 7002</p>
                <p>Customer Service: +971 4 815 7300</p>
                <a href="mailto:info@inaya.ae" className="block hover:text-white transition-colors">info@inaya.ae</a>
                <a href="mailto:BD@inaya.ae" className="block hover:text-white transition-colors">BD@inaya.ae</a>
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
