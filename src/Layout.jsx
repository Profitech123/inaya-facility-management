import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from './utils';
import clientAuth from '@/lib/clientAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard, ArrowRight, Phone, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminLayout from './components/admin/AdminLayout';
import WhatsAppButton from './components/WhatsAppButton';
import MobileStickyCTA from './components/MobileStickyCTA';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    clientAuth.me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminPage = currentPageName?.startsWith('Admin');
  
  if (isAdminPage) {
    return <AdminLayout currentPage={currentPageName}>{children}</AdminLayout>;
  }

  const handleLogout = () => {
    clientAuth.logout();
    setUser(null);
    window.location.href = '/';
  };

  const isActivePage = (pageName) => currentPageName === pageName;
  const navLinkClass = (pageName) => 
    `transition-all duration-300 text-[13px] font-medium tracking-wide uppercase ${isActivePage(pageName) ? 'text-[hsl(160,60%,38%)]' : 'text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)]'}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Top Bar */}
      <div className="hidden lg:block bg-[hsl(210,20%,6%)] text-[hsl(40,20%,95%)]">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-10 text-xs tracking-wide">
          <div className="flex items-center gap-6">
            <span className="opacity-70">Dubai, UAE</span>
            <span className="opacity-40">|</span>
            <a href="tel:+97148827001" className="opacity-70 hover:opacity-100 transition-opacity">+971 4 882 7001</a>
            <span className="opacity-40">|</span>
            <a href="mailto:info@inayafm.com" className="opacity-70 hover:opacity-100 transition-opacity">info@inayafm.com</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:800-46292" className="flex items-center gap-1.5 font-semibold text-[hsl(160,60%,45%)]">
              <Phone className="w-3 h-3" />
              800-INAYA
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-[hsl(40,10%,90%)]' 
          : 'bg-white border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              <Link to={createPageUrl('Home')} className={navLinkClass('Home')}>Home</Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={`transition-all duration-300 text-[13px] font-medium tracking-wide uppercase cursor-pointer flex items-center gap-1 ${['About','OurPeople','BusinessExcellence'].includes(currentPageName) ? 'text-[hsl(160,60%,38%)]' : 'text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)]'}`}>
                  About <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-[hsl(40,10%,90%)] shadow-xl rounded-xl p-1">
                  <DropdownMenuItem asChild><Link to={createPageUrl('About')} className="w-full rounded-lg">Company Overview</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('OurPeople')} className="w-full rounded-lg">Our People</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('BusinessExcellence')} className="w-full rounded-lg">Business Excellence</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger className={`transition-all duration-300 text-[13px] font-medium tracking-wide uppercase cursor-pointer flex items-center gap-1 ${['IntegratedFM','HardServices','SoftServices','ProjectManagement'].includes(currentPageName) ? 'text-[hsl(160,60%,38%)]' : 'text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)]'}`}>
                  Services <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-[hsl(40,10%,90%)] shadow-xl rounded-xl p-1">
                  <DropdownMenuItem asChild><Link to={createPageUrl('IntegratedFM')} className="w-full rounded-lg">Integrated FM</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('HardServices')} className="w-full rounded-lg">Hard Services</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('SoftServices')} className="w-full rounded-lg">Soft Services</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('ProjectManagement')} className="w-full rounded-lg">Project Management</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={createPageUrl('OnDemandServices')} className={navLinkClass('OnDemandServices')}>On-Demand</Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={`transition-all duration-300 text-[13px] font-medium tracking-wide uppercase cursor-pointer flex items-center gap-1 ${['Subscriptions','PackageBuilder'].includes(currentPageName) ? 'text-[hsl(160,60%,38%)]' : 'text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)]'}`}>
                  Packages <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-[hsl(40,10%,90%)] shadow-xl rounded-xl p-1">
                  <DropdownMenuItem asChild><Link to={createPageUrl('Subscriptions')} className="w-full rounded-lg">Pre-built Plans</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to={createPageUrl('PackageBuilder')} className="w-full rounded-lg">Custom Package Builder</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={createPageUrl('FAQ')} className={navLinkClass('FAQ')}>FAQ</Link>
              <Link to={createPageUrl('Contact')} className={navLinkClass('Contact')}>Contact</Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('OnDemandServices')} className="hidden lg:inline-flex items-center gap-2 bg-[hsl(210,20%,6%)] hover:bg-[hsl(210,20%,12%)] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 hover:shadow-lg">
                Book a Service
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-[hsl(40,10%,90%)] rounded-full">
                      <div className="w-6 h-6 rounded-full bg-[hsl(160,60%,38%)] text-white flex items-center justify-center text-xs font-bold">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden sm:inline text-[hsl(210,20%,10%)] text-sm">{user.full_name?.split(' ')[0] || 'Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-[hsl(40,10%,90%)] shadow-xl rounded-xl p-1">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('UserProfile')} className="w-full rounded-lg">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Dashboard')} className="w-full rounded-lg">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyBookings')} className="w-full rounded-lg">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('PaymentHistory')} className="w-full rounded-lg">Payment History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Support')} className="w-full rounded-lg">Support</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to={`${createPageUrl('Login')}?returnUrl=${encodeURIComponent(window.location.pathname)}`}>
                    <Button variant="ghost" size="sm" className="text-[hsl(210,20%,10%)] text-[13px] font-medium tracking-wide rounded-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
              
              <button className="lg:hidden p-2.5 hover:bg-[hsl(40,15%,94%)] rounded-full transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[hsl(40,10%,90%)] bg-white overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                <Link to={createPageUrl('Home')} className="block text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)] font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to={createPageUrl('About')} className="block text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)] font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                <Link to={createPageUrl('IntegratedFM')} className="block text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)] font-medium" onClick={() => setMobileMenuOpen(false)}>Integrated FM</Link>
                <Link to={createPageUrl('HardServices')} className="block text-[hsl(210,10%,46%)] hover:text-[hsl(160,60%,38%)] pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Hard Services</Link>
                <Link to={createPageUrl('SoftServices')} className="block text-[hsl(210,10%,46%)] hover:text-[hsl(160,60%,38%)] pl-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Soft Services</Link>
                <Link to={createPageUrl('OnDemandServices')} className="block text-[hsl(160,60%,38%)] font-semibold" onClick={() => setMobileMenuOpen(false)}>On-Demand Services</Link>
                <Link to={createPageUrl('Subscriptions')} className="block text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)] font-medium" onClick={() => setMobileMenuOpen(false)}>Packages</Link>
                <Link to={createPageUrl('FAQ')} className="block text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)] font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <Link to={createPageUrl('Contact')} className="block text-[hsl(210,20%,10%)] hover:text-[hsl(160,60%,38%)] font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                {!user && (
                  <div className="pt-4 border-t border-[hsl(40,10%,90%)]">
                    <Link to={`${createPageUrl('Login')}?returnUrl=${encodeURIComponent(window.location.pathname)}`} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[hsl(210,20%,6%)] hover:bg-[hsl(210,20%,12%)] text-white rounded-full">
                        Sign In / Create Account
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 pb-16 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <WhatsAppButton />
      <MobileStickyCTA />

      {/* Premium Footer */}
      <footer className="bg-[hsl(210,20%,6%)] text-white py-20 mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Newsletter */}
          <div className="border border-white/10 rounded-2xl p-8 lg:p-12 mb-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Stay in the loop</h3>
              <p className="text-white/50 text-sm max-w-md">Expert maintenance tips, seasonal offers, and insider updates delivered monthly.</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); const input = e.target.querySelector('input'); if (input) input.value = ''; }}
              className="flex w-full lg:w-auto gap-3"
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 lg:w-72 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-[hsl(160,60%,38%)] hover:bg-[hsl(160,60%,33%)] text-white rounded-full text-sm font-semibold tracking-wide transition-all hover:shadow-lg whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
                alt="INAYA Facilities Management" 
                className="h-12 mb-6"
              />
              <p className="text-white/40 text-sm leading-relaxed">
                INAYA Facilities Management Services L.L.C - A Member of Belhasa Group
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a href="https://linkedin.com/company/inaya-fm" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[hsl(160,60%,38%)] flex items-center justify-center transition-all duration-300" aria-label="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://instagram.com/inayafm" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[hsl(160,60%,38%)] flex items-center justify-center transition-all duration-300" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://facebook.com/inayafm" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[hsl(160,60%,38%)] flex items-center justify-center transition-all duration-300" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-sm uppercase tracking-widest text-white/70">Services</h3>
              <div className="space-y-3 text-sm text-white/40">
                <Link to={createPageUrl('IntegratedFM')} className="block hover:text-white transition-colors">Integrated FM</Link>
                <Link to={createPageUrl('HardServices')} className="block hover:text-white transition-colors">Hard Services</Link>
                <Link to={createPageUrl('SoftServices')} className="block hover:text-white transition-colors">Soft Services</Link>
                <Link to={createPageUrl('ProjectManagement')} className="block hover:text-white transition-colors">Project Management</Link>
                <Link to={createPageUrl('OnDemandServices')} className="block hover:text-white transition-colors">On-Demand Services</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-sm uppercase tracking-widest text-white/70">Company</h3>
              <div className="space-y-3 text-sm text-white/40">
                <Link to={createPageUrl('About')} className="block hover:text-white transition-colors">About Us</Link>
                <Link to={createPageUrl('OurPeople')} className="block hover:text-white transition-colors">Our People</Link>
                <Link to={createPageUrl('BusinessExcellence')} className="block hover:text-white transition-colors">Business Excellence</Link>
                <Link to={createPageUrl('Subscriptions')} className="block hover:text-white transition-colors">Packages</Link>
                <Link to={createPageUrl('FAQ')} className="block hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-sm uppercase tracking-widest text-white/70">Contact</h3>
              <div className="space-y-3 text-sm text-white/40">
                <p>28th Street, Belhasa HO Building</p>
                <p>Hor Al Anz East, PO Box 87074</p>
                <p>Dubai, UAE</p>
                <p className="text-white/60 pt-2">T: +971 4 882 7001</p>
                <p className="text-white/60">CS: +971 4 815 7300</p>
                <a href="mailto:info@inayafm.com" className="block text-[hsl(160,60%,45%)] hover:text-[hsl(160,60%,55%)] transition-colors pt-1">info@inayafm.com</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} INAYA Facilities Management. All rights reserved.</p>
            <div className="flex items-center gap-6 text-white/30 text-xs">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white/60 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
