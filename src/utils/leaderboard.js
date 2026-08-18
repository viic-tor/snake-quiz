/**
 * @file leaderboard.js
 * @description Utilidades para gestionar el leaderboard en localStorage.
 *
 * Estructura de cada entrada:
 * {
 *   id: string (timestamp único),
 *   name: string,
 *   score: number,
 *   level: number,
 *   questionsCorrect: number,
 *   foodEaten: number,
 *   date: string (ISO),
 * }
 */

const STORAGE_KEY = "snake-quiz-leaderboard";
const MAX_ENTRIES = 10;

/**
 * Obtiene el leaderboard completo ordenado por score descendente.
 * @returns {object[]}
 */
export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Guarda una nueva entrada en el leaderboard.
 * Si ya hay MAX_ENTRIES, descarta la de menor puntaje si esta es mayor.
 * @param {object} entry
 * @returns {number} posición en el ranking (1-based), -1 si no entró
 */
export function saveScore(entry) {
  const board = getLeaderboard();
  const newEntry = {
    id: Date.now().toString(),
    ...entry,
    date: new Date().toISOString(),
  };

  board.push(newEntry);
  board.sort((a, b) => b.score - a.score);

  const trimmed = board.slice(0, MAX_ENTRIES);
  const position = trimmed.findIndex((e) => e.id === newEntry.id) + 1;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage lleno — ignorar
  }

  return position > 0 ? position : -1;
}

/**
 * Borra el leaderboard completo.
 */
export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
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
