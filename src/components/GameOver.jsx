/**
 * @file GameOver.jsx
 * @description Pantalla de Game Over con resumen de estadísticas,
 * posición en el leaderboard y opciones para reintentar o volver al menú.
 */

import { useEffect, useState } from "react";
import { saveScore, getLeaderboard } from "../utils/leaderboard";
import Leaderboard from "./Leaderboard";

export default function GameOver({ state, playerName, onRestart, onMenu }) {
  const [lbPosition, setLbPosition] = useState(null);
  const [savedEntryId, setSavedEntryId] = useState(null);
  const [showLb, setShowLb] = useState(false);

  useEffect(() => {
    // Guardar puntuación al montar
    const entry = {
      name: playerName,
      score: state.score,
      level: state.level,
      questionsCorrect: state.questionsCorrect,
      foodEaten: state.foodEaten,
    };
    const pos = saveScore(entry);
    setLbPosition(pos);

    // Obtener el id de la entrada guardada para resaltarla en el leaderboard
    const board = getLeaderboard();
    const saved = board.find(
      (e) => e.name === playerName && e.score === state.score
    );
    if (saved) setSavedEntryId(saved.id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accuracy =
    state.questionsAnswered > 0
      ? Math.round((state.questionsCorrect / state.questionsAnswered) * 100)
      : 0;

  const getRankLabel = (pos) => {
    if (!pos || pos < 1) return null;
    if (pos === 1) return "🥇 ¡1er lugar!";
    if (pos === 2) return "🥈 2do lugar";
    if (pos === 3) return "🥉 3er lugar";
    if (pos <= 10) return `#${pos} en el ranking`;
    return null;
  };

  const rankLabel = getRankLabel(lbPosition);

  return (
    <div className="gameover-screen">
      <div className="gameover-content">
        {/* Título */}
        <div className="gameover-header">
          <div className="gameover-icon">💀</div>
          <h1 className="gameover-title">Game Over</h1>
          <p className="gameover-name">{playerName}</p>
        </div>

        {/* Posición en ranking */}
        {rankLabel && (
          <div className="gameover-rank">
            <span className="rank-badge">{rankLabel}</span>
          </div>
        )}

        {/* Stats finales */}
        <div className="gameover-stats">
          <div className="go-stat">
            <span className="go-stat-icon">⭐</span>
            <div>
              <span className="go-stat-label">Puntuación Final</span>
              <span className="go-stat-value score-val">
                {state.score.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="go-stat">
            <span className="go-stat-icon">🏅</span>
            <div>
              <span className="go-stat-label">Nivel Alcanzado</span>
              <span className="go-stat-value">{state.level}</span>
            </div>
          </div>
          <div className="go-stat">
            <span className="go-stat-icon">🍎</span>
            <div>
              <span className="go-stat-label">Comidas</span>
              <span className="go-stat-value">{state.foodEaten}</span>
            </div>
          </div>
          <div className="go-stat">
            <span className="go-stat-icon">🧠</span>
            <div>
              <span className="go-stat-label">Preguntas</span>
              <span className="go-stat-value">{state.questionsAnswered}</span>
            </div>
          </div>
          <div className="go-stat">
            <span className="go-stat-icon">✅</span>
            <div>
              <span className="go-stat-label">Correctas</span>
              <span className="go-stat-value correct-count">
                {state.questionsCorrect}
              </span>
            </div>
          </div>
          <div className="go-stat">
            <span className="go-stat-icon">🎯</span>
            <div>
              <span className="go-stat-label">Precisión</span>
              <span className="go-stat-value">{accuracy}%</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="gameover-actions">
          <button id="go-restart-btn" className="btn btn-primary" onClick={onRestart}>
            🔄 Jugar de nuevo
          </button>
          <button
            id="go-lb-btn"
            className="btn btn-secondary"
            onClick={() => setShowLb(true)}
          >
            🏆 Ver Leaderboard
          </button>
          <button id="go-menu-btn" className="btn btn-ghost" onClick={onMenu}>
            🏠 Menú principal
          </button>
        </div>
      </div>

      {showLb && (
        <Leaderboard
          onClose={() => setShowLb(false)}
          highlightId={savedEntryId}
        />
      )}
    </div>
  );
}
