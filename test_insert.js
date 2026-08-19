import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const entry = {
    name: "TestUser",
    score: 999,
    level: 2,
    questionsCorrect: 1,
    foodEaten: 5,
    mode: "hard_6"
  };
  
  // same logic as supabase.js saveScoreRemote insert
  const { data, error } = await supabase
    .from("leaderboard")
    .insert([
      {
        name:              entry.name,
        score:             entry.score,
        level:             entry.level ?? 1,
        questions_correct: entry.questionsCorrect ?? 0,
        food_eaten:        entry.foodEaten ?? 0,
        mode:              entry.mode ?? "easy",
        date:              new Date().toISOString()
      }
    ])
    .select();
    
  console.log("INSERT RESULT:", data, error);
}
test();
