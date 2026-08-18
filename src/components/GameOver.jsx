/**
 * @file GameOver.jsx
 * @description Pantalla de Game Over con stats finales, modo de juego jugado
 * y acceso al leaderboard del modo correspondiente.
 */

import { useEffect, useState } from "react";
import { saveScore, getLeaderboard } from "../utils/leaderboard";
import Leaderboard from "./Leaderboard";

export default function GameOver({ state, playerName, onRestart, onMenu }) {
  const [lbPosition, setLbPosition] = useState(null);
  const [savedEntryId, setSavedEntryId] = useState(null);
  const [showLb, setShowLb] = useState(false);

  const difficulty = state.difficulty || "easy";
  const isHard = difficulty === "hard";

  useEffect(() => {
    const entry = {
      name: playerName,
      score: state.score,
      level: state.level,
      questionsCorrect: state.questionsCorrect,
      foodEaten: state.foodEaten,
    };

    saveScore(entry, difficulty).then((pos) => {
      setLbPosition(pos);
    });

    // Obtener id de la entrada guardada para resaltarla
    getLeaderboard(difficulty).then((board) => {
      const saved = board.find(
        (e) => e.name === playerName && e.score === state.score
      );
      if (saved) setSavedEntryId(saved.id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accuracy = state.questionsAnswered > 0
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

  return (
    <div className={`gameover-screen ${isHard ? "gameover-hard" : ""}`}>
      <div className="gameover-content">

        {/* Header */}
        <div className="gameover-header">
          <div className="gameover-icon">{isHard ? "💀🔥" : "💀"}</div>
          <h1 className={`gameover-title ${isHard ? "gameover-title-hard" : ""}`}>
            Game Over
          </h1>
          <p className="gameover-name">{playerName}</p>
          <span className={`gameover-mode-badge ${isHard ? "mode-hard" : "mode-easy"}`}>
            {isHard ? "🔴 Modo Difícil" : "🟢 Modo Fácil"}
          </span>
        </div>

        {/* Posición en ranking */}
        {getRankLabel(lbPosition) && (
          <div className="gameover-rank">
            <span className="rank-badge">{getRankLabel(lbPosition)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="gameover-stats">
          {[
            { icon: "⭐", label: "Puntuación", value: state.score.toLocaleString(), cls: isHard ? "" : "score-val" },
            { icon: "🏅", label: "Nivel", value: state.level },
            { icon: "🍎", label: "Comidas", value: state.foodEaten },
            { icon: "🧠", label: "Preguntas", value: state.questionsAnswered },
            { icon: "✅", label: "Correctas", value: state.questionsCorrect, cls: "correct-count" },
            { icon: "🎯", label: "Precisión", value: `${accuracy}%` },
          ].map(({ icon, label, value, cls }) => (
            <div className="go-stat" key={label}>
              <span className="go-stat-icon">{icon}</span>
              <div>
                <span className="go-stat-label">{label}</span>
                <span className={`go-stat-value ${cls || ""}`}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="gameover-actions">
          <button
            id="go-restart-btn"
            className={`btn ${isHard ? "btn-danger" : "btn-primary"}`}
            onClick={onRestart}
          >
            🔄 Jugar de nuevo
          </button>
          <button id="go-lb-btn" className="btn btn-secondary" onClick={() => setShowLb(true)}>
            🏆 Ver Leaderboard {isHard ? "Difícil" : "Fácil"}
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
          initialMode={difficulty}
        />
      )}
    </div>
  );
}
