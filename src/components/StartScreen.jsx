/**
 * @file StartScreen.jsx
 * @description Pantalla de inicio con logo animado, formulario de nombre,
 * botón de reglas y acceso al leaderboard.
 */

import { useState } from "react";
import Leaderboard from "./Leaderboard";
import RulesModal from "./RulesModal";

export default function StartScreen({ onStart }) {
  const [name, setName] = useState("");
  const [showLb, setShowLb] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Por favor ingresa tu nombre para continuar.");
      return;
    }
    if (trimmed.length > 20) {
      setError("El nombre debe tener máximo 20 caracteres.");
      return;
    }
    onStart(trimmed);
  };

  return (
    <div className="start-screen">
      {/* Partículas de fondo decorativas */}
      <div className="start-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`particle particle-${i % 4}`} />
        ))}
      </div>

      <div className="start-content">
        {/* Logo / Título */}
        <div className="start-logo" aria-label="Snake Quiz">
          <div className="snake-logo-icon">🐍</div>
          <h1 className="start-title">
            Snake<span className="title-accent">Quiz</span>
          </h1>
          <p className="start-subtitle">
            Sistemas · Programación · Estrategia
          </p>
        </div>

        {/* Formulario */}
        <form className="start-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="player-name" className="start-label">
            ¿Cómo te llamas?
          </label>
          <input
            id="player-name"
            type="text"
            className="start-input"
            placeholder="Ingresa tu nombre"
            value={name}
            maxLength={20}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            autoComplete="off"
            aria-describedby={error ? "name-error" : undefined}
          />
          {error && (
            <p id="name-error" className="start-error" role="alert">
              {error}
            </p>
          )}
          <button id="start-btn" type="submit" className="btn btn-primary">
            🎮 Jugar ahora
          </button>
        </form>

        {/* Botones secundarios */}
        <div className="start-secondary">
          <button
            id="show-rules-btn"
            className="btn btn-secondary"
            onClick={() => setShowRules(true)}
          >
            📋 Reglas
          </button>
          <button
            id="show-lb-btn"
            className="btn btn-secondary"
            onClick={() => setShowLb(true)}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Features resumen */}
        <div className="start-features">
          <div className="feature-card">
            <span>🧠</span>
            <p>Quiz cada 3 comidas</p>
          </div>
          <div className="feature-card">
            <span>❤️</span>
            <p>3 vidas — bonus cada 10 ✅</p>
          </div>
          <div className="feature-card">
            <span>⚡</span>
            <p>Velocidad creciente</p>
          </div>
          <div className="feature-card">
            <span>🏆</span>
            <p>Leaderboard global</p>
          </div>
        </div>
      </div>

      {showLb && <Leaderboard onClose={() => setShowLb(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
