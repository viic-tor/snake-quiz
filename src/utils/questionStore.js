/**
 * @file questionStore.js
 * @description Almacena y gestiona el banco de preguntas activo.
 * Puede ser el banco por defecto (questions.js) o uno importado desde Excel.
 *
 * El banco activo se guarda en localStorage como JSON para persistir
 * entre sesiones. Si no hay banco importado, usa el por defecto.
 */

import { getRandomQuestion as getBuiltIn, ALL_QUESTIONS } from "../data/questions";

const STORAGE_KEY = "snake-quiz-custom-questions";
const META_KEY    = "snake-quiz-custom-meta";

// ── Lectura / escritura ────────────────────────────────────────────────────

/**
 * Guarda un banco de preguntas personalizado en localStorage.
 * @param {object[]} questions
 * @param {string} sourceName - nombre del archivo importado
 */
export function saveCustomQuestions(questions, sourceName = "Personalizado") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  localStorage.setItem(META_KEY, JSON.stringify({
    name: sourceName,
    count: questions.length,
    importedAt: new Date().toISOString(),
  }));
}

/**
 * Elimina el banco personalizado y vuelve al banco por defecto.
 */
export function clearCustomQuestions() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
}

/**
 * Retorna el banco de preguntas activo (custom si hay, default si no).
 * @returns {object[]}
 */
export function getActiveQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* usa default */ }
  return ALL_QUESTIONS;
}

/**
 * Retorna los metadatos del banco personalizado, o null si usa el default.
 * @returns {{ name: string, count: number, importedAt: string } | null}
 */
export function getCustomMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Indica si hay un banco personalizado activo.
 * @returns {boolean}
 */
export function hasCustomQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

// ── Selección de preguntas ─────────────────────────────────────────────────

/**
 * Devuelve una pregunta aleatoria del banco activo que no haya sido usada.
 * Filtra las preguntas según el número de opciones configurado.
 *
 * @param {string[]} usedIds - IDs ya usados
 * @param {number} answerCount - número de opciones requeridas (4, 5 o 6)
 * @returns {object}
 */
export function getNextQuestion(usedIds = [], answerCount = 4) {
  const bank = getActiveQuestions();

  // Filtrar: solo preguntas con suficientes opciones
  const eligible = bank.filter(
    (q) => q.options.length >= answerCount && !usedIds.includes(q.id)
  );

  // Si ya se usaron todas, reiniciar
  const pool = eligible.length > 0
    ? eligible
    : bank.filter((q) => q.options.length >= answerCount);

  // Fallback: si ninguna tiene suficientes opciones, usar las que haya
  const finalPool = pool.length > 0 ? pool : bank.filter((q) => !usedIds.includes(q.id));
  const lastResort = finalPool.length > 0 ? finalPool : bank;

  const q = lastResort[Math.floor(Math.random() * lastResort.length)];

  // Recortar opciones al número solicitado si tiene más
  if (q.options.length > answerCount) {
    const correctOption = q.options[q.answer];
    // Mantener la correcta + opciones aleatorias hasta answerCount
    const others = q.options.filter((_, i) => i !== q.answer);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, answerCount - 1);
    const newOptions = [...shuffled, correctOption].sort(() => Math.random() - 0.5);
    return {
      ...q,
      options: newOptions,
      answer: newOptions.indexOf(correctOption),
    };
  }

  return { ...q };
}
