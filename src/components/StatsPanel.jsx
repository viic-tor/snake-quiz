/**
 * @file StatsPanel.jsx
 * @description Panel lateral de estadísticas en tiempo real.
 * Adapta colores y textos según la dificultad.
 */

import { Star, Heart, Medal, Apple, Brain, Zap, Gem, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";
import PowerupIcon from "./PowerupIcon";

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

      {/* Preguntas */}
      <div className="stat-item">
        <span className="stat-icon"><Brain size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Preguntas</span>
          <div className="quiz-stat-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px', fontWeight: 'bold' }}>
            <span className="correct-count" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00ff88' }}>
              <CheckCircle size={14} /> Bien {questionsCorrect}
            </span>
            <span style={{ opacity: 0.4, color: 'white', fontWeight: 'normal' }}>/</span>
            <span className="wrong-count" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4757' }}>
              <XCircle size={14} /> Mal {wrongAnswers}
            </span>
          </div>
        </div>
      </div>

      {questionsAnswered > 0 && (
        <div className="accuracy-bar">
          <span className="stat-label">
            Precisión {Math.round((questionsCorrect / questionsAnswered) * 100)}%
          </span>
          <ProgressBar value={questionsCorrect} max={questionsAnswered} color={accentColor} />
        </div>
      )}

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

      {/* Bonus vida */}
      <div className="stat-item bonus-item">
        <span className="stat-icon"><Gem size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Bonus ❤️ (cada {cfg.bonusLifeAt} aciertos)</span>
          <ProgressBar
            value={consecutiveCorrect % cfg.bonusLifeAt}
            max={cfg.bonusLifeAt}
            color="#a855f7"
          />
          <span className="stat-hint">{toNextBonus} correctas seguidas para +1 Vida</span>
        </div>
      </div>

      <div className="stat-divider" />

      {/* Power-ups */}
      <div className="stat-item powerups-container">
        <span className="stat-icon"><Zap size={16} /></span>
        <div className="stat-content">
          <span className="stat-label">Power-ups</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {state.passivePowerups?.map(p => (
              <div key={p.id} style={{ border: `1px solid ${p.color}`, padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', background: `${p.color}22` }}>
                <PowerupIcon iconId={p.iconId} size={14} color={p.color} />
                <span style={{ fontSize: '11px', color: p.color, fontWeight: 'bold' }}>{p.id === 'mythic_streak_saver' ? 'Escudo' : p.id === 'mythic_freeze' ? 'Congelar' : 'Rayos X'}</span>
              </div>
            ))}
            {state.activePowerups?.map(p => (
              <div key={p.id} style={{ border: `1px solid ${p.color}`, padding: '4px 8px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px', background: `${p.color}22`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1, position: 'relative' }}>
                   <PowerupIcon iconId={p.iconId} size={14} color={p.color} />
                   <span style={{ fontSize: '11px', color: 'white', fontWeight: 'bold' }}>{Math.ceil(p.remainingDuration / 1000)}s</span>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: p.color, width: `${(p.remainingDuration / p.duration) * 100}%` }} />
              </div>
            ))}
            {(!state.passivePowerups?.length && !state.activePowerups?.length) && (
              <span className="stat-hint" style={{ opacity: 0.5 }}>Ningún poder activo</span>
            )}
          </div>
        </div>
      </div>

      <div className="stat-divider" />

      {/* Controles */}
      <div className="controls-hint">
        <p>🎮 <b>WASD</b> o <b>↑↓←→</b></p>
        <p>⏸ <b>P</b> o <b>Espacio</b></p>
      </div>
    </aside>
  );
}
