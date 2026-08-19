/**
 * @file QuestionImporter.jsx
 * @description Modal para importar preguntas desde Excel/CSV.
 * Muestra una vista previa de las preguntas parseadas antes de confirmar.
 */

import { useState, useRef } from "react";
import { parseQuestionFile, downloadTemplate } from "../utils/questionParser";
import { saveCustomQuestions, clearCustomQuestions, getCustomMeta, hasCustomQuestions } from "../utils/questionStore";

const CATEGORY_COLORS = {
  sistemas: "#4facfe",
  prog: "#a855f7",
  custom: "#ffd700",
  historia: "#f97316",
  matematicas: "#10b981",
  ciencias: "#06b6d4",
};

export default function QuestionImporter({ onClose, onImported }) {
  const [step, setStep] = useState("upload"); // upload | preview | success
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);
  const meta = getCustomMeta();
  const hasCustom = hasCustomQuestions();

  const processFile = async (file) => {
    setLoading(true);
    setFileName(file.name);
    try {
      const parsed = await parseQuestionFile(file);
      setResult({ ...parsed, fileName: file.name });
      setStep("preview");
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleConfirm = () => {
    if (!result?.questions?.length) return;
    saveCustomQuestions(result.questions, result.fileName);
    setStep("success");
    onImported?.(result.questions, result.fileName);
  };

  const handleClear = () => {
    clearCustomQuestions();
    onImported?.(null, null);
    onClose();
  };

  return (
    <div className="importer-overlay" role="dialog" aria-modal="true">
      <div className="importer-modal">

        {/* Header */}
        <div className="importer-header">
          <h2 className="importer-title">📂 Importar Preguntas</h2>
          <button id="importer-close" className="lb-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Banco actual */}
        {hasCustom && meta && step === "upload" && (
          <div className="importer-current">
            <span className="importer-current-icon">✅</span>
            <div>
              <span className="importer-current-label">Banco activo:</span>
              <span className="importer-current-name">{meta.name}</span>
              <span className="importer-current-count">{meta.count} preguntas</span>
            </div>
            <button id="importer-clear-btn" className="btn btn-sm btn-ghost danger-btn" onClick={handleClear}>
              🗑️ Restaurar por defecto
            </button>
          </div>
        )}

        {/* ── Paso 1: Upload ── */}
        {step === "upload" && (
          <div className="importer-body">
            {/* Zona de drop */}
            <div
              className={`drop-zone ${dragOver ? "drop-zone-active" : ""} ${loading ? "drop-zone-loading" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Zona de carga de archivo"
            >
              {loading ? (
                <div className="drop-loading">
                  <div className="drop-spinner" />
                  <p>Procesando <b>{fileName}</b>...</p>
                </div>
              ) : (
                <>
                  <span className="drop-icon">📊</span>
                  <p className="drop-title">Arrastra tu archivo aquí</p>
                  <p className="drop-subtitle">o haz clic para seleccionar</p>
                  <span className="drop-formats">.xlsx · .xls · .csv</span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-input"
              />
            </div>

            {/* Error */}
            {result?.error && (
              <div className="importer-error" role="alert">
                ⚠️ {result.error}
              </div>
            )}

            {/* Botón plantilla */}
            <div className="importer-template-section">
              <p className="importer-template-label">¿No tienes el archivo? Descarga la plantilla:</p>
              <button id="download-template-btn" className="btn btn-secondary btn-sm" onClick={downloadTemplate}>
                ⬇️ Descargar plantilla Excel
              </button>
            </div>

            {/* Formato */}
            <div className="importer-format">
              <p className="format-title">📋 Formato esperado del Excel:</p>
              <div className="format-table-wrap">
                <table className="format-table">
                  <thead>
                    <tr>
                      <th>Columna</th><th>Ejemplo</th><th>¿Requerida?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Pregunta", "¿Qué es un sistema?", "✅ Sí"],
                      ["Opcion_A", "Conjunto de elementos", "✅ Sí"],
                      ["Opcion_B", "Un programa", "✅ Sí"],
                      ["Opcion_C", "Un proceso", "✅ Sí"],
                      ["Opcion_D", "Un algoritmo", "✅ Sí"],
                      ["Opcion_E", "Una red", "⬜ Opcional (5a)"],
                      ["Opcion_F", "Un modelo", "⬜ Opcional (6a)"],
                      ["Correcta", "A", "✅ Sí (A–F)"],
                      ["Explicacion", "Porque...", "⬜ Opcional"],
                      ["Categoria", "sistemas", "⬜ Opcional"],
                    ].map(([col, ex, req]) => (
                      <tr key={col}>
                        <td><code>{col}</code></td>
                        <td className="format-ex">{ex}</td>
                        <td className={req.startsWith("✅") ? "format-req" : "format-opt"}>{req}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Paso 2: Preview ── */}
        {step === "preview" && result && (
          <div className="importer-body">
            {/* Resumen */}
            <div className="preview-summary">
              <div className="preview-stat">
                <span className="preview-stat-num">{result.questions.length}</span>
                <span className="preview-stat-label">Preguntas válidas</span>
              </div>
              <div className="preview-stat">
                <span className="preview-stat-num warn">{result.errors.length}</span>
                <span className="preview-stat-label">Con errores</span>
              </div>
              <div className="preview-stat">
                <span className="preview-stat-num">{result.total}</span>
                <span className="preview-stat-label">Filas totales</span>
              </div>
            </div>

            {/* Errores de parseo */}
            {result.errors.length > 0 && (
              <div className="preview-errors">
                <p className="preview-errors-title">⚠️ Filas con problemas (se omiten):</p>
                <ul className="preview-errors-list">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {result.errors.length > 5 && <li>...y {result.errors.length - 5} más</li>}
                </ul>
              </div>
            )}

            {/* Vista previa de preguntas */}
            {result.questions.length > 0 ? (
              <div className="preview-list">
                <p className="preview-list-title">Vista previa (primeras 5):</p>
                {result.questions.slice(0, 5).map((q, i) => (
                  <div key={q.id} className="preview-card">
                    <div className="preview-card-header">
                      <span className="preview-num">#{i + 1}</span>
                      <span
                        className="preview-cat"
                        style={{ color: CATEGORY_COLORS[q.category] || "#ffd700" }}
                      >
                        {q.category}
                      </span>
                      <span className="preview-opts-count">{q.options.length} opciones</span>
                    </div>
                    <p className="preview-question">{q.question}</p>
                    <div className="preview-options">
                      {q.options.map((opt, oi) => (
                        <span
                          key={oi}
                          className={`preview-opt ${oi === q.answer ? "preview-correct" : ""}`}
                        >
                          {["A","B","C","D","E","F"][oi]}. {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="importer-error">
                ❌ No se encontraron preguntas válidas. Revisa el formato del archivo.
              </div>
            )}

            {/* Acciones */}
            <div className="preview-actions">
              <button id="preview-back-btn" className="btn btn-ghost" onClick={() => { setStep("upload"); setResult(null); }}>
                ← Volver
              </button>
              {result.questions.length > 0 && (
                <button id="preview-confirm-btn" className="btn btn-primary" onClick={handleConfirm}>
                  ✅ Usar estas {result.questions.length} preguntas
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Paso 3: Éxito ── */}
        {step === "success" && (
          <div className="importer-success">
            <span className="success-icon">🎉</span>
            <h3>¡Banco importado!</h3>
            <p>{result.questions.length} preguntas cargadas desde <b>{result.fileName}</b></p>
            <p className="success-note">El juego usará estas preguntas mientras no importes otras.</p>
            <button id="importer-done-btn" className="btn btn-primary" onClick={onClose}>
              ✅ ¡A jugar!
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
