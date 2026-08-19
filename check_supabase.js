import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  console.log("Checking hard_5:");
  let { data, error } = await supabase.from('leaderboard').select('*').eq('mode', 'hard_5');
  console.log(data, error);

  console.log("Checking hard_6:");
  ({ data, error } = await supabase.from('leaderboard').select('*').eq('mode', 'hard_6'));
  console.log(data, error);
}
check();
