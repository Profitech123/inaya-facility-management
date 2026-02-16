// Node.js polyfills
if (typeof localStorage === "undefined" || localStorage === null) {
    global.localStorage = {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
    };
}
if (typeof window === "undefined") {
    global.window = { location: { href: '' } };
}

import { base44 } from '../src/api/base44Client.js';

async function verifySetup() {
    console.log("Verifying Admin Features Setup...");

    // 1. Check Tables
    console.log("\n1. Checking 'content_testimonials' table...");
    try {
        const testimonials = await base44.entities.Testimonial.list(null, 1);
        console.log("✅ 'content_testimonials' table exists (Rows:", testimonials.length, ")");
    } catch (e) {
        console.error("❌ 'content_testimonials' table check failed:", e.message);
        if (e.message.includes("404")) console.error("   -> Table likely does not exist.");
    }

    console.log("\n2. Checking 'contact_submissions' table...");
    try {
        const submissions = await base44.entities.ContactSubmission.list(null, 1);
        console.log("✅ 'contact_submissions' table exists (Rows:", submissions.length, ")");
    } catch (e) {
        console.error("❌ 'contact_submissions' table check failed:", e.message);
    }

    // 2. Check Admin User
    console.log("\n3. Verifying Admin User (admin@inaya.ae)...");
    try {
        const user = await base44.auth.adminLogin('admin@inaya.ae', 'admin123');
        console.log("✅ Admin login successful:", user.email, "ID:", user.id);
    } catch (e) {
        console.error("❌ Admin login failed:", e.message);
        console.log("   -> If 'Invalid login credentials', the user likely needs to be created.");

        // Attempt to create if failed
        if (e.message.includes("Invalid login credentials")) {
            console.log("\n   Attempting to create Admin user...");
            try {
                const { user } = await base44.auth.signUp({
                    email: 'admin@inaya.ae',
                    password: 'admin123!@#',
                    fullName: 'System Admin',
                    firstName: 'System',
                    lastName: 'Admin'
                });
                console.log("   ✅ Admin user created/signed up:", user?.email);
                console.log("   ⚠️  IMPORTANT: You must manually set this user's role to 'admin' in the 'profiles' table if it's not set automatically.");
            } catch (setupErr) {
                console.error("   ❌ Failed to create admin user:", setupErr.message);
            }
        }
    }
}

// Check if running in browser or Node (this script is intended for the browser console or Node with polyfills)
// Since we are invalidating imports, we might not be able to run this easily in Node without setting up fetch/localstorage polyfills.
// However, the browser tool can run this JS code if we inject it.

// Run the verification
verifySetup();
