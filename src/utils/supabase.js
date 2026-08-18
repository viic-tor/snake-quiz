/**
 * @file supabase.js
 * @description Cliente Supabase para el leaderboard global.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED = !!(SUPABASE_URL && SUPABASE_KEY);

const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/**
 * Obtiene el top 10 del leaderboard remoto filtrado por modo.
 * @param {"easy"|"hard"} mode
 * @returns {Promise<object[]>}
 */
export async function getLeaderboardRemote(mode = "easy") {
  if (!supabase) throw new Error("Supabase no inicializado");

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("mode", mode)
    .order("score", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data.map((row) => ({
    id: row.id.toString(),
    name: row.name,
    score: row.score,
    level: row.level,
    questionsCorrect: row.questions_correct,
    foodEaten: row.food_eaten,
    mode: row.mode,
    date: row.date,
  }));
}

// Variables para controlar el candado anti-duplicados
let lastSavedSignature = "";
let lastSavedTime = 0;

/**
 * Guarda un score en el leaderboard remoto (con protección anti-duplicados).
 * @param {object} entry
 */
export async function saveScoreRemote(entry) {
  if (!supabase) throw new Error("Supabase no inicializado");

  // Crear una firma única con los datos de esta partida
  const signature = `${entry.name}-${entry.score}-${entry.mode}-${entry.questionsCorrect}-${entry.foodEaten}`;
  const now = Date.now();

  // Si la misma partida intenta guardarse dos veces en menos de 3 segundos, se bloquea la 2da
  if (signature === lastSavedSignature && now - lastSavedTime < 3000) {
    console.warn("⚠️ Intento de guardar score duplicado bloqueado automáticamente.");
    return;
  }

  // Registrar el intento de guardado
  lastSavedSignature = signature;
  lastSavedTime = now;

  const { error } = await supabase.from("leaderboard").insert([
    {
      name:               entry.name,
      score:              entry.score,
      level:              entry.level ?? 1,
      questions_correct:  entry.questionsCorrect ?? 0,
      food_eaten:         entry.foodEaten ?? 0,
      mode:               entry.mode ?? "easy",
    },
  ]);

  if (error) {
    // Si la base de datos falla, liberamos el candado para permitir un reintento
    lastSavedSignature = "";
    throw error;
  }
}