/**
 * @file RulesModal.jsx
 * @description Modal con las reglas completas del juego Snake Quiz.
 * Incluye todas las mecánicas documentadas con iconos y ejemplos.
 */

export default function RulesModal({ onClose }) {
  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Reglas del juego">
      <div className="rules-modal">
        <div className="rules-header">
          <h2 className="rules-title">📋 Reglas del Juego</h2>
          <button
            id="rules-close-btn"
            className="lb-close-btn"
            onClick={onClose}
            aria-label="Cerrar reglas"
          >
            ✕
          </button>
        </div>

        <div className="rules-content">

          {/* Objetivo */}
          <section className="rules-section">
            <h3>🎯 Objetivo</h3>
            <p>
              Guía a la serpiente para comer la mayor cantidad de comidas posible,
              respondiendo correctamente las preguntas de quiz para acumular puntos
              y mantenerte vivo.
            </p>
          </section>

          {/* Controles */}
          <section className="rules-section">
            <h3>🎮 Controles</h3>
            <div className="rules-grid">
              <div className="rule-card">
                <span className="rule-icon">⬆️⬇️⬅️➡️</span>
                <span>Teclas de dirección</span>
              </div>
              <div className="rule-card">
                <span className="rule-icon">WASD</span>
                <span>Teclas alternativas</span>
              </div>
              <div className="rule-card">
                <span className="rule-icon">P / Espacio</span>
                <span>Pausar / Reanudar</span>
              </div>
            </div>
          </section>

          {/* Puntuación */}
          <section className="rules-section">
            <h3>⭐ Puntuación</h3>
            <ul className="rules-list">
              <li>
                <span className="rule-tag food">🍎 Comer</span>
                <span><b>10 + (Nivel × 5)</b> puntos por comida</span>
              </li>
              <li>
                <span className="rule-tag correct">✅ Quiz correcto</span>
                <span><b>150 + (Nivel × 25)</b> puntos bonus</span>
              </li>
              <li>
                <span className="rule-tag wrong">❌ Quiz incorrecto</span>
                <span>Sin puntos — pierdes <b>1 vida</b></span>
              </li>
            </ul>
          </section>

          {/* Vidas */}
          <section className="rules-section">
            <h3>❤️ Sistema de Vidas</h3>
            <ul className="rules-list">
              <li>Comienzas con <b>3 vidas</b> (máximo 5).</li>
              <li>
                Perder vida: <b>responder incorrectamente</b> o{" "}
                <b>colisionar con tu propio cuerpo</b>.
              </li>
              <li>
                <span className="rule-highlight">
                  💎 Bonus: cada <b>10 preguntas correctas consecutivas</b> sin
                  perder ninguna vida → ganas <b>+1 vida</b>.
                </span>
              </li>
              <li>Al llegar a 0 vidas el juego termina.</li>
            </ul>
          </section>

          {/* Quiz */}
          <section className="rules-section">
            <h3>🧠 Sistema de Quiz</h3>
            <ul className="rules-list">
              <li>
                Cada <b>3 comidas</b> aparece una pregunta de opción múltiple.
              </li>
              <li>
                Tienes <b>15 segundos</b> para responder. Si se agota el
                tiempo, cuenta como respuesta incorrecta.
              </li>
              <li>
                Temas: <b>Teoría de Sistemas</b> 🖥️ e{" "}
                <b>Introducción a Programación</b> 💻.
              </li>
              <li>Las preguntas no se repiten hasta agotar el banco.</li>
            </ul>
          </section>

          {/* Velocidad */}
          <section className="rules-section">
            <h3>⚡ Velocidad</h3>
            <ul className="rules-list">
              <li>
                La velocidad de la serpiente <b>aumenta cada 5 preguntas
                contestadas</b> (correctas o incorrectas).
              </li>
              <li>
                La velocidad máxima es el <b>Nivel Extremo</b> — ¡cuidado!
              </li>
            </ul>
          </section>

          {/* Niveles */}
          <section className="rules-section">
            <h3>🏅 Niveles</h3>
            <ul className="rules-list">
              <li>
                El nivel sube cada <b>10 comidas</b>.
              </li>
              <li>
                A mayor nivel → más puntos por comida y por quiz correcto.
              </li>
            </ul>
          </section>

          {/* Leaderboard */}
          <section className="rules-section">
            <h3>🏆 Leaderboard</h3>
            <ul className="rules-list">
              <li>Top <b>10</b> puntuaciones guardadas localmente.</li>
              <li>
                Al terminar la partida, tu puntuación se guarda automáticamente
                si es suficientemente alta.
              </li>
              <li>Puedes ver el ranking desde el menú principal.</li>
            </ul>
          </section>

        </div>

        <div className="rules-footer">
          <button id="rules-play-btn" className="btn btn-primary" onClick={onClose}>
            ¡Entendido, a jugar! 🐍
          </button>
        </div>
      </div>
    </div>
  );
}
