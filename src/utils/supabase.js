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
    .limit(50); // Fetch extra for deduplication

  if (error) throw error;

  // Deduplicar nombres (quedarnos con el mejor puntaje por jugador)
  const uniqueData = [];
  const seen = new Set();
  
  for (const row of data) {
    const nameLower = row.name.toLowerCase();
    if (!seen.has(nameLower)) {
      uniqueData.push(row);
      seen.add(nameLower);
      if (uniqueData.length === 10) break;
    }
  }

  return uniqueData.map((row) => ({
    id: row.id.toString(),
    name: row.name,
    score: row.score,
    level: row.level,
    questionsCorrect: row.questions_correct,
    maxStreak: row.max_streak,
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
      const { data: updateData, error: updateErr } = await supabase
        .from("leaderboard")
        .update({
          score:              entry.score,
          level:              entry.level ?? 1,
          questions_correct:  entry.questionsCorrect ?? 0,
          max_streak:         entry.maxStreak ?? 0,
          food_eaten:         entry.foodEaten ?? 0,
          date:               new Date().toISOString() // Actualiza la fecha
        })
        .eq("id", existing.id)
        .select();

      if (updateErr) {
        lastSavedSignature = "";
        throw updateErr;
      }

      // Si RLS bloqueó el UPDATE, updateData estará vacío, así que forzamos un INSERT
      if (!updateData || updateData.length === 0) {
        await supabase.from("leaderboard").insert([
          {
            name:              entry.name,
            score:             entry.score,
            level:             entry.level ?? 1,
            questions_correct: entry.questionsCorrect ?? 0,
            max_streak:        entry.maxStreak ?? 0,
            food_eaten:        entry.foodEaten ?? 0,
            mode:              entry.mode ?? "easy",
            date:              new Date().toISOString()
          }
        ]);
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
        max_streak:         entry.maxStreak ?? 0,
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

  // Si las columnas no existen, devolvemos default
  return {
    ...data,
    coins: data.coins || 0,
    unlocked_skins: data.unlocked_skins || ['google'],
    base_color: data.base_color || '#4ade80'
  };
}

/**
 * Guarda el progreso económico del jugador.
 * @param {string} username
 * @param {number} coins
 * @param {string[]} unlockedSkins
 * @param {string} [baseColor="#4ade80"]
 */
export async function updatePlayerProfile(username, coins, unlockedSkins, baseColor = "#4ade80") {
  if (!supabase) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      coins: coins,
      unlocked_skins: unlockedSkins,
      base_color: baseColor
    })
    .eq("username", username);

  if (error) {
    console.warn("No se pudo guardar la economía en Supabase (puede que falten las columnas 'coins' y 'unlocked_skins'). Guardando en local.", error);
  }
}

/**
 * Obtiene las estadísticas completas de un jugador desde la nube (player_stats).
 * @param {string} playerName 
 * @param {string} mode 
 */
export async function getPlayerStatsRemote(playerName, mode) {
  if (!supabase) throw new Error("Supabase no inicializado");

  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("player_name", playerName)
    .eq("mode", mode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No existe todavía
    throw error;
  }

  return {
    gamesPlayed: data.games_played,
    bestScore: data.best_score,
    lastScore: data.last_score,
    totalCorrect: data.total_correct,
    totalAnswered: data.total_answered,
    bestLevel: data.best_level,
    recentAccuracyHistory: data.recent_accuracy_history || [],
    lastPlayedAt: data.last_played_at
  };
}

/**
 * Guarda o actualiza las estadísticas completas de un jugador en la nube.
 * @param {string} playerName 
 * @param {string} mode 
 * @param {object} statsData - El objeto stats formateado
 */
export async function savePlayerStatsRemote(playerName, mode, statsData) {
  if (!supabase) throw new Error("Supabase no inicializado");

  const { error } = await supabase
    .from("player_stats")
    .upsert({
      player_name: playerName,
      mode: mode,
      games_played: statsData.gamesPlayed,
      best_score: statsData.bestScore,
      last_score: statsData.lastScore,
      total_correct: statsData.totalCorrect,
      total_answered: statsData.totalAnswered,
      best_level: statsData.bestLevel,
      recent_accuracy_history: statsData.recentAccuracyHistory,
      last_played_at: statsData.lastPlayedAt || new Date().toISOString()
    }, {
      onConflict: 'player_name, mode'
    });

  if (error) throw error;
}

/**
 * Obtiene las estadísticas de todos los modos de un jugador de un solo golpe.
 * @param {string} playerName 
 */
export async function getAllPlayerStatsRemote(playerName) {
  if (!supabase) throw new Error("Supabase no inicializado");

  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("player_name", playerName);

  if (error) throw error;
  
  return data.map(row => ({
    mode: row.mode,
    gamesPlayed: row.games_played,
    bestScore: row.best_score,
    lastScore: row.last_score,
    totalCorrect: row.total_correct,
    totalAnswered: row.total_answered,
    bestLevel: row.best_level,
    recentAccuracyHistory: row.recent_accuracy_history || [],
    lastPlayedAt: row.last_played_at
  }));
}