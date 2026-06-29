import { lazy } from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

// Eagerly import only the landing page; all other pages are code-split
// and loaded on-demand when the user navigates to them.
const About = lazy(() => import('./pages/About'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminAuditLogs = lazy(() => import('./pages/AdminAuditLogs'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const AdminCSVMigration = lazy(() => import('./pages/AdminCSVMigration'));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEmailTemplates = lazy(() => import('./pages/AdminEmailTemplates'));
const AdminInvoices = lazy(() => import('./pages/AdminInvoices'));
const AdminLiveChat = lazy(() => import('./pages/AdminLiveChat'));
const AdminProviderDetail = lazy(() => import('./pages/AdminProviderDetail'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminServiceAreas = lazy(() => import('./pages/AdminServiceAreas'));
const AdminServices = lazy(() => import('./pages/AdminServices'));
const AdminSubscriptions = lazy(() => import('./pages/AdminSubscriptions'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));
const AdminTechSchedule = lazy(() => import('./pages/AdminTechSchedule'));
const AdminTechnicians = lazy(() => import('./pages/AdminTechnicians'));
const BookService = lazy(() => import('./pages/BookService'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const BusinessExcellence = lazy(() => import('./pages/BusinessExcellence'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FAQ = lazy(() => import('./pages/FAQ'));
const HardServices = lazy(() => import('./pages/HardServices'));
const IntegratedFM = lazy(() => import('./pages/IntegratedFM'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyProperties = lazy(() => import('./pages/MyProperties'));
const MySubscriptions = lazy(() => import('./pages/MySubscriptions'));
const Notifications = lazy(() => import('./pages/Notifications'));
const OnDemandServices = lazy(() => import('./pages/OnDemandServices'));
const OurPeople = lazy(() => import('./pages/OurPeople'));
const PackageBuilder = lazy(() => import('./pages/PackageBuilder'));
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const ProviderOnboarding = lazy(() => import('./pages/ProviderOnboarding'));
const ServiceFinder = lazy(() => import('./pages/ServiceFinder'));
const Services = lazy(() => import('./pages/Services'));
const SoftServices = lazy(() => import('./pages/SoftServices'));
const SubscribePackage = lazy(() => import('./pages/SubscribePackage'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Support = lazy(() => import('./pages/Support'));
const TechnicianProfile = lazy(() => import('./pages/TechnicianProfile'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

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
    "BookService": BookService,
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};