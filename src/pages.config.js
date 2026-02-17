/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminBookings from './pages/AdminBookings';
import AdminCSVMigration from './pages/AdminCSVMigration';
import AdminCustomers from './pages/AdminCustomers';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmailTemplates from './pages/AdminEmailTemplates';
import AdminInvoices from './pages/AdminInvoices';
import AdminLiveChat from './pages/AdminLiveChat';
import AdminProviderDetail from './pages/AdminProviderDetail';
import AdminReports from './pages/AdminReports';
import AdminServiceAreas from './pages/AdminServiceAreas';
import AdminServices from './pages/AdminServices';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminSupport from './pages/AdminSupport';
import AdminTechSchedule from './pages/AdminTechSchedule';
import AdminTechnicians from './pages/AdminTechnicians';
import BookingDetail from './pages/BookingDetail';
import BusinessExcellence from './pages/BusinessExcellence';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import HardServices from './pages/HardServices';
import Home from './pages/Home';
import IntegratedFM from './pages/IntegratedFM';
import MyBookings from './pages/MyBookings';
import MyProperties from './pages/MyProperties';
import MySubscriptions from './pages/MySubscriptions';
import Notifications from './pages/Notifications';
import OnDemandServices from './pages/OnDemandServices';
import OurPeople from './pages/OurPeople';
import PackageBuilder from './pages/PackageBuilder';
import PaymentHistory from './pages/PaymentHistory';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProjectManagement from './pages/ProjectManagement';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderOnboarding from './pages/ProviderOnboarding';
import ServiceFinder from './pages/ServiceFinder';
import Services from './pages/Services';
import SoftServices from './pages/SoftServices';
import SubscribePackage from './pages/SubscribePackage';
import Subscriptions from './pages/Subscriptions';
import Support from './pages/Support';
import TechnicianProfile from './pages/TechnicianProfile';
import TermsOfService from './pages/TermsOfService';
import UserProfile from './pages/UserProfile';
import BookService from './pages/BookService';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminAnalytics": AdminAnalytics,
    "AdminAuditLogs": AdminAuditLogs,
    "AdminBookings": AdminBookings,
    "AdminCSVMigration": AdminCSVMigration,
    "AdminCustomers": AdminCustomers,
    "AdminDashboard": AdminDashboard,
    "AdminEmailTemplates": AdminEmailTemplates,
    "AdminInvoices": AdminInvoices,
    "AdminLiveChat": AdminLiveChat,
    "AdminProviderDetail": AdminProviderDetail,
    "AdminReports": AdminReports,
    "AdminServiceAreas": AdminServiceAreas,
    "AdminServices": AdminServices,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminSupport": AdminSupport,
    "AdminTechSchedule": AdminTechSchedule,
    "AdminTechnicians": AdminTechnicians,
    "BookingDetail": BookingDetail,
    "BusinessExcellence": BusinessExcellence,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "FAQ": FAQ,
    "HardServices": HardServices,
    "Home": Home,
    "IntegratedFM": IntegratedFM,
    "MyBookings": MyBookings,
    "MyProperties": MyProperties,
    "MySubscriptions": MySubscriptions,
    "Notifications": Notifications,
    "OnDemandServices": OnDemandServices,
    "OurPeople": OurPeople,
    "PackageBuilder": PackageBuilder,
    "PaymentHistory": PaymentHistory,
    "PrivacyPolicy": PrivacyPolicy,
    "ProjectManagement": ProjectManagement,
    "ProviderDashboard": ProviderDashboard,
    "ProviderOnboarding": ProviderOnboarding,
    "ServiceFinder": ServiceFinder,
    "Services": Services,
    "SoftServices": SoftServices,
    "SubscribePackage": SubscribePackage,
    "Subscriptions": Subscriptions,
    "Support": Support,
    "TechnicianProfile": TechnicianProfile,
    "TermsOfService": TermsOfService,
    "UserProfile": UserProfile,
    "BookService": BookService,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};