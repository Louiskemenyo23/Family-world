
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nlyfqscbnqwozgzlxjpr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seWZxc2NibnF3b3pnemx4anByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDM0MjgsImV4cCI6MjA4MDgxOTQyOH0.5KO33LqysiZRSU4y9njSIdfsPPFMCkVX3snp0J2aiCI';

export const supabase = createClient(supabaseUrl, supabaseKey);
