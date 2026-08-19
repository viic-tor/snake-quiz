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

  // Buscar si ya existe un score para este jugador en este modo
  const { data: existing, error: fetchErr } = await supabase
    .from("leaderboard")
    .select("id, score")
    .eq("name", entry.name)
    .eq("mode", entry.mode ?? "easy")
    .single();

  if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116 = no rows found
    lastSavedSignature = "";
    throw fetchErr;
  }

  if (existing) {
    // Si ya existe, solo actualizar si el puntaje nuevo es mayor
    if (entry.score > existing.score) {
      const { error: updateErr } = await supabase
        .from("leaderboard")
        .update({
          score:              entry.score,
          level:              entry.level ?? 1,
          questions_correct:  entry.questionsCorrect ?? 0,
          food_eaten:         entry.foodEaten ?? 0,
          date:               new Date().toISOString() // Actualiza la fecha
        })
        .eq("id", existing.id);

      if (updateErr) {
        lastSavedSignature = "";
        throw updateErr;
      }
    }
  } else {
    // Si no existe, insertar nuevo registro
    const { error: insertErr } = await supabase.from("leaderboard").insert([
      {
        name:               entry.name,
        score:              entry.score,
        level:              entry.level ?? 1,
        questions_correct:  entry.questionsCorrect ?? 0,
        food_eaten:         entry.foodEaten ?? 0,
        mode:               entry.mode ?? "easy",
      },
    ]);

    if (insertErr) {
      lastSavedSignature = "";
      throw insertErr;
    }
  }
}

/**
 * Registra un nuevo perfil de jugador.
 * @param {string} username
 * @param {string} password
 */
export async function registerPlayer(username, password) {
  if (!supabase) throw new Error("Supabase no inicializado");

  const { data, error } = await supabase
    .from("profiles")
    .insert([{ username, password }])
    .select();

  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error("El nombre de usuario ya está registrado.");
    }
    throw error;
  }
  return data[0];
}

/**
 * Valida las credenciales de un jugador.
 * @param {string} username
 * @param {string} password
 */
export async function loginPlayer(username, password) {
  if (!supabase) throw new Error("Supabase no inicializado");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      throw new Error("Usuario no encontrado.");
    }
    throw error;
  }

  if (data.password !== password) {
    throw new Error("Contraseña incorrecta.");
  }

  return data;
}