import { createClient } from '@supabase/supabase-js';

// We grab the secret keys from your .env.local vault
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We export a single, reusable connection to the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);