/**
 * Supabase configuration.
 *
 * HOW TO SET UP (once):
 * 1. Go to https://supabase.com -> your project -> "Project Settings" -> "API".
 * 2. Copy "Project URL" into SUPABASE_URL below.
 * 3. Copy "anon public" key into SUPABASE_ANON_KEY below.
 *
 * IMPORTANT: The anon (public) key is SAFE to expose in client code —
 * it is NOT a secret. The actual protection is done by Row Level Security
 * (RLS) on the database. See "supabase-setup.sql" / instructions for the
 * table + policies you must create in the Supabase SQL editor.
 */
const SUPABASE_URL = 'https://fzquxlmnadutjocjfqjz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cXV4bG1uYWR1dGpvY2pmcWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxOTAsImV4cCI6MjEwNDAyMzE5MH0.3SInvEKaDQllZb2koaGAdQXhpMYlRstTTVRrEezbqOM';

const supabase = (SUPABASE_URL.startsWith('https://')
    && typeof window.supabase !== 'undefined'
    && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const DB_TABLE = 'players';

// Expose to global scope so other scripts can read them
window.supabaseClient = supabase;
window.DB_TABLE = DB_TABLE;