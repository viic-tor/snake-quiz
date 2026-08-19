import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("name", "SEBASTIAN PINEDA")
    .eq("mode", "hard_6");
  console.log(data);
}
check();
