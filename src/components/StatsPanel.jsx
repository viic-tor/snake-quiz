/**
 * @file StatsPanel.jsx
 * @description Panel lateral de estadísticas en tiempo real.
 * Adapta colores y textos según la dificultad.
 */

import { Star, Heart, Medal, Apple, Brain, Zap, Gem, CheckCircle, XCircle, BarChart2, Coins } from "lucide-react";
import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";
import PowerupIcon from "./PowerupIcon";
import MissionHUD from "./MissionHUD";

function ProgressBar({ value, max, color = "#00ff88" }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="stat-progress-bg">
      <div className="stat-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function StatsPanel({ state }) {
  const {
    score, lives, level, foodEaten,
    questionsAnswered, questionsCorrect,
    speed, consecutiveCorrect, difficulty,
    sessionCoins,
  } = state;

  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  const isHard = difficulty === "hard";
  const accentColor = cfg.color.accent;

  const wrongAnswers = questionsAnswered - questionsCorrect;
  const nextBonusAt = Math.ceil((consecutiveCorrect + 1) / cfg.bonusLifeAt) * cfg.bonusLifeAt;
  const toNextBonus = nextBonusAt - (consecutiveCorrect % cfg.bonusLifeAt || cfg.bonusLifeAt);
  const toNextSpeed = 5 - (questionsAnswered % 5) || 5;
  const speedLevel = Math.round(((cfg.initialSpeed - speed) / (cfg.initialSpeed - cfg.minSpeed)) * 100);
  const nextQuizIn = cfg.quizEvery - (foodEaten % cfg.quizEvery) || cfg.quizEvery;

  return (
    <aside className={`stats-panel ${isHard ? "stats-panel-hard" : ""}`} aria-label="Panel de estadísticas">
      {/* Modo actual */}
      <div className={`stats-mode-badge ${isHard ? "mode-hard" : "mode-easy"}`}>
        {isHard ? "🔴 DIFÍCIL — ×2 pts" : "🟢 FÁCIL"}
      </div>

      <h3 className="stats-title"><span className="icon-wrap" style={{marginRight: 4}}><BarChart2 size={18} /></span> Stats</h3>

      {/* Score */}
      <div className="stat-item">
        <span className="stat-icon"><Star size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Puntuación</span>
          <span className="stat-value" style={{ color: isHard ? "#ff6b35" : "#ffd700" }}>
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Monedas de esta partida */}
      <div className="stat-item">
        <span className="stat-icon"><Coins size={16} color="#eab308" /></span>
        <div className="stat-content">
          <span className="stat-label">Monedas (+{sessionCoins})</span>
          <span className="stat-value" style={{ color: "#eab308" }}>
            {sessionCoins}
          </span>
        </div>
      </div>

      {/* Vidas */}
      <div className="stat-item">
        <span className="stat-icon"><Heart size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Vidas</span>
          <div className="lives-hearts">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`heart ${i < lives ? "heart-active" : "heart-empty"}`}>
                <Heart size={14} fill={i < lives ? "currentColor" : "none"} />
              </span>
            ))}
          </div>
          {isHard && <span className="stat-hint danger-hint">⚠️ Paredes quitan vida</span>}
        </div>
      </div>

      {/* Nivel */}
      <div className="stat-item">
        <span className="stat-icon"><Medal size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Nivel</span>
          <span className="stat-value">{level}</span>
        </div>
      </div>

      {/* Comidas */}
      <div className="stat-item">
        <span className="stat-icon"><Apple size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Comidas — {foodEaten}</span>
          <span className="stat-hint">Quiz en {nextQuizIn} comida{nextQuizIn !== 1 ? "s" : ""}</span>
          <ProgressBar
            value={cfg.quizEvery - nextQuizIn}
            max={cfg.quizEvery}
            color="#ff4d6d"
          />
        </div>
      </div>

      <div className="stat-divider" />

      <div className="stat-divider" />

      {/* Velocidad */}
      <div className="stat-item">
        <span className="stat-icon"><Zap size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Velocidad</span>
          <ProgressBar value={speedLevel} max={100} color="#ffd700" />
          <span className="stat-hint">Sube en {toNextSpeed} pregunta{toNextSpeed !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Misión Activa */}
      {state.activeMission && (
        <div style={{ marginBottom: '8px' }}>
          <MissionHUD mission={state.activeMission} />
        </div>
      )}

      <div className="stat-divider" />



      {/* Controles */}
      <div className="controls-hint">
        <p>🎮 <b>WASD</b> o <b>↑↓←→</b></p>
        <p>⏸ <b>P</b> o <b>Espacio</b></p>
      </div>
    </aside>
  );
}
