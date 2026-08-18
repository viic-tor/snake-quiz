/**
 * @file App.jsx
 * @description Componente raíz que gestiona las vistas principales:
 *   - StartScreen  → pantalla de inicio
 *   - Game         → juego activo (tablero + stats + quiz)
 *   - GameOver     → pantalla final
 *
 * Flujo:
 *   "start" → onStart(name) → "game" → gameOver → "gameover"
 *            ← onMenu ←────────────────────────────────────
 *            ← onRestart ←─────────────────────────────────
 */

import { useState, useEffect } from "react";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import StatsPanel from "./components/StatsPanel";
import QuizModal from "./components/QuizModal";
import GameOver from "./components/GameOver";
import Leaderboard from "./components/Leaderboard";
import RulesModal from "./components/RulesModal";
import useSnakeGame from "./hooks/useSnakeGame";
import { saveScore, getLeaderboard } from "./utils/leaderboard";

// ── Vista enum ──────────────────────────────────────────────────────────────
const VIEWS = {
  START: "start",
  GAME: "game",
  GAMEOVER: "gameover",
};

// ── Componente de juego (extrae lógica de useSnakeGame) ───────────────────
function GameView({ playerName, onGameOver, onMenu }) {
  const { state, startGame, togglePause, answerQuestion, setDirection } =
    useSnakeGame();
  const [showLb, setShowLb] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Iniciar juego al montar
  useEffect(() => {
    startGame();
  }, []);

  // Detectar game over y guardar puntuación
  useEffect(() => {
    if (state.gameOver) {
      const entry = {
        name: playerName,
        score: state.score,
        level: state.level,
        questionsCorrect: state.questionsCorrect,
        foodEaten: state.foodEaten,
      };
      saveScore(entry);
      // Notificar al padre para cambiar vista
      setTimeout(() => onGameOver(state), 2000);
    }
  }, [state.gameOver]);

  const isPaused = !state.running && !state.showQuiz && !state.gameOver;

  return (
    <div className="game-view">
      {/* Barra superior */}
      <header className="game-topbar">
        <div className="topbar-left">
          <span className="topbar-logo">🐍 SnakeQuiz</span>
          <span className="topbar-player">👤 {playerName}</span>
        </div>
        <div className="topbar-right">
          <button
            id="pause-btn"
            className="btn btn-sm btn-secondary"
            onClick={togglePause}
            disabled={state.showQuiz || state.gameOver}
          >
            {isPaused ? "▶ Reanudar" : "⏸ Pausar"}
          </button>
          <button
            id="game-rules-btn"
            className="btn btn-sm btn-ghost"
            onClick={() => setShowRules(true)}
          >
            📋 Reglas
          </button>
          <button
            id="game-lb-btn"
            className="btn btn-sm btn-ghost"
            onClick={() => setShowLb(true)}
          >
            🏆
          </button>
          <button
            id="game-menu-btn"
            className="btn btn-sm btn-ghost"
            onClick={onMenu}
          >
            🏠
          </button>
        </div>
      </header>

      {/* Área principal */}
      <main className="game-main">
        {/* Panel de stats */}
        <StatsPanel state={state} />

        {/* Canvas del juego */}
        <div className="board-wrap">
          <GameBoard state={state} />

          {/* Overlay de pausa */}
          {isPaused && (
            <div className="board-overlay">
              <div className="overlay-content">
                <span className="overlay-icon">⏸</span>
                <h2>Pausado</h2>
                <p>Presiona <b>P</b> o <b>Espacio</b> para continuar</p>
                <button
                  id="resume-btn"
                  className="btn btn-primary"
                  onClick={togglePause}
                >
                  ▶ Continuar
                </button>
              </div>
            </div>
          )}

          {/* Overlay de game over (breve) */}
          {state.gameOver && (
            <div className="board-overlay">
              <div className="overlay-content">
                <span className="overlay-icon">💀</span>
                <h2>Game Over</h2>
                <p>Guardando puntuación...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controles móviles / D-pad */}
        <div className="dpad-wrap" aria-label="Controles de dirección">
          <div className="dpad">
            <button
              id="dpad-up"
              className="dpad-btn dpad-up"
              onClick={() => setDirection({ x: 0, y: -1 })}
              aria-label="Arriba"
            >
              ▲
            </button>
            <button
              id="dpad-left"
              className="dpad-btn dpad-left"
              onClick={() => setDirection({ x: -1, y: 0 })}
              aria-label="Izquierda"
            >
              ◄
            </button>
            <div className="dpad-center" />
            <button
              id="dpad-right"
              className="dpad-btn dpad-right"
              onClick={() => setDirection({ x: 1, y: 0 })}
              aria-label="Derecha"
            >
              ►
            </button>
            <button
              id="dpad-down"
              className="dpad-btn dpad-down"
              onClick={() => setDirection({ x: 0, y: 1 })}
              aria-label="Abajo"
            >
              ▼
            </button>
          </div>
        </div>
      </main>

      {/* Quiz Modal */}
      {state.showQuiz && state.currentQuestion && (
        <QuizModal
          question={state.currentQuestion}
          onAnswer={answerQuestion}
          questionsAnswered={state.questionsAnswered}
          questionsCorrect={state.questionsCorrect}
        />
      )}

      {/* Feedback de respuesta (toast) */}
      {state.showAnswerFeedback && (
        <div
          className={`answer-toast ${state.lastAnswerCorrect ? "toast-correct" : "toast-wrong"}`}
          role="alert"
          aria-live="polite"
        >
          {state.flashEffect === "bonus-life"
            ? "💎 ¡+1 Vida Bonus! ❤️"
            : state.lastAnswerCorrect
            ? "✅ ¡Correcto! +Puntos"
            : "❌ Incorrecto — -1 Vida"}
        </div>
      )}

      {showLb && <Leaderboard onClose={() => setShowLb(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

// ── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(VIEWS.START);
  const [playerName, setPlayerName] = useState("");
  const [finalState, setFinalState] = useState(null);

  const handleStart = (name) => {
    setPlayerName(name);
    setView(VIEWS.GAME);
  };

  const handleGameOver = (gameState) => {
    setFinalState(gameState);
    setView(VIEWS.GAMEOVER);
  };

  const handleRestart = () => {
    setView(VIEWS.GAME);
  };

  const handleMenu = () => {
    setView(VIEWS.START);
  };

  return (
    <div className="app-root">
      {view === VIEWS.START && <StartScreen onStart={handleStart} />}

      {view === VIEWS.GAME && (
        <GameView
          key={playerName + Date.now()} // forzar remount en restart
          playerName={playerName}
          onGameOver={handleGameOver}
          onMenu={handleMenu}
        />
      )}

      {view === VIEWS.GAMEOVER && finalState && (
        <GameOver
          state={finalState}
          playerName={playerName}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}
