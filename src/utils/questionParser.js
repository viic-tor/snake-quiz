/**
 * @file questionParser.js
 * @description Parsea archivos Excel (.xlsx, .xls) y CSV a formato interno.
 *
 * ══════════════════════════════════════════════════════════
 *  FORMATO ESPERADO DEL EXCEL / CSV
 * ══════════════════════════════════════════════════════════
 *
 *  Columnas obligatorias:
 *    Pregunta   → texto de la pregunta
 *    Opcion_A   → opción A
 *    Opcion_B   → opción B
 *    Opcion_C   → opción C
 *    Opcion_D   → opción D
 *    Correcta   → letra de la correcta: A, B, C, D, E o F
 *
 *  Columnas opcionales:
 *    Opcion_E   → quinta opción (si quieres 5 respuestas)
 *    Opcion_F   → sexta opción (si quieres 6 respuestas)
 *    Explicacion → texto que se muestra tras responder
 *    Categoria   → etiqueta: "sistemas", "prog", "historia", etc.
 *
 * ══════════════════════════════════════════════════════════
 */

import * as XLSX from "xlsx";

const LETTER_TO_INDEX = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

/**
 * Lee un File de Excel o CSV y devuelve las filas como objetos.
 * @param {File} file
 * @returns {Promise<object[]>}
 */
async function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
        });
        resolve(rows);
      } catch (err) {
        reject(new Error("No se pudo leer el archivo. Verifica el formato."));
      }
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Normaliza el nombre de columna: quita espacios, acentos y convierte a minúsculas.
 */
function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .trim();
}

/**
 * Busca una clave en el objeto de fila sin importar mayúsculas/acentos.
 */
function findKey(row, candidates) {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const norm = normalize(candidate);
    const found = keys.find((k) => normalize(k) === norm);
    if (found) return row[found];
  }
  return null;
}

/**
 * Convierte filas del Excel al formato interno de pregunta.
 * @param {object[]} rows
 * @returns {{ questions: object[], errors: string[] }}
 */
function rowsToQuestions(rows) {
  const questions = [];
  const errors = [];

  rows.forEach((row, i) => {
    const num = i + 2; // +2 porque fila 1 es encabezado

    const pregunta  = findKey(row, ["Pregunta", "pregunta", "question", "Question"])?.trim();
    const opA       = findKey(row, ["Opcion_A", "opcion_a", "Option_A", "A", "Opcion A"])?.trim();
    const opB       = findKey(row, ["Opcion_B", "opcion_b", "Option_B", "B", "Opcion B"])?.trim();
    const opC       = findKey(row, ["Opcion_C", "opcion_c", "Option_C", "C", "Opcion C"])?.trim();
    const opD       = findKey(row, ["Opcion_D", "opcion_d", "Option_D", "D", "Opcion D"])?.trim();
    const opE       = findKey(row, ["Opcion_E", "opcion_e", "Option_E", "E", "Opcion E"])?.trim();
    const opF       = findKey(row, ["Opcion_F", "opcion_f", "Option_F", "F", "Opcion F"])?.trim();
    const correctaRaw = findKey(row, ["Correcta", "correcta", "Correct", "correct", "Respuesta"])?.trim().toUpperCase();
    const explicacion = findKey(row, ["Explicacion", "explicacion", "Explanation", "explanation", "Explicación"])?.trim() || "";
    const categoria = findKey(row, ["Categoria", "categoria", "Category", "category", "Categoría"])?.trim()?.toLowerCase() || "custom";

    // Validaciones
    if (!pregunta) { errors.push(`Fila ${num}: falta la columna "Pregunta".`); return; }
    if (!opA || !opB || !opC || !opD) { errors.push(`Fila ${num}: faltan opciones A, B, C o D.`); return; }
    if (!correctaRaw || !LETTER_TO_INDEX.hasOwnProperty(correctaRaw)) {
      errors.push(`Fila ${num}: columna "Correcta" debe ser A, B, C, D, E o F (es: "${correctaRaw}").`);
      return;
    }

    // Construir opciones (solo las no vacías)
    const allOptions = [opA, opB, opC, opD, opE, opF].filter(Boolean);
    const answerIdx = LETTER_TO_INDEX[correctaRaw];

    if (answerIdx >= allOptions.length) {
      errors.push(`Fila ${num}: "Correcta" = ${correctaRaw} pero solo hay ${allOptions.length} opciones.`);
      return;
    }

    questions.push({
      id: `custom-${i}-${Date.now()}`,
      question: pregunta,
      options: allOptions,        // entre 4 y 6 opciones
      answer: answerIdx,          // índice 0-based
      explanation: explicacion,
      category: categoria,
    });
  });

  return { questions, errors };
}

/**
 * Función principal: lee un File y retorna las preguntas parseadas.
 * @param {File} file
 * @returns {Promise<{ questions: object[], errors: string[], total: number }>}
 */
export async function parseQuestionFile(file) {
  if (!file) throw new Error("No se proporcionó un archivo.");

  const ext = file.name.split(".").pop().toLowerCase();
  if (!["xlsx", "xls", "csv"].includes(ext)) {
    throw new Error("Formato no soportado. Usa .xlsx, .xls o .csv");
  }

  const rows = await readWorkbook(file);
  if (!rows.length) throw new Error("El archivo está vacío o no tiene filas de datos.");

  const { questions, errors } = rowsToQuestions(rows);
  return { questions, errors, total: rows.length };
}

/**
 * Genera una plantilla de ejemplo en formato XLSX descargable.
 */
export function downloadTemplate() {
  const templateData = [
    {
      Pregunta: "¿Qué es un sistema según la Teoría General de Sistemas?",
      Opcion_A: "Un conjunto de partes aisladas",
      Opcion_B: "Un conjunto de elementos interrelacionados con un objetivo común",
      Opcion_C: "Un programa de computadora",
      Opcion_D: "Un modelo matemático",
      Opcion_E: "Una base de datos relacional",
      Opcion_F: "",
      Correcta: "B",
      Explicacion: "Un sistema es un conjunto de elementos interrelacionados que trabajan hacia un objetivo común.",
      Categoria: "sistemas",
    },
    {
      Pregunta: "¿Cuál es la sintaxis correcta para declarar una variable en JavaScript?",
      Opcion_A: "variable x = 5",
      Opcion_B: "var x = 5",
      Opcion_C: "x := 5",
      Opcion_D: "int x = 5",
      Opcion_E: "",
      Opcion_F: "",
      Correcta: "B",
      Explicacion: "En JavaScript se usa var, let o const para declarar variables.",
      Categoria: "prog",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Preguntas");

  // Ajustar anchos de columna
  ws["!cols"] = [
    { wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 50 }, { wch: 15 },
  ];

  XLSX.writeFile(wb, "plantilla_preguntas_snake.xlsx");
}
