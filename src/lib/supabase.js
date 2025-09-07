import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseANONKEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseURL, supabaseANONKEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true 
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
