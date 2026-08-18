/**
 * @file Leaderboard.jsx
 * @description Tabla de clasificación global con top 10 jugadores.
 * Lee de localStorage. Puede mostrarse como overlay o como sección.
 */

import { getLeaderboard, clearLeaderboard, formatDate } from "../utils/leaderboard";
import { useState } from "react";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ onClose, highlightId }) {
  const [board, setBoard] = useState(() => getLeaderboard());

  const handleClear = () => {
    if (window.confirm("¿Borrar todo el leaderboard? Esta acción no se puede deshacer.")) {
      clearLeaderboard();
      setBoard([]);
    }
  };

  return (
    <div className="lb-overlay" role="dialog" aria-modal="true" aria-label="Tabla de clasificación">
      <div className="lb-modal">
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

        {board.length === 0 ? (
          <div className="lb-empty">
            <span>🎮</span>
            <p>Aún no hay puntuaciones guardadas.</p>
            <p>¡Juega y sé el primero en el ranking!</p>
          </div>
        ) : (
          <table className="lb-table" aria-label="Ranking de jugadores">
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
                  className={`lb-row ${entry.id === highlightId ? "lb-row-highlight" : ""}`}
                >
                  <td className="lb-rank">
                    {i < 3 ? MEDALS[i] : <span className="lb-rank-num">{i + 1}</span>}
                  </td>
                  <td className="lb-name">{entry.name}</td>
                  <td className="lb-score">{entry.score.toLocaleString()}</td>
                  <td className="lb-level">{entry.level}</td>
                  <td className="lb-correct">{entry.questionsCorrect ?? "—"}</td>
                  <td className="lb-food">{entry.foodEaten ?? "—"}</td>
                  <td className="lb-date">{formatDate(entry.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="lb-footer">
          {board.length > 0 && (
            <button id="lb-clear-btn" className="lb-clear-btn" onClick={handleClear}>
              🗑️ Borrar ranking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
