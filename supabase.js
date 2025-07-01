
// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const publicAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZnF1anZsZ2t3c2NrY2FiZGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzQ5NjgsImV4cCI6MjA2NjQ1MDk2OH0.X3HdbBofv8h-cj1rFWdQvqZBBokGOsjH2P8hPb8RzfA';
const urlSupabase = 'https://kdfqujvlgkwsckcabdln.supabase.co';

export const supabase = createClient(
  urlSupabase,       
  publicAnon                  
)

