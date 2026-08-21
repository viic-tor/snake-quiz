import fs from 'fs';

let allQuestions = [];
for (let i = 0; i < 4; i++) {
  const fileContent = fs.readFileSync(`./temp_chunks/questions_chunk_${i}_out.json`, 'utf-8');
  const chunk = JSON.parse(fileContent);
  allQuestions = allQuestions.concat(chunk);
}

const header = `/**
 * @file questions.js
 * @description Banco de preguntas para el Quiz de Snake.
 * Categorías:
 *   - "sistemas"  → Teoría General de Sistemas
 *   - "prog"      → Introducción a Programación
 *
 * Cada pregunta tiene:
 *   id        : identificador único
 *   category  : "sistemas" | "prog"
 *   question  : texto de la pregunta
 *   options   : array de 6 opciones [string]
 *   answer    : índice (0-5) de la opción correcta
 *   explanation: breve explicación de la respuesta
 */

export const QUESTIONS = `;

const footer = `;

export function getRandomQuestion(usedIds = []) {
  const available = QUESTIONS.filter((q) => !usedIds.includes(q.id));
  if (available.length === 0) return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

/** Alias para que questionStore pueda importar el banco completo */
export const ALL_QUESTIONS = QUESTIONS;
`;

const outputContent = header + JSON.stringify(allQuestions, null, 2) + footer;
fs.writeFileSync('./src/data/questions.js', outputContent);
console.log(`Successfully merged ${allQuestions.length} questions.`);
