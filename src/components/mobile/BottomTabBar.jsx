import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Calendar, CreditCard, User } from 'lucide-react';

const TABS = [
  { page: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
  { page: 'MyBookings', label: 'Bookings', Icon: Calendar },
  { page: 'MySubscriptions', label: 'Plans', Icon: CreditCard },
  { page: 'UserProfile', label: 'Profile', Icon: User },
];

// Maps inner pages to the tab they belong to (for state preservation + active highlight)
const PAGE_TO_TAB = {
  Dashboard: 'Dashboard',
  MyProperties: 'Dashboard',
  Notifications: 'Dashboard',
  PaymentHistory: 'Dashboard',
  Support: 'Dashboard',
  BookService: 'Dashboard',
  ServiceFinder: 'Dashboard',
  BookingDetail: 'MyBookings',
  MyBookings: 'MyBookings',
  MySubscriptions: 'MySubscriptions',
  SubscribePackage: 'MySubscriptions',
  PackageBuilder: 'MySubscriptions',
  UserProfile: 'UserProfile',
};

function getTabForPath(pathname) {
  const page = pathname.replace('/', '').split('/')[0].split('?')[0];
  return PAGE_TO_TAB[page] || null;
}

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace('/', '');
  const activeTab = getTabForPath(location.pathname);

  // Persist the last-visited path per tab so switching back restores the deep link
  const [tabPaths, setTabPaths] = useState({});

  useEffect(() => {
    if (activeTab) {
      setTabPaths((prev) => ({
        ...prev,
        [activeTab]: location.pathname + location.search,
      }));
    }
  }, [location.pathname, location.search, activeTab]);

  const handleTabClick = (page, e) => {
    const rootPath = createPageUrl(page);
    if (activeTab === page) {
      // Tapping the active tab resets to its root (clears deep link / params)
      setTabPaths((prev) => ({ ...prev, [page]: rootPath }));
      if (location.pathname + location.search !== rootPath) {
        e.preventDefault();
        navigate(rootPath, { replace: true });
      }
    } else {
      // Switching tabs — restore the stored deep link if one exists
      const stored = tabPaths[page];
      if (stored && stored !== rootPath) {
        e.preventDefault();
        navigate(stored);
      }
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-slate-200 flex safe-bottom lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ page, label, Icon }) => {
        const active = activeTab === page;
        return (
          <Link
            key={page}
            to={createPageUrl(page)}
            onClick={(e) => handleTabClick(page, e)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}