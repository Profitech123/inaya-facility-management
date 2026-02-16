import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: (url, options = {}) => {
            // Strip abort signals to prevent Supabase JS internal AbortController
            // from prematurely aborting auth requests (known issue in v2.95.x)
            const { signal, ...rest } = options;
            return fetch(url, rest);
        },
    },
});
