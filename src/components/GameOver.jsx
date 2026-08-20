/**
 * @file GameOver.jsx
 * @description Pantalla de Game Over con stats finales, modo de juego jugado
 * y acceso al leaderboard del modo correspondiente.
 *
 * REGLA LEADERBOARD:
 *   - Solo se guarda el score cuando se juega con el banco de preguntas BASE.
 *   - Si el jugador importó preguntas personalizadas (Excel), la partida NO
 *     cuenta para el ranking. Esto garantiza la equidad de la competencia.
 */

import { useEffect, useState } from "react";
import { saveScore, getLeaderboard } from "../utils/leaderboard";
import { hasCustomQuestions, getCustomMeta } from "../utils/questionStore";
import { updatePlayerStatsAsync } from "../utils/playerStats";
import Leaderboard from "./Leaderboard";
import { Medal, Skull, Flame, Circle, FolderOpen, Star, Apple, Brain, CheckCircle, Target, RefreshCw, Crown, Home } from "lucide-react";

export default function GameOver({ state, playerName, onRestart, onMenu }) {
  const [lbPosition, setLbPosition]   = useState(null);
  const [savedEntryId, setSavedEntryId] = useState(null);
  const [showLb, setShowLb]           = useState(false);

  const baseDifficulty = state.difficulty || "easy";
  const isHard         = baseDifficulty === "hard";
  const difficulty     = isHard ? `hard_${state.answerCount}` : "easy";

  // ── ¿Partida con banco personalizado? ────────────────────────────────────
  const usingCustom = hasCustomQuestions();
  const customMeta  = usingCustom ? getCustomMeta() : null;

  useEffect(() => {
    if (usingCustom) return; // ← No guardar si hay preguntas personalizadas

    const entry = {
      name:             playerName,
      score:            state.score,
      level:            state.level,
      questionsCorrect: state.questionsCorrect,
      foodEaten:        state.foodEaten,
      maxStreak:        state.maxStreak,
    };

    // Actualizar estadísticas personales del jugador (ahora se guarda en la nube asíncronamente)
    updatePlayerStatsAsync({
      playerName:        playerName,
      mode:              difficulty,
      score:             state.score,
      questionsCorrect:  state.questionsCorrect,
      questionsAnswered: state.questionsAnswered,
      level:             state.level,
      maxStreak:         state.maxStreak,
    });

    saveScore(entry, difficulty).then((pos) => {
      setLbPosition(pos);
    });

    // Obtener id de la entrada guardada para resaltarla en el leaderboard
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
    if (pos === 1) return <><span className="icon-wrap icon-shine"><Medal color="#ffd700" fill="#ffd700" size={16} /></span> ¡1er lugar!</>;
    if (pos === 2) return <><span className="icon-wrap"><Medal color="#c0c0c0" fill="#c0c0c0" size={16} /></span> 2do lugar</>;
    if (pos === 3) return <><span className="icon-wrap"><Medal color="#cd7f32" fill="#cd7f32" size={16} /></span> 3er lugar</>;
    return `#${pos} en el ranking`;
  };

  return (
    <div className={`gameover-screen ${isHard ? "gameover-hard" : ""}`}>
      <div className="gameover-content">

        {/* Header */}
        <div className="gameover-header">
          <div className="gameover-icon">{isHard ? <><span className="icon-wrap icon-flicker"><Skull /></span><span className="icon-wrap icon-flicker"><Flame /></span></> : <span className="icon-wrap icon-flicker"><Skull /></span>}</div>
          <h1 className={`gameover-title ${isHard ? "gameover-title-hard" : ""}`}>
            Game Over
          </h1>
          <p className="gameover-name">{playerName}</p>
          <span className={`gameover-mode-badge ${isHard ? "mode-hard" : "mode-easy"}`}>
            {isHard ? <><span className="icon-wrap"><Circle fill="currentColor" size={12}/></span> Modo Difícil</> : <><span className="icon-wrap"><Circle fill="currentColor" size={12}/></span> Modo Fácil</>}
          </span>
        </div>

        {/* Aviso: partida con preguntas personalizadas — no cuenta para ranking */}
        {usingCustom && (
          <div className="gameover-custom-notice">
            <span className="custom-notice-icon icon-wrap"><FolderOpen /></span>
            <div>
              <p className="custom-notice-title">Partida con banco personalizado</p>
              <p className="custom-notice-sub">
                «{customMeta?.name ?? "Personalizado"}» · Esta partida{" "}
                <strong>no cuenta para el leaderboard</strong> para mantener
                la equidad del ranking.
              </p>
            </div>
          </div>
        )}

        {/* Posición en ranking (solo si jugó con banco base) */}
        {!usingCustom && getRankLabel(lbPosition) && (
          <div className="gameover-rank">
            <span className="rank-badge">{getRankLabel(lbPosition)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="gameover-stats">
          {[
            { icon: <Star className="icon-shine" />, label: "Puntuación", value: state.score.toLocaleString(), cls: isHard ? "" : "score-val" },
            { icon: <Medal className="icon-shine" />, label: "Nivel",      value: state.level },
            { icon: <Apple className="icon-bounce-in" />, label: "Comidas",    value: state.foodEaten },
            { icon: <Brain className="icon-float" />, label: "Preguntas",  value: state.questionsAnswered },
            { icon: <CheckCircle className="icon-pulse" />, label: "Correctas",  value: state.questionsCorrect, cls: "correct-count" },
            { icon: <Target />, label: "Precisión",  value: `${accuracy}%` },
          ].map(({ icon, label, value, cls }) => (
            <div className="go-stat" key={label}>
              <span className="go-stat-icon icon-wrap">{icon}</span>
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
            <span className="icon-wrap icon-rotate-hover" style={{marginRight: 4}}><RefreshCw size={16}/></span> Jugar de nuevo
          </button>

          {/* Solo mostrar botón de leaderboard si jugó con banco base */}
          {!usingCustom && (
            <button id="go-lb-btn" className="btn btn-secondary" onClick={() => setShowLb(true)}>
              <span className="icon-wrap icon-shine" style={{marginRight: 4}}><Crown size={16}/></span> Ver Leaderboard {isHard ? "Difícil" : "Fácil"}
            </button>
          )}

          <button id="go-menu-btn" className="btn btn-ghost" onClick={onMenu}>
            <span className="icon-wrap" style={{marginRight: 4}}><Home size={16}/></span> Menú principal
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
