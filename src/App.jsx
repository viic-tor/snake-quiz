/**
 * @file App.jsx
 * @description Root de la app con layout responsivo tipo dashboard.
 * Usa CSS Grid de 3 columnas en desktop, 1 columna en móvil.
 * El canvas escala automáticamente al espacio disponible.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import StatsPanel from "./components/StatsPanel";
import QuizModal from "./components/QuizModal";
import GameOver from "./components/GameOver";
import Leaderboard from "./components/Leaderboard";
import RulesModal from "./components/RulesModal";
import useSnakeGame, { DIFFICULTY_CONFIG } from "./hooks/useSnakeGame";
import SwipeZone from "./components/SwipeZone";

const VIEWS = { START: "start", GAME: "game", GAMEOVER: "gameover" };

// ── Hook para calcular el tamaño del canvas según el espacio disponible ──────
function useCanvasSize(containerRef) {
  const [size, setSize] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Cuadrado perfecto dentro del contenedor, múltiplo de 20 (GRID_SIZE)
      const raw = Math.min(width, height) - 4; // 4px de margen
      const snapped = Math.floor(raw / 20) * 20;
      setSize(Math.max(200, Math.min(520, snapped)));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return size;
}

// ── Componente de juego ──────────────────────────────────────────────────────
function GameView({ playerName, difficulty, answerCount, snakeColor, onGameOver, onMenu }) {
  const { state, startGame, togglePause, answerQuestion, setDirection } =
    useSnakeGame(difficulty, answerCount);
  const [showLb, setShowLb] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const boardContainerRef = useRef(null);
  const canvasSize = useCanvasSize(boardContainerRef);

  const cfg = DIFFICULTY_CONFIG[difficulty];
  const isHard = difficulty === "hard";

  useEffect(() => { startGame(); }, []);

  useEffect(() => {
    if (state.gameOver) {
      const t = setTimeout(() => onGameOver(state), 1800);
      return () => clearTimeout(t);
    }
  }, [state.gameOver]);

  const isPaused = !state.running && !state.showQuiz && !state.gameOver;

  return (
    <div className={`game-view ${isHard ? "game-view-hard" : ""}`}>

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header className={`game-topbar ${isHard ? "game-topbar-hard" : ""}`}>
        <div className="topbar-left">
          <span className="topbar-logo">{isHard ? "🔥" : "🐍"} SnakeQuiz</span>
          <span className={`topbar-mode ${isHard ? "topbar-mode-hard" : "topbar-mode-easy"}`}>
            {isHard ? "DIFÍCIL" : "FÁCIL"}
          </span>
          <span className="topbar-player">👤 {playerName}</span>
        </div>

        {/* Score en topbar (visible en móvil donde el panel lateral no cabe) */}
        <div className="topbar-score">
          <span className="topbar-score-val">⭐ {state.score.toLocaleString()}</span>
          <div className="topbar-lives">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i}>{i < state.lives ? "❤️" : "🖤"}</span>
            ))}
          </div>
        </div>

        <div className="topbar-right">
          <button id="pause-btn" className="btn btn-sm btn-secondary"
            onClick={togglePause} disabled={state.showQuiz || state.gameOver}>
            {isPaused ? "▶" : "⏸"}
          </button>
          <button id="game-rules-btn" className="btn btn-sm btn-ghost" onClick={() => setShowRules(true)}>📋</button>
          <button id="game-lb-btn" className="btn btn-sm btn-ghost" onClick={() => setShowLb(true)}>🏆</button>
          <button id="game-menu-btn" className="btn btn-sm btn-ghost" onClick={onMenu}>🏠</button>
        </div>
      </header>

      {/* ── DASHBOARD GRID ─────────────────────────────────────────────────── */}
      <main className="game-main">

        {/* Columna izquierda: Stats */}
        <aside className="game-col-left">
          <StatsPanel state={state} />
        </aside>

        {/* Columna central: Canvas + overlays */}
        <div className="game-col-center" ref={boardContainerRef}>
          <div className="board-wrap">
            <GameBoard state={state} size={canvasSize} snakeColor={snakeColor} />



            {isPaused && (
              <div className="board-overlay">
                <div className="overlay-content">
                  <span className="overlay-icon">⏸</span>
                  <h2>Pausado</h2>
                  <p>Presiona <b>P</b> o <b>Espacio</b></p>
                  <button id="resume-btn" className="btn btn-primary btn-sm" onClick={togglePause}>▶ Continuar</button>
                </div>
              </div>
            )}

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

          {/* Controles: Desktop inline, Mobile flotante */}
          <div className="game-controls-container">
            <div className="dpad-wrap" aria-label="Controles de dirección">
              <div className="dpad">
                <button id="dpad-up"    className="dpad-btn dpad-up"    onClick={() => setDirection({ x: 0, y: -1 })} aria-label="Arriba">▲</button>
                <button id="dpad-left"  className="dpad-btn dpad-left"  onClick={() => setDirection({ x: -1, y: 0 })} aria-label="Izquierda">◄</button>
                <div className="dpad-center" />
                <button id="dpad-right" className="dpad-btn dpad-right" onClick={() => setDirection({ x: 1, y: 0 })} aria-label="Derecha">►</button>
                <button id="dpad-down"  className="dpad-btn dpad-down"  onClick={() => setDirection({ x: 0, y: 1 })} aria-label="Abajo">▼</button>
              </div>
            </div>

            {/* Zona de swipe táctil dedicada en móvil (superpuesta al D-Pad) */}
            <SwipeZone
              onSwipe={setDirection}
              className="swipe-box-mobile"
            />
          </div>
        </div>

        {/* Columna derecha: Info / mini stats extra */}
        <aside className="game-col-right">
          <div className="right-panel">
            {/* Nivel y comidas */}
            <div className="right-stat">
              <span className="right-stat-icon">🏅</span>
              <span className="right-stat-label">Nivel</span>
              <span className="right-stat-value">{state.level}</span>
            </div>
            <div className="right-stat">
              <span className="right-stat-icon">🍎</span>
              <span className="right-stat-label">Comidas</span>
              <span className="right-stat-value">{state.foodEaten}</span>
            </div>
            <div className="right-stat">
              <span className="right-stat-icon">✅</span>
              <span className="right-stat-label">Correctas</span>
              <span className="right-stat-value correct-count">{state.questionsCorrect}</span>
            </div>
            <div className="right-stat">
              <span className="right-stat-icon">❌</span>
              <span className="right-stat-label">Incorrectas</span>
              <span className="right-stat-value">{state.questionsAnswered - state.questionsCorrect}</span>
            </div>

            <div className="right-divider" />

            {/* Próximo quiz */}
            <div className="right-next">
              <p className="right-next-label">🧠 Próximo quiz en</p>
              <p className="right-next-val">
                {cfg.quizEvery - (state.foodEaten % cfg.quizEvery) || cfg.quizEvery} comida(s)
              </p>
              <div className="right-progress-bg">
                <div className="right-progress-fill" style={{
                  width: `${((cfg.quizEvery - (state.foodEaten % cfg.quizEvery || cfg.quizEvery)) / cfg.quizEvery * 100)}%`,
                  background: "#ff4d6d"
                }} />
              </div>
            </div>

            <div className="right-divider" />

            {/* Controles */}
            <div className="right-controls">
              <p className="right-controls-title">🎮 Controles</p>
              <p>↑↓←→ / WASD</p>
              <p>P = Pausar</p>
            </div>
          </div>
        </aside>
      </main>

      {/* Quiz */}
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

      {/* Toast */}
      {state.showAnswerFeedback && (
        <div className={`answer-toast ${state.lastAnswerCorrect ? "toast-correct" : "toast-wrong"}`}
          role="alert" aria-live="polite">
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
  const [answerCount, setAnswerCount] = useState(4);
  const [finalState,   setFinalState]   = useState(null);
  const [gameKey,      setGameKey]      = useState(0);
  const [snakeColor,   setSnakeColor]   = useState(null); // null = usar color del modo

  const handleStart = (name, diff, count, color) => {
    setPlayerName(name);
    setDifficulty(diff);
    setAnswerCount(count);
    if (color) setSnakeColor(color);
    setGameKey((k) => k + 1);
    setView(VIEWS.GAME);
  };

  return (
    <div className="app-root">
      {view === VIEWS.START && <StartScreen onStart={handleStart} />}

      {view === VIEWS.GAME && (
        <GameView
          key={gameKey}
          playerName={playerName}
          difficulty={difficulty}
          answerCount={answerCount}
          snakeColor={snakeColor}
          onGameOver={(s) => { setFinalState(s); setView(VIEWS.GAMEOVER); }}
          onMenu={() => setView(VIEWS.START)}
        />
      )}

      {view === VIEWS.GAMEOVER && finalState && (
        <GameOver
          state={finalState}
          playerName={playerName}
          onRestart={() => { setGameKey((k) => k + 1); setView(VIEWS.GAME); }}
          onMenu={() => setView(VIEWS.START)}
        />
      )}
    </div>
  );
}
