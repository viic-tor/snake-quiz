/**
 * @file App.jsx
 * @description Root de la app con layout responsivo tipo dashboard.
 * Usa CSS Grid de 3 columnas en desktop, 1 columna en móvil.
 * El canvas escala automáticamente al espacio disponible.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import StartScreen from "./components/StartScreen";
import MenuSnakeCanvas from "./components/MenuSnakeCanvas";
import MaintenanceCanvas from "./components/MaintenanceCanvas";
import GameBoard from "./components/GameBoard";
import StatsPanel from "./components/StatsPanel";
import QuizModal from "./components/QuizModal";
import GameOver from "./components/GameOver";
import Leaderboard from "./components/Leaderboard";
import RulesModal from "./components/RulesModal";
import MissionHUD from "./components/MissionHUD";
import PowerupIcon from "./components/PowerupIcon";
import useSnakeGame, { DIFFICULTY_CONFIG } from "./hooks/useSnakeGame";
import SwipeZone from "./components/SwipeZone";
import { soundEngine } from "./utils/SoundEngine";
import { Skull, Heart, Star, Medal, Apple, Brain, Zap, CheckCircle, XCircle, Flame, Worm, User, Play, Pause, BookOpen, Crown, Home, Volume2, VolumeX, Coins, Gem } from "lucide-react";

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
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  useEffect(() => { 
    startGame(); 
    soundEngine.init();
    soundEngine.startBGM();
    return () => soundEngine.stopBGM();
  }, []);

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
          <button id="mute-btn" className="btn btn-sm btn-ghost" onClick={() => { setIsMuted(soundEngine.toggleMute()); }} aria-label="Mute">
            <span className="icon-wrap">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</span>
          </button>
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

          {/* Barra de modificadores activos (debajo del tablero) */}
          <div className="active-powerups-bar">
            {state.activePowerups.length === 0 && state.passivePowerups.length === 0 ? (
              <span className="no-powerups-text">Sin modificadores activos</span>
            ) : (
              <>
                {state.activePowerups.map(p => (
                  <div key={`active-${p.id}`} className={`active-powerup-badge rarity-${p.rarity}`} title={p.name}>
                    <span className="powerup-icon">{p.icon}</span>
                  </div>
                ))}
                {state.passivePowerups.map(p => (
                  <div key={`passive-${p.id}`} className={`active-powerup-badge rarity-${p.rarity}`} title={p.name}>
                    <span className="powerup-icon">{p.icon}</span>
                  </div>
                ))}
              </>
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

            {/* Monedas (solo móvil) */}
            <div className="right-stat mobile-only-stat mobile-puntos" style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '1.2rem', color: '#eab308', fontWeight: 'bold'}}>
              <Coins color="#eab308" size={20} /> +{state.sessionCoins}
            </div>

            <div className="stats-grid-mobile">
              {/* Racha */}
              <div className="right-stat">
                <span className={`right-stat-icon icon-wrap ${state.consecutiveCorrect > 0 ? 'icon-flicker' : ''}`}>
                  <Flame color={state.consecutiveCorrect > 0 ? "#ff6b35" : "#666"} />
                </span>
                <span className="right-stat-label" style={{ color: state.consecutiveCorrect > 0 ? 'inherit' : '#888' }}>Racha</span>
                <span className="right-stat-value" style={{ color: state.consecutiveCorrect > 0 ? 'inherit' : '#888' }}>
                  {state.consecutiveCorrect} {state.consecutiveCorrect > 0 ? '🔥' : '⚫'}
                </span>
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
            
            {/* Desktop Only Extra Sections for right column */}
            <div className="desktop-extra-stats">
              <div className="stat-divider" style={{ margin: '12px 0' }} />

              {/* Bonus vida */}
              <div className="stat-item bonus-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gem size={16} /> Bonus ❤️ (cada {cfg.bonusLifeAt} aciertos)
                </span>
                <div className="stat-progress-bg" style={{ marginTop: '4px' }}>
                  <div className="stat-progress-fill" style={{ width: `${Math.min(100, Math.round(((state.consecutiveCorrect % cfg.bonusLifeAt) / Math.max(cfg.bonusLifeAt, 1)) * 100))}%`, background: '#a855f7' }} />
                </div>
                <span className="stat-hint" style={{ marginTop: '2px' }}>
                  {cfg.bonusLifeAt - (state.consecutiveCorrect % cfg.bonusLifeAt || cfg.bonusLifeAt)} correctas seguidas para +1 Vida
                </span>
              </div>

              {/* Power-ups */}
              <div className="stat-item powerups-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} /> Power-ups
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {state.passivePowerups?.map(p => (
                    <div key={p.id} style={{ border: `1px solid ${p.color}`, padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', background: `${p.color}22` }}>
                      <PowerupIcon iconId={p.iconId} size={14} color={p.color} />
                      <span style={{ fontSize: '11px', color: p.color, fontWeight: 'bold' }}>{p.id === 'mythic_streak_saver' ? 'Escudo' : p.id === 'mythic_freeze' ? 'Congelar' : 'Rayos X'}</span>
                    </div>
                  ))}
                  {state.activePowerups?.map(p => (
                    <div key={p.id} style={{ border: `1px solid ${p.color}`, padding: '4px 8px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px', background: `${p.color}22`, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1, position: 'relative' }}>
                         <PowerupIcon iconId={p.iconId} size={14} color={p.color} />
                         <span style={{ fontSize: '11px', color: 'white', fontWeight: 'bold' }}>{Math.ceil(p.remainingDuration / 1000)}s</span>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: p.color, width: `${(p.remainingDuration / p.duration) * 100}%` }} />
                    </div>
                  ))}
                  {(!state.passivePowerups?.length && !state.activePowerups?.length) && (
                    <span className="stat-hint" style={{ opacity: 0.5 }}>Ningún poder activo</span>
                  )}
                </div>
              </div>

              <div className="stat-divider" style={{ margin: '12px 0' }} />

              {/* Preguntas Detalle */}
              <div className="stat-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Brain size={16} /> Preguntas
                </span>
                <div className="quiz-stat-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', fontWeight: 'bold' }}>
                  <span className="correct-count" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00ff88' }}>
                    <CheckCircle size={14} /> Bien {state.questionsCorrect}
                  </span>
                  <span style={{ opacity: 0.4, color: 'white', fontWeight: 'normal' }}>/</span>
                  <span className="wrong-count" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4757' }}>
                    <XCircle size={14} /> Mal {state.questionsAnswered - state.questionsCorrect}
                  </span>
                </div>
                {state.questionsAnswered > 0 && (
                  <div className="accuracy-bar" style={{ marginTop: '8px' }}>
                    <span className="stat-label">
                      Precisión {Math.round((state.questionsCorrect / state.questionsAnswered) * 100)}%
                    </span>
                    <div className="stat-progress-bg" style={{ marginTop: '4px' }}>
                      <div className="stat-progress-fill" style={{ width: `${Math.min(100, Math.round((state.questionsCorrect / Math.max(state.questionsAnswered, 1)) * 100))}%`, background: cfg.color.accent }} />
                    </div>
                  </div>
                )}
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
          timeLimit={state.passivePowerups.some(p => p.id === "common_extra_time") ? Math.floor(cfg.quizTimeLimit * 1.3) : cfg.quizTimeLimit}
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

  useEffect(() => {
    const handleMouseOver = (e) => {
      if (e.target.closest('button') || e.target.closest('.btn')) {
        soundEngine.playHover();
      }
    };
    const handleClick = (e) => {
      soundEngine.init(); // Initialize audio context on first user interaction
      if (e.target.closest('button') || e.target.closest('.btn')) {
        soundEngine.playClick();
      }
    };
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenance) {
    return (
      <div className="menu-dashboard" style={{ position: 'relative', overflow: 'hidden' }}>
        <MaintenanceCanvas />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'relative', zIndex: 10, padding: '1rem' }}>
          <div style={{ textAlign: 'center', background: 'rgba(10,10,10,0.85)', padding: '2rem', borderRadius: '16px', border: '2px solid #00ff88', boxShadow: '0 0 30px rgba(0,255,136,0.3)', backdropFilter: 'blur(10px)', maxWidth: '90vw' }}>
            <h1 className="title-glitch" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginBottom: '1rem', color: '#00ff88', textShadow: '0 0 15px #00ff88', margin: 0 }}>
              EN MANTENIMIENTO 🐍
            </h1>
            <p style={{ color: '#aaa', fontSize: 'clamp(1rem, 4vw, 1.2rem)', marginTop: '1rem' }}>Estamos mejorando los biomas y mecánicas. ¡Vuelve pronto!</p>
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
          onGameOver={(s) => { 
            import("./utils/shopStore").then(({ addCoins }) => {
              addCoins(playerName, s.sessionCoins);
            });
            setFinalState(s); 
            setView(VIEWS.GAMEOVER); 
          }}
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
