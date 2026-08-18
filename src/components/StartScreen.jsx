/**
 * @file StartScreen.jsx
 * @description Pantalla de inicio con selector de dificultad (Fácil / Difícil),
 * formulario de nombre, botones de Reglas y Leaderboard.
 */

import { useState } from "react";
import Leaderboard from "./Leaderboard";
import RulesModal from "./RulesModal";
import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";

export default function StartScreen({ onStart }) {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [showLb, setShowLb] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("Por favor ingresa tu nombre."); return; }
    if (trimmed.length > 20) { setError("Máximo 20 caracteres."); return; }
    onStart(trimmed, difficulty);
  };

  const isHard = difficulty === "hard";

  return (
    <div className={`start-screen ${isHard ? "start-hard" : ""}`}>
      {/* Partículas */}
      <div className="start-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`particle particle-${i % 4}`} />
        ))}
      </div>

      <div className="start-content">
        {/* Logo */}
        <div className="start-logo" aria-label="Snake Quiz">
          <div className="snake-logo-icon">{isHard ? "🔥" : "🐍"}</div>
          <h1 className="start-title">
            Snake<span className={`title-accent ${isHard ? "title-hard" : ""}`}>Quiz</span>
          </h1>
          <p className="start-subtitle">Sistemas · Programación · Estrategia</p>
        </div>

        {/* Selector de dificultad */}
        <div className="difficulty-selector" role="group" aria-label="Seleccionar dificultad">
          <p className="difficulty-label">Selecciona el modo de juego:</p>
          <div className="difficulty-btns">
            <button
              id="mode-easy-btn"
              type="button"
              className={`diff-btn ${difficulty === "easy" ? "diff-active diff-easy-active" : ""}`}
              onClick={() => setDifficulty("easy")}
            >
              <span className="diff-icon">🟢</span>
              <span className="diff-name">Fácil</span>
              <span className="diff-desc">Paredes traspasables · Quiz c/3</span>
            </button>

            <button
              id="mode-hard-btn"
              type="button"
              className={`diff-btn ${difficulty === "hard" ? "diff-active diff-hard-active" : ""}`}
              onClick={() => setDifficulty("hard")}
            >
              <span className="diff-icon">🔴</span>
              <span className="diff-name">Difícil</span>
              <span className="diff-desc">Paredes mortales · Quiz c/2 · ×2 pts</span>
            </button>
          </div>

          {/* Detalles del modo seleccionado */}
          {isHard && (
            <div className="diff-warning" role="alert">
              ⚠️ <b>Modo Difícil</b>: las paredes quitan vida, quiz cada 2 comidas,
              10s por pregunta. ¡Los puntos valen el doble!
            </div>
          )}
        </div>

        {/* Formulario */}
        <form className="start-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="player-name" className="start-label">¿Cómo te llamas?</label>
          <input
            id="player-name"
            type="text"
            className={`start-input ${isHard ? "start-input-hard" : ""}`}
            placeholder="Ingresa tu nombre"
            value={name}
            maxLength={20}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            autoComplete="off"
          />
          {error && <p className="start-error" role="alert">{error}</p>}

          <button
            id="start-btn"
            type="submit"
            className={`btn ${isHard ? "btn-danger" : "btn-primary"}`}
          >
            {isHard ? "🔥 Jugar en Difícil" : "🎮 Jugar en Fácil"}
          </button>
        </form>

        {/* Botones secundarios */}
        <div className="start-secondary">
          <button id="show-rules-btn" className="btn btn-secondary" onClick={() => setShowRules(true)}>
            📋 Reglas
          </button>
          <button id="show-lb-btn" className="btn btn-secondary" onClick={() => setShowLb(true)}>
            🏆 Leaderboard
          </button>
        </div>

        {/* Features */}
        <div className="start-features">
          <div className="feature-card"><span>🧠</span><p>Quiz cada {DIFFICULTY_CONFIG[difficulty].quizEvery} comidas</p></div>
          <div className="feature-card"><span>❤️</span><p>3 vidas — bonus cada {DIFFICULTY_CONFIG[difficulty].bonusLifeAt} ✅</p></div>
          <div className="feature-card"><span>⚡</span><p>Velocidad creciente</p></div>
          <div className="feature-card"><span>{isHard ? "💀" : "🏆"}</span><p>{isHard ? "Paredes letales" : "Leaderboard global"}</p></div>
        </div>
      </div>

      {showLb && <Leaderboard onClose={() => setShowLb(false)} initialMode={difficulty} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} difficulty={difficulty} />}
    </div>
  );
}
