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
import AdminBookings from './pages/AdminBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminSubscriptions from './pages/AdminSubscriptions';
import BookService from './pages/BookService';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import MyProperties from './pages/MyProperties';
import MySubscriptions from './pages/MySubscriptions';
import ProviderJobDetails from './pages/ProviderJobDetails';
import ProviderJobs from './pages/ProviderJobs';
import ProviderPortal from './pages/ProviderPortal';
import Services from './pages/Services';
import SubscribePackage from './pages/SubscribePackage';
import Subscriptions from './pages/Subscriptions';
import PaymentHistory from './pages/PaymentHistory';
import Support from './pages/Support';
import AdminReports from './pages/AdminReports';
import AdminSupport from './pages/AdminSupport';
import IntegratedFM from './pages/IntegratedFM';
import HardServices from './pages/HardServices';
import SoftServices from './pages/SoftServices';
import ProjectManagement from './pages/ProjectManagement';
import OurPeople from './pages/OurPeople';
import BusinessExcellence from './pages/BusinessExcellence';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminBookings": AdminBookings,
    "AdminDashboard": AdminDashboard,
    "AdminServices": AdminServices,
    "AdminSubscriptions": AdminSubscriptions,
    "BookService": BookService,
    "Contact": Contact,
    "Dashboard": Dashboard,
    "Home": Home,
    "MyBookings": MyBookings,
    "MyProperties": MyProperties,
    "MySubscriptions": MySubscriptions,
    "ProviderJobDetails": ProviderJobDetails,
    "ProviderJobs": ProviderJobs,
    "ProviderPortal": ProviderPortal,
    "Services": Services,
    "SubscribePackage": SubscribePackage,
    "Subscriptions": Subscriptions,
    "PaymentHistory": PaymentHistory,
    "Support": Support,
    "AdminReports": AdminReports,
    "AdminSupport": AdminSupport,
    "IntegratedFM": IntegratedFM,
    "HardServices": HardServices,
    "SoftServices": SoftServices,
    "ProjectManagement": ProjectManagement,
    "OurPeople": OurPeople,
    "BusinessExcellence": BusinessExcellence,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};