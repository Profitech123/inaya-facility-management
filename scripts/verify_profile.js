
import { base44 } from '../src/api/base44Client.js';
import { supabase } from '../src/api/supabaseClient.js';

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

async function verifyProfile() {
    console.log("Verifying Admin Profile...");

    try {
        // 1. Login to get UID
        const user = await base44.auth.adminLogin('admin@inaya.ae', 'admin123');
        console.log("✅ Logged in as:", user.email, "ID:", user.id);

        // 2. Check Profile directly using admin key (simulated by service role? No, we don't have service role in client)
        // We have to use the user's token.

        // We need to fetch the profile using the user's session
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error("❌ Failed to fetch profile:", error.message);
            console.log("   -> If 'JSON object requested, multiple (or no) rows returned', the profile is MISSING.");

            // Attempt to create it
            console.log("   Attempting to create/fix profile...");
            const { error: createErr } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    role: 'admin',
                    full_name: 'Admin User'
                });

            if (createErr) {
                console.error("   ❌ Failed to create profile:", createErr.message);
            } else {
                console.log("   ✅ Profile created/updated successfully!");
            }

        } else {
            console.log("✅ Profile found:", profile);
            if (profile.role !== 'admin') {
                console.error("❌ Role is NOT admin. It is:", profile.role);
                // Fix it
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                console.log("   -> Updated role to 'admin'.");
            }
        }

    } catch (e) {
        console.error("❌ Script Error:", e.read ? await e.read() : e.message);
    }
}

verifyProfile();
