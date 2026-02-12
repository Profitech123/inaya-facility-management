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
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminBookings from './pages/AdminBookings';
import AdminCSVMigration from './pages/AdminCSVMigration';
import AdminDashboard from './pages/AdminDashboard';
import AdminLiveChat from './pages/AdminLiveChat';
import AdminLogin from './pages/AdminLogin';
import AdminReports from './pages/AdminReports';
import AdminServices from './pages/AdminServices';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminSupport from './pages/AdminSupport';
import BookService from './pages/BookService';
import BusinessExcellence from './pages/BusinessExcellence';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import HardServices from './pages/HardServices';
import Home from './pages/Home';
import IntegratedFM from './pages/IntegratedFM';
import MyBookings from './pages/MyBookings';
import MyProperties from './pages/MyProperties';
import MySubscriptions from './pages/MySubscriptions';
import OurPeople from './pages/OurPeople';
import PaymentHistory from './pages/PaymentHistory';
import ProjectManagement from './pages/ProjectManagement';
import ProviderJobDetails from './pages/ProviderJobDetails';
import ProviderJobs from './pages/ProviderJobs';
import ProviderPortal from './pages/ProviderPortal';
import Services from './pages/Services';
import SoftServices from './pages/SoftServices';
import SubscribePackage from './pages/SubscribePackage';
import Subscriptions from './pages/Subscriptions';
import Support from './pages/Support';
import UserProfile from './pages/UserProfile';
import AdminProviderDetail from './pages/AdminProviderDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminAuditLogs": AdminAuditLogs,
    "AdminBookings": AdminBookings,
    "AdminCSVMigration": AdminCSVMigration,
    "AdminDashboard": AdminDashboard,
    "AdminLiveChat": AdminLiveChat,
    "AdminLogin": AdminLogin,
    "AdminReports": AdminReports,
    "AdminServices": AdminServices,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminSupport": AdminSupport,
    "BookService": BookService,
    "BusinessExcellence": BusinessExcellence,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "HardServices": HardServices,
    "Home": Home,
    "IntegratedFM": IntegratedFM,
    "MyBookings": MyBookings,
    "MyProperties": MyProperties,
    "MySubscriptions": MySubscriptions,
    "OurPeople": OurPeople,
    "PaymentHistory": PaymentHistory,
    "ProjectManagement": ProjectManagement,
    "ProviderJobDetails": ProviderJobDetails,
    "ProviderJobs": ProviderJobs,
    "ProviderPortal": ProviderPortal,
    "Services": Services,
    "SoftServices": SoftServices,
    "SubscribePackage": SubscribePackage,
    "Subscriptions": Subscriptions,
    "Support": Support,
    "UserProfile": UserProfile,
    "AdminProviderDetail": AdminProviderDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};