
import { createClient } from '@supabase/supabase-js';

// Direct hardcoded values as requested for immediate fix
const supabaseUrl = 'https://svnyshizkoaqzchkyoyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bnlzaGl6a29hcXpjaGt5b3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDIzNjEsImV4cCI6MjA3OTM3ODM2MX0.v8bggKp_4Aiiw-sfV5QVVOINMDzPazfVzCIynnTC9Ss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
