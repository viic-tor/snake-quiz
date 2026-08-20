/**
 * @file playerStats.js
 * @description Estadísticas personales del jugador guardadas en localStorage.
 * Registra: partidas, mejor score, último score, precisión promedio.
 */

import { getPlayerStatsRemote, savePlayerStatsRemote, getAllPlayerStatsRemote, SUPABASE_ENABLED } from "./supabase";

const KEY = "snake-quiz-player-stats-v2";

export function getPlayerStats(playerName, mode) {
  if (!playerName || !mode) return defaultStats();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStats();
    const allData = JSON.parse(raw);
    const playerProfile = allData[playerName] || {};
    const modeStats = playerProfile[mode] || defaultStats();
    return { ...defaultStats(), ...modeStats };
  } catch {
    return defaultStats();
  }
}

function defaultStats() {
  return {
    gamesPlayed: 0,
    bestScore: 0,
    lastScore: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    bestLevel: 0,
    maxStreak: 0,
    lastPlayedAt: null,
    recentAccuracyHistory: [],
  };
}

/**
 * Actualiza las estadísticas al finalizar una partida.
 */
export function updatePlayerStats({ playerName, mode, score, questionsCorrect, questionsAnswered, level }) {
  if (!playerName || !mode) return defaultStats();
  
  let allData = {};
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) allData = JSON.parse(raw);
  } catch {}

  const playerProfile = allData[playerName] || {};
  const prev = playerProfile[mode] || defaultStats();

  // Compatibilidad con perfiles viejos que no tienen maxStreak
  const prevMaxStreak = prev.maxStreak || 0;

  const next = {
    gamesPlayed:   prev.gamesPlayed + 1,
    bestScore:     Math.max(prev.bestScore, score),
    lastScore:     score,
    totalCorrect:  prev.totalCorrect + (questionsCorrect || 0),
    totalAnswered: prev.totalAnswered + (questionsAnswered || 0),
    bestLevel:     Math.max(prev.bestLevel, level || 1),
    maxStreak:     Math.max(prevMaxStreak, arguments[0].maxStreak || 0),
    lastPlayedAt:  new Date().toISOString(),
    recentAccuracyHistory: [...(prev.recentAccuracyHistory || []), { correct: questionsCorrect || 0, answered: questionsAnswered || 0 }].slice(-15),
  };

  playerProfile[mode] = next;
  allData[playerName] = playerProfile;

  try { localStorage.setItem(KEY, JSON.stringify(allData)); } catch { /* storage full */ }
  return next;
}

/**
 * Sincroniza las estadísticas desde Supabase y actualiza el local storage.
 */
export async function syncPlayerStats(playerName, mode) {
  if (!playerName || !mode || !SUPABASE_ENABLED) return getPlayerStats(playerName, mode);
  
  try {
    const remoteData = await getPlayerStatsRemote(playerName, mode);
    if (remoteData) {
      let allData = {};
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) allData = JSON.parse(raw);
      } catch {}
      
      const playerProfile = allData[playerName] || {};
      playerProfile[mode] = { ...defaultStats(), ...remoteData };
      allData[playerName] = playerProfile;
      try { localStorage.setItem(KEY, JSON.stringify(allData)); } catch {}
      
      return playerProfile[mode];
    }
  } catch (err) {
    console.warn("No se pudo sincronizar con Supabase, usando local:", err);
  }
  return getPlayerStats(playerName, mode);
}

/**
 * Sincroniza TODOS los modos desde Supabase de un solo golpe.
 */
export async function syncAllPlayerStats(playerName) {
  if (!playerName || !SUPABASE_ENABLED) return false;
  
  try {
    const remoteDataList = await getAllPlayerStatsRemote(playerName);
    if (remoteDataList && remoteDataList.length > 0) {
      let allData = {};
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) allData = JSON.parse(raw);
      } catch {}
      
      const playerProfile = allData[playerName] || {};
      
      remoteDataList.forEach(remoteData => {
        const mode = remoteData.mode;
        playerProfile[mode] = { ...defaultStats(), ...remoteData };
      });
      
      allData[playerName] = playerProfile;
      try { localStorage.setItem(KEY, JSON.stringify(allData)); } catch {}
      return true;
    }
  } catch (err) {
    console.error("Error syncing all stats", err);
  }
  return false;
}

/**
 * Actualiza las estadísticas localmente y luego en la nube de forma asíncrona.
 */
export async function updatePlayerStatsAsync(params) {
  const localNext = updatePlayerStats(params);
  
  if (SUPABASE_ENABLED) {
    try {
      await savePlayerStatsRemote(params.playerName, params.mode, localNext);
    } catch (err) {
      console.error("Error guardando stats en la nube:", err);
    }
  }
  return localNext;
}

export function getAccuracy(stats) {
  if (stats.recentAccuracyHistory && stats.recentAccuracyHistory.length > 0) {
    const sumC = stats.recentAccuracyHistory.reduce((a, b) => a + b.correct, 0);
    const sumA = stats.recentAccuracyHistory.reduce((a, b) => a + b.answered, 0);
    if (!sumA) return 0;
    return Math.round((sumC / sumA) * 100);
  }
  if (!stats.totalAnswered) return 0;
  return Math.round((stats.totalCorrect / stats.totalAnswered) * 100);
}
