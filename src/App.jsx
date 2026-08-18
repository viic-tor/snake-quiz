/**
 * @file App.jsx
 * @description Raíz de la aplicación. Gestiona vistas y pasa la dificultad
 * seleccionada a todos los componentes hijos.
 *
 * Flujo:
 *   StartScreen → onStart(name, difficulty) → GameView → onGameOver(state) → GameOver
 *              ←── onMenu ────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import StatsPanel from "./components/StatsPanel";
import QuizModal from "./components/QuizModal";
import GameOver from "./components/GameOver";
import Leaderboard from "./components/Leaderboard";
import RulesModal from "./components/RulesModal";
import useSnakeGame, { DIFFICULTY_CONFIG } from "./hooks/useSnakeGame";
import { saveScore } from "./utils/leaderboard";

const VIEWS = { START: "start", GAME: "game", GAMEOVER: "gameover" };

// ── Componente de juego ──────────────────────────────────────────────────────
function GameView({ playerName, difficulty, onGameOver, onMenu }) {
  const { state, startGame, togglePause, answerQuestion, setDirection } =
    useSnakeGame(difficulty);
  const [showLb, setShowLb] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const cfg = DIFFICULTY_CONFIG[difficulty];
  const isHard = difficulty === "hard";

  useEffect(() => { startGame(); }, []);

  // Detectar game over
  useEffect(() => {
    if (state.gameOver) {
      setTimeout(() => onGameOver(state), 2000);
    }
  }, [state.gameOver]);

  const isPaused = !state.running && !state.showQuiz && !state.gameOver;

  return (
    <div className={`game-view ${isHard ? "game-view-hard" : ""}`}>
      {/* Topbar */}
      <header className={`game-topbar ${isHard ? "game-topbar-hard" : ""}`}>
        <div className="topbar-left">
          <span className="topbar-logo">
            {isHard ? "🔥" : "🐍"} SnakeQuiz
          </span>
          <span className={`topbar-mode ${isHard ? "topbar-mode-hard" : "topbar-mode-easy"}`}>
            {isHard ? "DIFÍCIL" : "FÁCIL"}
          </span>
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
          <button id="game-rules-btn" className="btn btn-sm btn-ghost" onClick={() => setShowRules(true)}>📋</button>
          <button id="game-lb-btn" className="btn btn-sm btn-ghost" onClick={() => setShowLb(true)}>🏆</button>
          <button id="game-menu-btn" className="btn btn-sm btn-ghost" onClick={onMenu}>🏠</button>
        </div>
      </header>

      {/* Área principal */}
      <main className="game-main">
        <StatsPanel state={state} />

        <div className="board-wrap">
          <GameBoard state={state} />

          {/* Overlay pausa */}
          {isPaused && (
            <div className="board-overlay">
              <div className="overlay-content">
                <span className="overlay-icon">⏸</span>
                <h2>Pausado</h2>
                <p>Presiona <b>P</b> o <b>Espacio</b> para continuar</p>
                <button id="resume-btn" className="btn btn-primary" onClick={togglePause}>▶ Continuar</button>
              </div>
            </div>
          )}

          {/* Overlay game over */}
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

        {/* D-pad */}
        <div className="dpad-wrap" aria-label="Controles de dirección">
          <div className="dpad">
            <button id="dpad-up" className="dpad-btn dpad-up" onClick={() => setDirection({ x: 0, y: -1 })} aria-label="Arriba">▲</button>
            <button id="dpad-left" className="dpad-btn dpad-left" onClick={() => setDirection({ x: -1, y: 0 })} aria-label="Izquierda">◄</button>
            <div className="dpad-center" />
            <button id="dpad-right" className="dpad-btn dpad-right" onClick={() => setDirection({ x: 1, y: 0 })} aria-label="Derecha">►</button>
            <button id="dpad-down" className="dpad-btn dpad-down" onClick={() => setDirection({ x: 0, y: 1 })} aria-label="Abajo">▼</button>
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
          timeLimit={cfg.quizTimeLimit}
          difficulty={difficulty}
        />
      )}

      {/* Toast de respuesta */}
      {state.showAnswerFeedback && (
        <div
          className={`answer-toast ${state.lastAnswerCorrect ? "toast-correct" : "toast-wrong"}`}
          role="alert"
          aria-live="polite"
        >
          {state.flashEffect === "bonus-life"
            ? "💎 ¡+1 Vida Bonus! ❤️"
            : state.lastAnswerCorrect
            ? `✅ ¡Correcto! +${cfg.pointsPerQuiz(state.level)} pts`
            : "❌ Incorrecto — −1 Vida"}
        </div>
      )}

      {showLb && <Leaderboard onClose={() => setShowLb(false)} initialMode={difficulty} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} difficulty={difficulty} />}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(VIEWS.START);
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [finalState, setFinalState] = useState(null);
  const [gameKey, setGameKey] = useState(0); // forzar remount

  const handleStart = (name, diff) => {
    setPlayerName(name);
    setDifficulty(diff);
    setGameKey((k) => k + 1);
    setView(VIEWS.GAME);
  };

  const handleGameOver = (gameState) => {
    setFinalState(gameState);
    setView(VIEWS.GAMEOVER);
  };

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setView(VIEWS.GAME);
  };

  const handleMenu = () => setView(VIEWS.START);

  return (
    <div className="app-root">
      {view === VIEWS.START && <StartScreen onStart={handleStart} />}

      {view === VIEWS.GAME && (
        <GameView
          key={gameKey}
          playerName={playerName}
          difficulty={difficulty}
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
