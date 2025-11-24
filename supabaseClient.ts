import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oucnqfnbrlhrgceeiuee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Y25xZm5icmxocmdjZWVpdWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODI0MjIsImV4cCI6MjA3OTU1ODQyMn0._FZXPGuAbLIed_1ZGdb8vC4wtRSpwt_T2J5qgO1okQo';

export const supabase = createClient(supabaseUrl, supabaseKey);
