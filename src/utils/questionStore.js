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

  // Buscar preguntas no usadas
  let pool = bank.filter((q) => !usedIds.includes(q.id));
  
  if (pool.length === 0) {
    // Si se usaron todas, reiniciar
    pool = bank;
  }

  const q = pool[Math.floor(Math.random() * pool.length)];

  const correctOption = q.options[q.answer];
  let incorrectOptions = q.options.filter((_, i) => i !== q.answer);

  // Si faltan opciones para llegar a answerCount, robar de otras preguntas
  if (incorrectOptions.length < answerCount - 1) {
    const allOtherIncorrect = bank
      .filter(otherQ => otherQ.id !== q.id)
      .flatMap(otherQ => otherQ.options.filter((_, i) => i !== otherQ.answer));
    
    const shuffledOthers = allOtherIncorrect.sort(() => Math.random() - 0.5);
    for (let option of shuffledOthers) {
      if (incorrectOptions.length >= answerCount - 1) break;
      if (!incorrectOptions.includes(option) && option !== correctOption) {
        incorrectOptions.push(option);
      }
    }
  }

  // Recortar incorrectas por si había más de la cuenta y barajar
  incorrectOptions = incorrectOptions.sort(() => Math.random() - 0.5).slice(0, answerCount - 1);

  // Unir con la correcta y barajar posición final
  const finalOptions = [...incorrectOptions, correctOption].sort(() => Math.random() - 0.5);

  return {
    ...q,
    options: finalOptions,
    answer: finalOptions.indexOf(correctOption),
  };
}
