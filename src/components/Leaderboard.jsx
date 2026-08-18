/**
 * @file Leaderboard.jsx
 * @description Tabla de clasificación con tabs para Fácil y Difícil.
 * Lee del leaderboard local (con fallback/integración Supabase).
 */

import { useState, useEffect } from "react";
import { getLeaderboard, clearLeaderboard, formatDate } from "../utils/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ onClose, highlightId, initialMode = "easy" }) {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar leaderboard cuando cambia el modo
  useEffect(() => {
    setLoading(true);
    let cancelled = false;

    getLeaderboard(activeMode).then((data) => {
      if (!cancelled) {
        setBoard(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setBoard([]);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [activeMode]);

  const handleClear = () => {
    if (!window.confirm(`¿Borrar el ranking de modo ${activeMode === "easy" ? "Fácil" : "Difícil"}?`)) return;
    clearLeaderboard(activeMode);
    setBoard([]);
  };

  return (
    <div className="lb-overlay" role="dialog" aria-modal="true" aria-label="Tabla de clasificación">
      <div className="lb-modal">

        {/* Header */}
        <div className="lb-header">
          <h2 className="lb-title">🏆 Leaderboard</h2>
          <button
            id="lb-close-btn"
            className="lb-close-btn"
            onClick={onClose}
            aria-label="Cerrar leaderboard"
          >
            ✕
          </button>
        </div>

        {/* Tabs de modo */}
        <div className="lb-tabs" role="tablist" aria-label="Modo de juego">
          <button
            id="lb-tab-easy"
            role="tab"
            aria-selected={activeMode === "easy"}
            className={`lb-tab ${activeMode === "easy" ? "lb-tab-active lb-tab-easy" : ""}`}
            onClick={() => setActiveMode("easy")}
          >
            🟢 Fácil
          </button>
          <button
            id="lb-tab-hard"
            role="tab"
            aria-selected={activeMode === "hard"}
            className={`lb-tab ${activeMode === "hard" ? "lb-tab-active lb-tab-hard" : ""}`}
            onClick={() => setActiveMode("hard")}
          >
            🔴 Difícil
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="lb-empty">
            <span className="lb-spinner">⏳</span>
            <p>Cargando ranking...</p>
          </div>
        ) : board.length === 0 ? (
          <div className="lb-empty">
            <span>{activeMode === "hard" ? "💀" : "🎮"}</span>
            <p>No hay puntuaciones en modo {activeMode === "easy" ? "Fácil" : "Difícil"}.</p>
            <p>¡Juega y sé el primero en el ranking!</p>
          </div>
        ) : (
          <div className="lb-table-wrap">
            <table className="lb-table" aria-label={`Ranking modo ${activeMode}`}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Puntos</th>
                  <th>Nivel</th>
                  <th>✅</th>
                  <th>🍎</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {board.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`lb-row ${activeMode === "hard" ? "lb-row-hard" : ""} ${entry.id === highlightId ? "lb-row-highlight" : ""}`}
                  >
                    <td className="lb-rank">
                      {i < 3
                        ? <span title={`${i + 1}er lugar`}>{MEDALS[i]}</span>
                        : <span className="lb-rank-num">{i + 1}</span>}
                    </td>
                    <td className="lb-name">{entry.name}</td>
                    <td className={`lb-score ${activeMode === "hard" ? "lb-score-hard" : ""}`}>
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="lb-level">{entry.level}</td>
                    <td className="lb-correct">{entry.questionsCorrect ?? "—"}</td>
                    <td className="lb-food">{entry.foodEaten ?? "—"}</td>
                    <td className="lb-date">{formatDate(entry.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="lb-footer">
          {board.length > 0 && (
            <button id="lb-clear-btn" className="lb-clear-btn" onClick={handleClear}>
              🗑️ Borrar ranking {activeMode === "easy" ? "Fácil" : "Difícil"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
