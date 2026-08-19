import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  let { data } = await supabase.from('leaderboard').select('*').eq('mode', 'hard_4').limit(5);
  console.log("hard_4:", data);
  
  ({ data } = await supabase.from('leaderboard').select('*').eq('mode', 'easy').limit(5));
  console.log("easy:", data);
}
check();
