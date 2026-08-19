/**
 * @file playerStats.js
 * @description Estadísticas personales del jugador guardadas en localStorage.
 * Registra: partidas, mejor score, último score, precisión promedio.
 */

const KEY = "snake-quiz-player-stats";

export function getPlayerStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
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
    lastPlayedAt: null,
  };
}

/**
 * Actualiza las estadísticas al finalizar una partida.
 * Solo se llama cuando se juega con banco base.
 */
export function updatePlayerStats({ score, questionsCorrect, questionsAnswered, level }) {
  const prev = getPlayerStats();
  const next = {
    gamesPlayed:   prev.gamesPlayed + 1,
    bestScore:     Math.max(prev.bestScore, score),
    lastScore:     score,
    totalCorrect:  prev.totalCorrect + (questionsCorrect || 0),
    totalAnswered: prev.totalAnswered + (questionsAnswered || 0),
    bestLevel:     Math.max(prev.bestLevel, level || 1),
    lastPlayedAt:  new Date().toISOString(),
  };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full */ }
  return next;
}

export function getAccuracy(stats) {
  if (!stats.totalAnswered) return 0;
  return Math.round((stats.totalCorrect / stats.totalAnswered) * 100);
}
