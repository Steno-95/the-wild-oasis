import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nettxaarfoalzldbrltg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldHR4YWFyZm9hbHpsZGJybHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzI2NDMsImV4cCI6MjA1NzEwODY0M30.2Mlq0NUxHgoJn0RCdiE-xbpdgov6MGFg7JMRknBD5g8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
