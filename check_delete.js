import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from("leaderboard")
    .delete()
    .eq("name", "TestUser")
    .eq("mode", "hard_6")
    .select();
  console.log("DELETE result:", data, error);
}
check();
