/**
 * @file StatsPanel.jsx
 * @description Panel lateral con las estadísticas en tiempo real del juego.
 * Muestra: score, vidas, nivel, velocidad, comidas, preguntas correctas/incorrectas.
 */

const ICONS = {
  score: "⭐",
  lives: "❤️",
  level: "🏅",
  food: "🍎",
  correct: "✅",
  questions: "🧠",
  speed: "⚡",
};

/** Barra de progreso estilizada */
function ProgressBar({ value, max, color = "#00ff88", label }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="stat-progress-wrap">
      {label && <span className="stat-progress-label">{label}</span>}
      <div className="stat-progress-bg">
        <div
          className="stat-progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="stat-progress-val">{value}/{max}</span>
    </div>
  );
}

export default function StatsPanel({ state }) {
  const {
    score,
    lives,
    level,
    foodEaten,
    questionsAnswered,
    questionsCorrect,
    speed,
    consecutiveCorrect,
  } = state;

  const wrongAnswers = questionsAnswered - questionsCorrect;
  // Próxima vida bonus en múltiplo de 10 correctas (si no pierde vidas)
  const nextBonusAt = Math.ceil((consecutiveCorrect + 1) / 10) * 10;
  const toNextBonus = nextBonusAt - consecutiveCorrect;
  // Preguntas hasta siguiente aumento de velocidad
  const nextSpeedAt = Math.ceil((questionsAnswered + 1) / 5) * 5;
  const toNextSpeed = nextSpeedAt - questionsAnswered;

  // Velocidad normalizada: 150ms = lento, 60ms = muy rápido
  const speedLevel = Math.round(((150 - speed) / (150 - 60)) * 100);

  return (
    <aside className="stats-panel" aria-label="Panel de estadísticas">
      <h3 className="stats-title">📊 Stats</h3>

      <div className="stat-item">
        <span className="stat-icon">{ICONS.score}</span>
        <div className="stat-content">
          <span className="stat-label">Puntuación</span>
          <span className="stat-value score-val">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Vidas */}
      <div className="stat-item">
        <span className="stat-icon">{ICONS.lives}</span>
        <div className="stat-content">
          <span className="stat-label">Vidas</span>
          <div className="lives-hearts">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`heart ${i < lives ? "heart-active" : "heart-empty"}`}
              >
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="stat-item">
        <span className="stat-icon">{ICONS.level}</span>
        <div className="stat-content">
          <span className="stat-label">Nivel</span>
          <span className="stat-value">{level}</span>
        </div>
      </div>

      <div className="stat-item">
        <span className="stat-icon">{ICONS.food}</span>
        <div className="stat-content">
          <span className="stat-label">Comidas</span>
          <span className="stat-value">{foodEaten}</span>
          <ProgressBar value={foodEaten % 3 || (foodEaten > 0 ? 3 : 0)} max={3} color="#ff4d6d" label="Próximo quiz" />
        </div>
      </div>

      <div className="stat-divider" />

      {/* Preguntas */}
      <div className="stat-item">
        <span className="stat-icon">{ICONS.questions}</span>
        <div className="stat-content">
          <span className="stat-label">Preguntas</span>
          <div className="quiz-stat-row">
            <span className="correct-count">✅ {questionsCorrect}</span>
            <span className="wrong-count">❌ {wrongAnswers}</span>
          </div>
        </div>
      </div>

      {questionsAnswered > 0 && (
        <div className="accuracy-bar">
          <span className="stat-label">Precisión</span>
          <ProgressBar
            value={questionsCorrect}
            max={questionsAnswered}
            color="#00ff88"
            label={`${Math.round((questionsCorrect / questionsAnswered) * 100)}%`}
          />
        </div>
      )}

      <div className="stat-divider" />

      {/* Velocidad */}
      <div className="stat-item">
        <span className="stat-icon">{ICONS.speed}</span>
        <div className="stat-content">
          <span className="stat-label">Velocidad</span>
          <ProgressBar value={speedLevel} max={100} color="#ffd700" />
          <span className="stat-hint">Sube en {toNextSpeed} pregunta{toNextSpeed !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Bonus vida */}
      <div className="stat-item bonus-item">
        <span className="stat-icon">💎</span>
        <div className="stat-content">
          <span className="stat-label">Bonus ❤️</span>
          <span className="stat-hint">{toNextBonus} correctas seguidas</span>
          <ProgressBar
            value={consecutiveCorrect % 10}
            max={10}
            color="#a855f7"
          />
        </div>
      </div>

      {/* Controles */}
      <div className="stat-divider" />
      <div className="controls-hint">
        <p>🎮 <b>WASD</b> o <b>↑↓←→</b></p>
        <p>⏸ <b>P</b> o <b>Espacio</b></p>
      </div>
    </aside>
  );
}
