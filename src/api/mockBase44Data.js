/**
 * Mock data for Base44 Entities
 * Data is mutable — create/update/delete operations modify these arrays in-memory.
 */

export const mockUsers = [
    {
        id: 'user_1',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone_number: '+971501234567',
        role: 'customer',
        created_date: new Date().toISOString()
    },
    {
        id: 'admin_1',
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        email: 'admin@inaya.ae',
        role: 'admin',
        created_date: new Date().toISOString()
    }
];

export const mockServices = [
    {
        id: 'svc_1',
        name: 'AC Cleaning',
        description: 'Professional AC cleaning & maintenance',
        price: 150,
        category_id: 'cat_1',
        image: 'https://placehold.co/600x400/png?text=AC+Cleaning',
        duration_minutes: 60,
        active: true
    },
    {
        id: 'svc_2',
        name: 'Plumbing Repair',
        description: 'Fixing leaks and pipe issues',
        price: 120,
        category_id: 'cat_2',
        image: 'https://placehold.co/600x400/png?text=Plumbing',
        duration_minutes: 90,
        active: true
    },
    {
        id: 'svc_3',
        name: 'Electrical Maintenance',
        description: 'Electrical wiring and fixture repair',
        price: 200,
        category_id: 'cat_2',
        image: 'https://placehold.co/600x400/png?text=Electrical',
        duration_minutes: 120,
        active: true
    }
];

export const mockServiceCategories = [
    { id: 'cat_1', name: 'Cooling', description: 'AC and related services' },
    { id: 'cat_2', name: 'Maintenance', description: 'General repairs' }
];

export const mockBookings = [
    {
        id: 'bk_1',
        customer_id: 'user_1',
        service_id: 'svc_1',
        property_id: 'prop_1',
        status: 'completed',
        scheduled_date: '2025-01-15',
        scheduled_time: '10:00 AM - 12:00 PM',
        total_amount: 150,
        payment_status: 'paid',
        created_date: '2025-01-10T08:00:00Z'
    },
    {
        id: 'bk_2',
        customer_id: 'user_1',
        service_id: 'svc_2',
        property_id: 'prop_1',
        status: 'scheduled',
        scheduled_date: '2026-03-20',
        scheduled_time: '02:00 PM - 04:00 PM',
        total_amount: 120,
        payment_status: 'paid',
        created_date: '2026-02-10T08:00:00Z'
    }
];

export const mockSubscriptions = [
    {
        id: 'sub_1',
        customer_id: 'user_1',
        package_id: 'pkg_1',
        status: 'active',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        renewal_reminder_sent: false
    }
];

export const mockSubscriptionPackages = [
    {
        id: 'pkg_1',
        name: 'Gold Annual',
        price: 1500,
        features: ['Unlimited Callouts', '4 AC Services', 'Plumbing & Electrical Coverage']
    },
    {
        id: 'pkg_2',
        name: 'Silver Annual',
        price: 1000,
        features: ['Limited Callouts', '2 AC Services']
    }
];

export const mockProviders = [
    {
        id: 'prov_1',
        full_name: 'Ahmad Hassan',
        name: 'Best Fixers LLC',
        rating: 4.8,
        is_active: true
    }
];

export const mockProviderReviews = [
    {
        id: 'rev_1',
        provider_id: 'prov_1',
        user_id: 'user_1',
        rating: 5,
        comment: 'Great service!'
    }
];

export const mockProperties = [
    {
        id: 'prop_1',
        owner_id: 'user_1',
        property_type: 'villa',
        area: 'Springs 4',
        address: 'Villa 12, Springs 4, Dubai',
        bedrooms: 3,
        square_meters: 280,
        access_notes: 'Gate code: 1234'
    }
];

export const mockSupportTickets = [
    {
        id: 'tic_1',
        customer_id: 'user_1',
        subject: 'Issue with booking',
        message: 'I cannot reschedule my booking.',
        status: 'open',
        created_date: new Date().toISOString()
    }
];

export const mockServiceAddons = [
    {
        id: 'addon_1',
        name: 'Deep Clean Add-on',
        description: 'Extended deep cleaning for AC units',
        price: 50,
        service_id: 'svc_1',
        is_active: true
    },
    {
        id: 'addon_2',
        name: 'Emergency Surcharge',
        description: 'Same-day service priority',
        price: 75,
        service_id: null,
        is_active: true
    }
];
