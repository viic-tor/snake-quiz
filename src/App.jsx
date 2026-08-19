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
import { Skull, Heart, Star, Medal, Apple, CheckCircle, XCircle, Flame, Worm, User, Play, Pause, BookOpen, Crown, Home } from "lucide-react";

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
          <span className="topbar-logo" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span className="icon-wrap">{isHard ? <Flame size={16} className="icon-flicker" /> : <Worm size={16} className="icon-float" />}</span> SnakeQuiz
          </span>
          <span className={`topbar-mode ${isHard ? "topbar-mode-hard" : "topbar-mode-easy"}`}>
            {isHard ? "DIFÍCIL" : "FÁCIL"}
          </span>
          <span className="topbar-player" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span className="icon-wrap"><User size={14} /></span> {playerName}
          </span>
        </div>

        <div className="topbar-right">
          <button id="pause-btn" className="btn btn-sm btn-secondary"
            onClick={togglePause} disabled={state.showQuiz || state.gameOver} aria-label="Pausa">
            <span className="icon-wrap">{isPaused ? <Play size={16} /> : <Pause size={16} />}</span>
          </button>
          <button id="game-rules-btn" className="btn btn-sm btn-ghost" onClick={() => setShowRules(true)} aria-label="Reglas"><span className="icon-wrap"><BookOpen size={16} /></span></button>
          <button id="game-lb-btn" className="btn btn-sm btn-ghost" onClick={() => setShowLb(true)} aria-label="Leaderboard"><span className="icon-wrap"><Crown size={16} /></span></button>
          <button id="game-menu-btn" className="btn btn-sm btn-ghost" onClick={onMenu} aria-label="Menú"><span className="icon-wrap"><Home size={16} /></span></button>
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

            {/* Zona de swipe táctil — cubre el canvas en móvil para deslizar el tablero */}
            <SwipeZone
              onSwipe={setDirection}
              className="swipe-overlay"
            />

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
                  <span className="overlay-icon icon-wrap icon-flicker"><Skull /></span>
                  <h2>Game Over</h2>
                  <p>Guardando puntuación...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Info / mini stats extra */}
        <aside className="game-col-right">
          <div className="right-panel">
            {/* Vidas (solo móvil, en desktop están en la izq) */}
            <div className="right-stat mobile-only-stat mobile-vidas">
              <span className="right-stat-icon icon-wrap icon-pulse"><Heart /></span>
              <span className="right-stat-label">Vidas</span>
              <span className="right-stat-value" style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '2px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className="icon-wrap" style={{ width: '12px', height: '12px' }}>
                    {i < state.lives ? <Heart fill="#ff4757" color="#ff4757" /> : <Heart opacity={0.3} />}
                  </span>
                ))}
              </span>
            </div>

            {/* Puntos extra (solo móvil) */}
            <div className="right-stat mobile-only-stat mobile-puntos">
              <span className="right-stat-icon icon-wrap icon-spin-slow"><Star /></span>
              <span className="right-stat-label">Puntos</span>
              <span className="right-stat-value">{state.score.toLocaleString()}</span>
            </div>

            {/* Nivel y comidas */}
            <div className="right-stat">
              <span className="right-stat-icon icon-wrap icon-shine"><Medal /></span>
              <span className="right-stat-label">Nivel</span>
              <span className="right-stat-value">{state.level}</span>
            </div>
            <div className="right-stat">
              <span className="right-stat-icon icon-wrap"><Apple color="#ff4757" fill="#ff4757" /></span>
              <span className="right-stat-label">Comidas</span>
              <span className="right-stat-value">{state.foodEaten}</span>
            </div>
            <div className="right-stat">
              <span className="right-stat-icon icon-wrap icon-bounce-in"><CheckCircle /></span>
              <span className="right-stat-label">Correctas</span>
              <span className="right-stat-value correct-count">{state.questionsCorrect}</span>
            </div>
            <div className="right-stat">
              <span className="right-stat-icon icon-wrap icon-shake"><XCircle /></span>
              <span className="right-stat-label">Incorrectas</span>
              <span className="right-stat-value incorrect-count">{state.questionsAnswered - state.questionsCorrect}</span>
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
