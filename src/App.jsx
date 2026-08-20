/**
 * @file App.jsx
 * @description Root de la app con layout responsivo tipo dashboard.
 * Usa CSS Grid de 3 columnas en desktop, 1 columna en móvil.
 * El canvas escala automáticamente al espacio disponible.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import StartScreen from "./components/StartScreen";
import MenuSnakeCanvas from "./components/MenuSnakeCanvas";
import GameBoard from "./components/GameBoard";
import StatsPanel from "./components/StatsPanel";
import QuizModal from "./components/QuizModal";
import GameOver from "./components/GameOver";
import Leaderboard from "./components/Leaderboard";
import RulesModal from "./components/RulesModal";
import useSnakeGame, { DIFFICULTY_CONFIG } from "./hooks/useSnakeGame";
import SwipeZone from "./components/SwipeZone";
import { Skull, Heart, Star, Medal, Apple, Brain, Zap, CheckCircle, XCircle, Flame, Worm, User, Play, Pause, BookOpen, Crown, Home } from "lucide-react";

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
            <span className="icon-wrap">{isHard ? <Flame size={16} className="icon-flicker" /> : "🐍"}</span> SnakeQuiz
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
                  <p className="pause-text-desktop">Presiona <b>P</b> o <b>Espacio</b></p>
                  <p className="pause-text-mobile">Toca <b>Continuar</b> para seguir jugando</p>
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
            <div className="right-stat mobile-only-stat mobile-vidas" style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '1.2rem', color: '#ff4757', fontWeight: 'bold'}}>
              <Heart fill="#ff4757" color="#ff4757" size={20} /> x{state.lives}
            </div>

            {/* Puntos extra (solo móvil) */}
            <div className="right-stat mobile-only-stat mobile-puntos" style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '1.2rem', color: '#ffd700', fontWeight: 'bold'}}>
              <Star fill="#ffd700" color="#ffd700" size={20} /> {state.score.toLocaleString()}
            </div>

            <div className="stats-grid-mobile">
              {/* Racha */}
              <div className="right-stat">
                <span className="right-stat-icon icon-wrap icon-flicker"><Flame color="#ff6b35" /></span>
                <span className="right-stat-label">Racha</span>
                <span className="right-stat-value">{state.consecutiveCorrect} 🔥</span>
              </div>
              
              {/* Multiplicador */}
              <div className="right-stat">
                <span className="right-stat-icon icon-wrap icon-pulse"><XCircle color="#ffd700" /></span>
                <span className="right-stat-label">Multiplicador</span>
                <span className="right-stat-value" style={{color: '#ffd700'}}>
                  ×{cfg.streakMultiplier ? cfg.streakMultiplier(state.consecutiveCorrect, state.answerCount) : 1}
                </span>
              </div>

              {/* Nivel */}
              <div className="right-stat mobile-only-stat">
                <span className="right-stat-icon icon-wrap"><Medal color="#00ff88" /></span>
                <span className="right-stat-label">Nivel</span>
                <span className="right-stat-value" style={{color: '#00ff88'}}>{state.level}</span>
              </div>

              {/* Comidas */}
              <div className="right-stat mobile-only-stat">
                <span className="right-stat-icon icon-wrap"><Apple color="#ff4d6d" /></span>
                <span className="right-stat-label">Comidas</span>
                <span className="right-stat-value" style={{color: '#ff4d6d'}}>{state.foodEaten}</span>
              </div>

              {/* Preguntas */}
              <div className="right-stat mobile-only-stat">
                <span className="right-stat-icon icon-wrap"><Brain color="#a855f7" /></span>
                <span className="right-stat-label">Preguntas</span>
                <span className="right-stat-value" style={{fontSize: '0.65rem', whiteSpace: 'nowrap'}}>
                  <span style={{color: '#00ff88'}}>B:{state.questionsCorrect}</span> <span style={{color: '#fff', opacity: 0.5}}>/</span> <span style={{color: '#ff4757'}}>M:{state.questionsAnswered - state.questionsCorrect}</span>
                </span>
              </div>

              {/* Velocidad */}
              <div className="right-stat mobile-only-stat">
                <span className="right-stat-icon icon-wrap"><Zap color="#0ea5e9" /></span>
                <span className="right-stat-label">Velocidad</span>
                <span className="right-stat-value" style={{color: '#0ea5e9'}}>
                  {Math.round(((cfg.initialSpeed - state.speed) / (cfg.initialSpeed - cfg.minSpeed)) * 100)}%
                </span>
              </div>
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

  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenance) {
    return (
      <div className="menu-dashboard">
        <MenuSnakeCanvas color="#00ff88" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'relative', zIndex: 10, padding: '1rem' }}>
          <div style={{ textAlign: 'center', background: 'rgba(10,10,10,0.85)', padding: '2rem', borderRadius: '16px', border: '2px solid #00ff88', boxShadow: '0 0 30px rgba(0,255,136,0.3)', backdropFilter: 'blur(10px)', maxWidth: '90vw' }}>
            <h1 className="title-glitch" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginBottom: '1rem', color: '#00ff88', textShadow: '0 0 15px #00ff88', margin: 0 }}>
              EN MANTENIMIENTO 🐍
            </h1>
            <p style={{ color: '#aaa', fontSize: 'clamp(1rem, 4vw, 1.2rem)', marginTop: '1rem' }}>Estamos realizando mejoras. ¡Vuelve pronto!</p>
          </div>
        </div>
      </div>
    );
  }
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
