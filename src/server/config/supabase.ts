import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key if available, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
// Database password for direct connections or other purposes
const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY) must be provided in environment variables');
}

/**
 * Supabase client configured for server-side operations.
 * The client uses PostgREST for HTTP-based database access.
 * The database password is stored in the environment but is primarily used for 
 * direct PostgreSQL connections if needed by other drivers.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: { 
      'x-application-name': 'task-manager-optimized',
      'x-db-password-active': supabaseDbPassword ? 'true' : 'false'
    }
  }
});