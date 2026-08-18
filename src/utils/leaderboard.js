/**
 * @file leaderboard.js
 * @description Gestión del leaderboard local (localStorage) con soporte
 * para dos modos de juego: "easy" y "hard".
 *
 * Claves de localStorage:
 *   snake-quiz-lb-easy  → ranking modo fácil
 *   snake-quiz-lb-hard  → ranking modo difícil
 *
 * Si se configura Supabase (ver supabase.js), las funciones
 * saveScore / getLeaderboard intentan primero la API remota
 * y caen al localStorage como fallback.
 */

import { saveScoreRemote, getLeaderboardRemote, SUPABASE_ENABLED } from "./supabase.js";

const STORAGE_KEYS = {
  easy: "snake-quiz-lb-easy",
  hard: "snake-quiz-lb-hard",
};
const MAX_ENTRIES = 10;

/**
 * Obtiene el leaderboard local para un modo dado.
 * @param {"easy"|"hard"} mode
 * @returns {object[]}
 */
export function getLeaderboardLocal(mode = "easy") {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[mode] ?? STORAGE_KEYS.easy);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Guarda una entrada en el leaderboard local.
 * @param {object} entry
 * @param {"easy"|"hard"} mode
 * @returns {number} posición (1-based) o -1 si no entró al top 10
 */
export function saveScoreLocal(entry, mode = "easy") {
  const board = getLeaderboardLocal(mode);
  const newEntry = {
    id: Date.now().toString(),
    mode,
    ...entry,
    date: new Date().toISOString(),
  };

  board.push(newEntry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, MAX_ENTRIES);
  const position = trimmed.findIndex((e) => e.id === newEntry.id) + 1;

  try {
    const key = STORAGE_KEYS[mode] ?? STORAGE_KEYS.easy;
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch { /* localStorage lleno */ }

  return position > 0 ? position : -1;
}

/**
 * Obtiene el leaderboard (remoto si Supabase está activo, local si no).
 * @param {"easy"|"hard"} mode
 * @returns {Promise<object[]>}
 */
export async function getLeaderboard(mode = "easy") {
  if (SUPABASE_ENABLED) {
    try {
      const remote = await getLeaderboardRemote(mode);
      if (remote && remote.length > 0) return remote;
    } catch { /* fallback a local */ }
  }
  return getLeaderboardLocal(mode);
}

/**
 * Guarda un score (remoto si Supabase está activo, siempre local también).
 * @param {object} entry
 * @param {"easy"|"hard"} mode
 * @returns {Promise<number>} posición
 */
export async function saveScore(entry, mode = "easy") {
  // Siempre guarda local como fallback
  const localPos = saveScoreLocal(entry, mode);

  if (SUPABASE_ENABLED) {
    try {
      await saveScoreRemote({ ...entry, mode });
    } catch { /* error silencioso, queda en local */ }
  }

  return localPos;
}

/**
 * Borra el leaderboard local de un modo.
 * @param {"easy"|"hard"} mode
 */
export function clearLeaderboard(mode = "easy") {
  const key = STORAGE_KEYS[mode] ?? STORAGE_KEYS.easy;
  localStorage.removeItem(key);
}

/**
 * Formatea una fecha ISO a string legible.
 * @param {string} iso
 * @returns {string}
 */
export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
