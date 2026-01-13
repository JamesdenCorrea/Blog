import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables (.env file)
// These should be set in your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create and export the Supabase client
// This client handles all database operations and authentication
export const supabase = createClient(supabaseUrl, supabaseAnonKey);