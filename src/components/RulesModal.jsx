/**
 * @file RulesModal.jsx
 * @description Modal de reglas. Muestra reglas específicas del modo seleccionado.
 */

import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";
import { BookOpen, Circle, X, Target, Gamepad2, Move, Star, Apple, CheckCircle, XCircle, Heart, Skull, Gem, Brain, Monitor, Terminal, Zap, Medal, Crown, Flame } from "lucide-react";

export default function RulesModal({ onClose, difficulty = "easy", answerCount = 4 }) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  const isHard = difficulty === "hard";

  const getThresholdText = () => {
    if (!isHard) return "300 y 1200pts";
    if (answerCount === 4) return "400 y 1500pts";
    if (answerCount === 5) return "500 y 1800pts";
    return "600 y 2200pts";
  };

  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Reglas del juego">
      <div className="rules-modal">
        <div className="rules-header">
          <h2 className="rules-title">
            <span className="icon-wrap" style={{marginRight: 4}}><BookOpen /></span> Reglas — {isHard ? <><span className="icon-wrap"><Circle fill="#ff4757" color="#ff4757" size={16} /></span> Modo Difícil</> : <><span className="icon-wrap"><Circle fill="#00ff88" color="#00ff88" size={16} /></span> Modo Fácil</>}
          </h2>
          <button id="rules-close-btn" className="lb-close-btn" onClick={onClose} aria-label="Cerrar reglas"><X size={20} /></button>
        </div>

        <div className="rules-content">

          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Target /></span> Objetivo</h3>
            <p>
              Guía a la serpiente para comer la mayor cantidad de comidas posible
              respondiendo correctamente las preguntas de quiz. Acumula puntos y
              mantente con vida.
            </p>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Gamepad2 /></span> Controles</h3>
            <div className="rules-grid">
              <div className="rule-card"><span><span className="icon-wrap"><Move size={18} /></span></span><span>Dirección</span></div>
              <div className="rule-card"><span>WASD</span><span>Alternativo</span></div>
              <div className="rule-card"><span>P / Espacio</span><span>Pausar</span></div>
            </div>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap icon-shine" style={{marginRight: 4}}><Star /></span> Puntuación</h3>
            <ul className="rules-list">
              <li>
                <span className="rule-tag food"><span className="icon-wrap"><Apple size={14} /></span> Comer</span>
                <span><b>{isHard ? "10 + (Nivel × 5)" : "20 + (Nivel × 10)"}</b> puntos {isHard && <span className="diff-x2">×2</span>}</span>
              </li>
              <li>
                <span className="rule-tag correct"><span className="icon-wrap"><CheckCircle size={14} /></span> Quiz correcto</span>
                <span><b>{isHard ? "100 + (Nivel × 25)" : "200 + (Nivel × 50)"}</b> pts bonus {isHard && <span className="diff-x2">×2</span>}</span>
              </li>
              <li>
                <span className="rule-tag wrong"><span className="icon-wrap"><XCircle size={14} /></span> Quiz incorrecto</span>
                <span>Sin puntos + <b>−1 vida</b></span>
              </li>
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap icon-pulse" style={{marginRight: 4}}><Zap /></span> Modificadores</h3>
            <ul className="rules-list">
              <li>Acumula entre <b>{getThresholdText()}</b> para que aparezcan poderes en el tablero.</li>
              <li>Tienen efectos temporales, pasivos, o instantáneos, dependiendo de su rareza.</li>
              <li>¡Consulta el catálogo de <b>Modificadores</b> en el menú principal para conocerlos todos!</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap icon-pulse" style={{marginRight: 4}}><Heart fill="currentColor" /></span> Sistema de Vidas</h3>
            <ul className="rules-list">
              <li>Comienzas con <b>3 vidas</b> (máximo 5).</li>
              <li>Pierdes vida: responder incorrectamente o colisión propia.</li>
              {isHard && (
                <li>
                  <span className="rule-highlight-danger">
                    <span className="icon-wrap"><Skull size={14} /></span> <b>Modo Difícil</b>: tocar las paredes quita <b>1 vida</b>. ¡No hay wrapping!
                  </span>
                </li>
              )}
              <li>
                <span className="rule-highlight">
                  <span className="icon-wrap icon-shine"><Gem size={14} /></span> Bonus: cada <b>{cfg.bonusLifeAt} correctas consecutivas</b> sin perder vidas → <b>+1 vida</b>
                </span>
              </li>
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Brain /></span> Quiz</h3>
            <ul className="rules-list">
              <li>Aparece cada <b>{cfg.quizEvery} comidas</b>.</li>
              <li>Tiempo para responder: <b>{cfg.quizTimeLimit} segundos</b>.</li>
              <li>Tiempo agotado = respuesta incorrecta.</li>
              <li>Temas: <b>Teoría de Sistemas</b> <span className="icon-wrap"><Monitor size={14} /></span> + <b>Programación</b> <span className="icon-wrap"><Terminal size={14} /></span>.</li>
              {isHard && (
                <li>
                  <span className="rule-highlight-danger">
                    <span className="icon-wrap"><Circle fill="currentColor" size={14} /></span> <b>Modo Difícil</b>: {cfg.quizEvery} comidas entre quizzes, {cfg.quizTimeLimit}s por pregunta — ¡más frecuente y más rápido!
                  </span>
                </li>
              )}
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap icon-flicker" style={{marginRight: 4}}><Zap /></span> Velocidad</h3>
            <ul className="rules-list">
              <li>Aumenta cada <b>5 preguntas contestadas</b>.</li>
              <li>Velocidad inicial: <b>{cfg.initialSpeed}ms</b> → mínimo <b>{cfg.minSpeed}ms</b>.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Medal /></span> Niveles</h3>
            <ul className="rules-list">
              <li>Sube cada <b>10 comidas</b>.</li>
              <li>Mayor nivel → más puntos por comida y por quiz.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap icon-shine" style={{marginRight: 4}}><Crown /></span> Leaderboard</h3>
            <ul className="rules-list">
              <li>Top <b>10</b> separado por modo (Fácil / Difícil).</li>
              <li>Score guardado automáticamente al terminar.</li>
              {isHard && <li>Los scores de Difícil <b>no compiten</b> con los de Fácil.</li>}
            </ul>
          </section>

        </div>

        <div className="rules-footer">
          <button id="rules-play-btn" className={`btn ${isHard ? "btn-danger" : "btn-primary"}`} onClick={onClose}>
            ¡Entendido, a jugar! {isHard ? <span className="icon-wrap icon-flicker" style={{marginLeft: 4}}><Flame size={18} /></span> : <span className="icon-wrap icon-float" style={{marginLeft: 4}}><Gamepad2 size={18} /></span>}
          </button>
        </div>
      </div>
    </div>
  );
}
