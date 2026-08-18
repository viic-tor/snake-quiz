/**
 * @file RulesModal.jsx
 * @description Modal de reglas. Muestra reglas específicas del modo seleccionado.
 */

import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";

export default function RulesModal({ onClose, difficulty = "easy" }) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  const isHard = difficulty === "hard";

  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Reglas del juego">
      <div className="rules-modal">
        <div className="rules-header">
          <h2 className="rules-title">
            📋 Reglas — {isHard ? "🔴 Modo Difícil" : "🟢 Modo Fácil"}
          </h2>
          <button id="rules-close-btn" className="lb-close-btn" onClick={onClose} aria-label="Cerrar reglas">✕</button>
        </div>

        <div className="rules-content">

          <section className="rules-section">
            <h3>🎯 Objetivo</h3>
            <p>
              Guía a la serpiente para comer la mayor cantidad de comidas posible
              respondiendo correctamente las preguntas de quiz. Acumula puntos y
              mantente con vida.
            </p>
          </section>

          <section className="rules-section">
            <h3>🎮 Controles</h3>
            <div className="rules-grid">
              <div className="rule-card"><span>⬆️⬇️⬅️➡️</span><span>Dirección</span></div>
              <div className="rule-card"><span>WASD</span><span>Alternativo</span></div>
              <div className="rule-card"><span>P / Espacio</span><span>Pausar</span></div>
            </div>
          </section>

          <section className="rules-section">
            <h3>⭐ Puntuación</h3>
            <ul className="rules-list">
              <li>
                <span className="rule-tag food">🍎 Comer</span>
                <span><b>{isHard ? "20 + (Nivel × 10)" : "10 + (Nivel × 5)"}</b> puntos {isHard && <span className="diff-x2">×2</span>}</span>
              </li>
              <li>
                <span className="rule-tag correct">✅ Quiz correcto</span>
                <span><b>{isHard ? "300 + (Nivel × 50)" : "150 + (Nivel × 25)"}</b> pts bonus {isHard && <span className="diff-x2">×2</span>}</span>
              </li>
              <li>
                <span className="rule-tag wrong">❌ Quiz incorrecto</span>
                <span>Sin puntos + <b>−1 vida</b></span>
              </li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>❤️ Sistema de Vidas</h3>
            <ul className="rules-list">
              <li>Comienzas con <b>3 vidas</b> (máximo 5).</li>
              <li>Pierdes vida: responder incorrectamente o colisión propia.</li>
              {isHard && (
                <li>
                  <span className="rule-highlight-danger">
                    💀 <b>Modo Difícil</b>: tocar las paredes quita <b>1 vida</b>. ¡No hay wrapping!
                  </span>
                </li>
              )}
              <li>
                <span className="rule-highlight">
                  💎 Bonus: cada <b>{cfg.bonusLifeAt} correctas consecutivas</b> sin perder vidas → <b>+1 vida</b>
                </span>
              </li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>🧠 Quiz</h3>
            <ul className="rules-list">
              <li>Aparece cada <b>{cfg.quizEvery} comidas</b>.</li>
              <li>Tiempo para responder: <b>{cfg.quizTimeLimit} segundos</b>.</li>
              <li>Tiempo agotado = respuesta incorrecta.</li>
              <li>Temas: <b>Teoría de Sistemas</b> 🖥️ + <b>Programación</b> 💻.</li>
              {isHard && (
                <li>
                  <span className="rule-highlight-danger">
                    🔴 <b>Modo Difícil</b>: {cfg.quizEvery} comidas entre quizzes, {cfg.quizTimeLimit}s por pregunta — ¡más frecuente y más rápido!
                  </span>
                </li>
              )}
            </ul>
          </section>

          <section className="rules-section">
            <h3>⚡ Velocidad</h3>
            <ul className="rules-list">
              <li>Aumenta cada <b>5 preguntas contestadas</b>.</li>
              <li>Velocidad inicial: <b>{cfg.initialSpeed}ms</b> → mínimo <b>{cfg.minSpeed}ms</b>.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>🏅 Niveles</h3>
            <ul className="rules-list">
              <li>Sube cada <b>10 comidas</b>.</li>
              <li>Mayor nivel → más puntos por comida y por quiz.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>🏆 Leaderboard</h3>
            <ul className="rules-list">
              <li>Top <b>10</b> separado por modo (Fácil / Difícil).</li>
              <li>Score guardado automáticamente al terminar.</li>
              {isHard && <li>Los scores de Difícil <b>no compiten</b> con los de Fácil.</li>}
            </ul>
          </section>

        </div>

        <div className="rules-footer">
          <button id="rules-play-btn" className={`btn ${isHard ? "btn-danger" : "btn-primary"}`} onClick={onClose}>
            ¡Entendido, a jugar! {isHard ? "🔥" : "🐍"}
          </button>
        </div>
      </div>
    </div>
  );
}
