/**
 * @file StartScreen.jsx
 * @description Menú principal estilo Dashboard con 3 columnas:
 *
 *   Izquierda: Configuración integrada (modo, respuestas, banco Excel)
 *   Centro:    Logo, nombre y botón de inicio
 *   Derecha:   Top 3 leaderboard + stats personales del jugador
 *
 * Fondo: serpiente animada semi-transparente (MenuSnakeCanvas)
 */

import { useState, useEffect } from "react";
import Leaderboard from "./Leaderboard";
import RulesModal from "./RulesModal";
import QuestionImporter from "./QuestionImporter";
import MenuSnakeCanvas from "./MenuSnakeCanvas";
import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";
import { getCustomMeta, hasCustomQuestions, clearCustomQuestions } from "../utils/questionStore";
import { getLeaderboardLocal, getLeaderboard } from "../utils/leaderboard";
import { SUPABASE_ENABLED, loginPlayer, registerPlayer } from "../utils/supabase";
import { getPlayerStats, getAccuracy } from "../utils/playerStats";
import { Settings, Circle, AlertTriangle, BookOpen, Crown, Flame, Gamepad2, Brain, Heart, Zap, BarChart2, Skull, Sparkles, Loader2, Lightbulb, TrendingUp, Target, Medal, FolderOpen, RefreshCw, X, ArrowRight, CheckCircle, Worm } from "lucide-react";

export default function StartScreen({ onStart }) {
  const [name,           setName]           = useState(() => localStorage.getItem("snake-quiz-last-name") || "");
  const [password,       setPassword]       = useState("");
  const [authLoading,    setAuthLoading]    = useState(false);
  const [difficulty,     setDifficulty]     = useState("easy");
  const [answerCount,    setAnswerCount]    = useState(4);
  const [snakeColor,     setSnakeColor]     = useState(null); // null = color del modo
  const [showLb,         setShowLb]         = useState(false);
  const [showRules,      setShowRules]      = useState(false);
  const [showImporter,   setShowImporter]   = useState(false);
  const [customMeta,     setCustomMeta]     = useState(() => getCustomMeta());
  const [hasCustom,      setHasCustom]      = useState(() => hasCustomQuestions());
  const [error,          setError]          = useState("");
  const [top3,           setTop3]           = useState([]);
  const [top3Loading,    setTop3Loading]    = useState(true);
  const [playerStats,    setPlayerStats]    = useState(() => getPlayerStats());

  const handleImported = (stats) => {
    setCustomMeta(stats || getCustomMeta());
    setHasCustom(hasCustomQuestions());
    setShowImporter(false);
  };

  const isHard = difficulty === "hard";
  const cfg    = DIFFICULTY_CONFIG[difficulty];

  // Cargar top 3 usando Supabase si está activo, si no localStorage
  useEffect(() => {
    setTop3Loading(true);
    getLeaderboard(difficulty)
      .then((board) => {
        setTop3(board.slice(0, 3));
      })
      .catch(() => {
        setTop3(getLeaderboardLocal(difficulty).slice(0, 3));
      })
      .finally(() => setTop3Loading(false));
  }, [difficulty]);

  // Refrescar stats personales al montar
  useEffect(() => {
    setPlayerStats(getPlayerStats());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("Por favor ingresa tu nombre."); return; }
    if (trimmed.length > 20) { setError("Máximo 20 caracteres."); return; }

    if (SUPABASE_ENABLED) {
      if (!password) { setError("Debes ingresar una contraseña (PIN)."); return; }
      setAuthLoading(true);
      setError("");
      try {
        // Intenta hacer login primero
        await loginPlayer(trimmed, password);
      } catch (err) {
        if (err.message === "Usuario no encontrado.") {
          // Si no existe, lo registra automáticamente
          try {
            await registerPlayer(trimmed, password);
          } catch (regErr) {
            setAuthLoading(false);
            setError(regErr.message || "Error al crear perfil.");
            return;
          }
        } else {
          setAuthLoading(false);
          setError(err.message || "Error de autenticación.");
          return;
        }
      }
      setAuthLoading(false);
    }

    localStorage.setItem("snake-quiz-last-name", trimmed);
    onStart(trimmed, difficulty, answerCount, snakeColor);
  };



  const handleClearCustom = () => {
    clearCustomQuestions();
    setCustomMeta(null);
    setHasCustom(false);
  };

  const rankMedal = (i) => {
    if (i === 0) return <Medal color="#ffd700" fill="#ffd700" className="icon-shine" />;
    if (i === 1) return <Medal color="#c0c0c0" fill="#c0c0c0" />;
    if (i === 2) return <Medal color="#cd7f32" fill="#cd7f32" />;
    return `#${i + 1}`;
  };
  const accuracy  = getAccuracy(playerStats);

  return (
    <div className={`menu-dashboard ${isHard ? "menu-dashboard-hard" : ""}`}>

      {/* Fondo animado */}
      <MenuSnakeCanvas color={isHard ? "#ff6b35" : "#00ff88"} />

      {/* ── Grid principal ─────────────────────────────────────────────── */}
      <div className="menu-grid">

        {/* Columna izquierda: Configuración */}
        <aside id="section-left" className="menu-col menu-col-left">

          {/* Título columna */}
          <p className="menu-col-title"><span className="icon-wrap icon-rotate-hover"><Settings /></span> Configuración</p>

          {/* Modo de juego */}
          <div className="menu-section">
            <p className="menu-section-label">Modo de juego</p>
            <div className="menu-diff-btns">
              <button
                id="mode-easy-btn" type="button"
                className={`menu-diff-btn ${difficulty === "easy" ? "menu-diff-easy-active" : ""}`}
                onClick={() => setDifficulty("easy")}
              >
                <span className="menu-diff-icon icon-wrap"><Circle color="#00ff88" fill="#00ff88" /></span>
                <div>
                  <span className="menu-diff-name">Fácil</span>
                  <span className="menu-diff-desc">Paredes traspasables · Quiz c/3</span>
                </div>
              </button>
              <button
                id="mode-hard-btn" type="button"
                className={`menu-diff-btn ${difficulty === "hard" ? "menu-diff-hard-active" : ""}`}
                onClick={() => setDifficulty("hard")}
              >
                <span className="menu-diff-icon icon-wrap"><Circle color="#ff4757" fill="#ff4757" /></span>
                <div>
                  <span className="menu-diff-name">Difícil</span>
                  <span className="menu-diff-desc">Paredes mortales · ×2 pts · 10s</span>
                </div>
              </button>
            </div>
            {isHard && (
              <div className="menu-diff-warning">
                <span className="icon-wrap icon-flicker"><AlertTriangle size={14} /></span> Las paredes quitan vida · Quiz c/2 comidas · 10s por pregunta
              </div>
            )}
          </div>

          {/* Opciones de respuesta */}
          <div className="menu-section">
            <p className="menu-section-label">Opciones de respuesta</p>
            <div className="menu-answer-btns">
              {[4, 5, 6].map((n) => (
                <button
                  key={n}
                  id={`answers-${n}-btn`}
                  type="button"
                  className={`menu-answer-btn ${answerCount === n ? "menu-answer-active" : ""}`}
                  onClick={() => setAnswerCount(n)}
                >
                  <span className="menu-answer-num">{n}</span>
                  <span className="menu-answer-label">
                    {n === 4 ? "Estándar" : n === 5 ? "Medio" : "Difícil"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color de la culebra */}
          <div className="menu-section section-color-culebra">
            <p className="menu-section-label">Color de la culebra</p>
            <div className="menu-color-swatches">
              {/* Opción "auto" = color del modo */}
              <button
                type="button"
                className={`menu-swatch menu-swatch-auto ${snakeColor === null ? "menu-swatch-active" : ""}`}
                onClick={() => setSnakeColor(null)}
                title="Color automático del modo"
              >
                <span className="icon-wrap"><Gamepad2 /></span>
                <span className="menu-swatch-label">Auto</span>
              </button>
              {[
                { color: "#00ff88", label: "Verde",   title: "Verde neón" },
                { color: "#00cfff", label: "Cyan",    title: "Cyan eléctrico" },
                { color: "#a855f7", label: "Violeta", title: "Violeta" },
                { color: "#f59e0b", label: "Dorado",  title: "Dorado" },
                { color: "#ff6b35", label: "Naranja", title: "Naranja fuego" },
                { color: "#ff2d78", label: "Rosa",    title: "Rosa neón" },
                { color: "#ffffff", label: "Blanco",  title: "Blanco" },
                { color: "#ff4444", label: "Rojo",    title: "Rojo" },
              ].map(({ color, label, title }) => (
                <button
                  key={color}
                  type="button"
                  className={`menu-swatch ${snakeColor === color ? "menu-swatch-active" : ""}`}
                  style={{ "--swatch-color": color }}
                  onClick={() => setSnakeColor(color)}
                  title={title}
                >
                  <span className="menu-swatch-dot" />
                  <span className="menu-swatch-label">{label}</span>
                </button>
              ))}
            </div>
            {snakeColor && (
              <p className="menu-color-preview">
                Vista previa:&nbsp;
                <span style={{ color: snakeColor, fontWeight: 700 }}>■■■■■</span>
              </p>
            )}
          </div>

          {/* Botones secundarios */}
          <div className="menu-secondary section-botones-secundarios">
            <button id="show-rules-btn" className="btn btn-secondary" onClick={() => setShowRules(true)}>
              <span className="icon-wrap icon-rotate-hover" style={{marginRight: 4}}><BookOpen size={16}/></span> Reglas
            </button>
            <button id="show-lb-full-btn" className="btn btn-secondary" onClick={() => setShowLb(true)}>
              <span className="icon-wrap icon-shine" style={{marginRight: 4}}><Crown size={16}/></span> Ranking completo
            </button>
          </div>
        </aside>

        {/* ══ COLUMNA CENTRO — Hero ══ */}
        <main id="section-center" className="menu-col menu-col-center">

          {/* Logo */}
          <div className="menu-logo">
            <div className={`menu-logo-icon ${isHard ? "menu-logo-hard" : ""}`}>
              {isHard ? <span className="icon-wrap icon-flicker"><Flame /></span> : <span className="icon-wrap icon-float"><Worm /></span>}
            </div>
            <h1 className="menu-title">
              Snake<span className={`menu-title-accent ${isHard ? "menu-title-hard" : ""}`}>Quiz</span>
            </h1>
            <p className="menu-subtitle">Sistemas · Programación · Estrategia</p>
          </div>

          {/* Mini feature pills */}
          <div className="menu-pills">
            {[
              { icon: <Brain className="icon-float" size={14} />, text: `Quiz c/${cfg.quizEvery}` },
              { icon: <Heart className="icon-pulse" fill="currentColor" size={14} />, text: "3 vidas" },
              { icon: <Zap className="icon-flicker" size={14} />, text: "Velocidad creciente" },
              { icon: <BarChart2 size={14} />, text: `${answerCount} respuestas` },
              { icon: isHard ? <Skull className="icon-flicker" size={14} /> : <Sparkles className="icon-shine" size={14} />, text: isHard ? "×2 puntos" : "Paredes seguras" },
            ].map(({ icon, text }) => (
              <span key={text} className="menu-pill"><span className="icon-wrap">{icon}</span> {text}</span>
            ))}
          </div>

          {/* Formulario de inicio */}
          <form className="menu-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="player-name" className="menu-form-label">Tu nombre</label>
            <input
              id="player-name"
              type="text"
              className={`menu-input ${isHard ? "menu-input-hard" : ""}`}
              placeholder="Ej: Jugador1"
              value={name}
              maxLength={20}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoComplete="off"
              autoFocus
            />

            {SUPABASE_ENABLED && (
              <>
                <label htmlFor="player-password" className="menu-form-label" style={{ marginTop: '0.5rem' }}>
                  Contraseña (PIN)
                </label>
                <input
                  id="player-password"
                  type="password"
                  className={`menu-input ${isHard ? "menu-input-hard" : ""}`}
                  placeholder="Tu PIN secreto..."
                  value={password}
                  maxLength={20}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Si el nombre no existe, se creará el perfil automáticamente.
                </p>
              </>
            )}

            {error && <p className="menu-error" role="alert">{error}</p>}
            <button
              id="start-btn"
              type="submit"
              disabled={authLoading}
              className={`btn menu-start-btn ${isHard ? "btn-danger" : "btn-primary"}`}
            >
              <span>{authLoading ? <><span className="icon-wrap icon-spin-slow"><Loader2 size={16}/></span> Validando...</> : (isHard ? (answerCount === 4 ? <><span className="icon-wrap"><Circle fill="currentColor" size={16}/></span> Jugar en Difícil</> : answerCount === 5 ? <><span className="icon-wrap"><Flame size={16}/></span> Jugar en Difícil Pro</> : <><span className="icon-wrap"><Skull size={16}/></span> Jugar en Difícil Pro Max</>) : <><span className="icon-wrap"><Gamepad2 size={16}/></span> Jugar en Fácil</>)}</span>
              <span className="menu-start-opts">· {answerCount} opciones</span>
            </button>
          </form>

          {/* Tip del modo — debajo del botón de inicio */}
          <div className={`menu-tip menu-tip-center ${isHard ? "menu-tip-hard" : "menu-tip-easy"}`}>
            {isHard ? (
              <><span className="icon-wrap icon-shine"><Lightbulb size={16} /></span><p>En modo difícil cada respuesta correcta vale el doble. ¡Pero cuidado con las paredes!</p></>
            ) : (
              <><span className="icon-wrap icon-shine"><Lightbulb size={16} /></span><p>Cada 10 preguntas correctas sin perder vidas ganas una vida extra.</p></>
            )}
          </div>
        </main>

        {/* ══ COLUMNA DERECHA — Stats & Leaderboard ══ */}
        <aside id="section-right" className="menu-col menu-col-right">

          {/* Tus estadísticas personales */}
          <p className="menu-col-title"><span className="icon-wrap"><TrendingUp /></span> Tus Estadísticas</p>
          <div className="menu-stats-grid">
            <div className="menu-stat-card">
              <span className="menu-stat-icon icon-wrap icon-shine"><Crown /></span>
              <span className="menu-stat-value">{playerStats.bestScore.toLocaleString()}</span>
              <span className="menu-stat-label">Mejor Score</span>
            </div>
            <div className="menu-stat-card">
              <span className="menu-stat-icon icon-wrap"><Gamepad2 /></span>
              <span className="menu-stat-value">{playerStats.gamesPlayed}</span>
              <span className="menu-stat-label">Partidas</span>
            </div>
            <div className="menu-stat-card">
              <span className="menu-stat-icon icon-wrap"><Target /></span>
              <span className="menu-stat-value">{accuracy}%</span>
              <span className="menu-stat-label">Precisión</span>
            </div>
            <div className="menu-stat-card">
              <span className="menu-stat-icon icon-wrap icon-shine"><Medal /></span>
              <span className="menu-stat-value">{playerStats.bestLevel}</span>
              <span className="menu-stat-label">Mejor Nivel</span>
            </div>
          </div>

          {/* Último score */}
          {playerStats.gamesPlayed > 0 && (
            <div className="menu-last-score">
              <span className="menu-last-label">Última partida</span>
              <span className="menu-last-val">{playerStats.lastScore.toLocaleString()} pts</span>
            </div>
          )}

          {/* Divisor */}
          <div className="menu-divider" />

          {/* Top 3 Leaderboard */}
          <div className="menu-top3">
            <p className="menu-col-title">
              <span className="icon-wrap icon-shine"><Crown /></span> Top 3 — {isHard ? "Difícil" : "Fácil"}
              {SUPABASE_ENABLED && <span className="menu-global-badge">🌐 Global</span>}
            </p>
            {top3Loading ? (
              <div className="menu-top3-empty">
                <span className="icon-wrap icon-spin-slow" style={{fontSize:"1.2rem"}}><Loader2 /></span>
                <p>Cargando ranking…</p>
              </div>
            ) : top3.length === 0 ? (
              <div className="menu-top3-empty">
                <span className="icon-wrap"><Target /></span>
                <p>¡Sé el primero en el ranking!</p>
              </div>
            ) : (
              <div className="menu-top3-list">
                {top3.map((entry, i) => (
                  <div key={entry.id} className={`menu-top3-row menu-top3-row-${i}`}>
                    <span className="menu-top3-medal">{rankMedal(i)}</span>
                    <span className="menu-top3-name">{entry.name}</span>
                    <span className="menu-top3-score">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="menu-top3-more" onClick={() => setShowLb(true)}>
              Ver ranking completo →
            </button>
          </div>

          {/* Divisor */}
          <div className="menu-divider" />

          {/* Banco de preguntas / Excel — debajo del Top 3 */}
          <div className="menu-section">
            <p className="menu-section-label"><span className="icon-wrap"><BarChart2 size={14}/></span> Banco de preguntas</p>
            {hasCustom && customMeta ? (
              <div className="menu-bank-active">
                <span className="icon-wrap"><FolderOpen size={20} /></span>
                <div className="menu-bank-info">
                  <span className="menu-bank-name">{customMeta.name}</span>
                  <span className="menu-bank-count">{customMeta.count} preguntas · <span className="menu-no-lb">no cuenta para ranking</span></span>
                </div>
                <div className="menu-bank-actions">
                  <button id="import-change-btn-r" className="btn btn-sm btn-ghost" title="Cambiar archivo" onClick={() => setShowImporter(true)}><RefreshCw size={16}/></button>
                  <button id="import-clear-btn-r"  className="btn btn-sm btn-ghost" title="Usar banco base"  onClick={handleClearCustom}><X size={16}/></button>
                </div>
              </div>
            ) : (
              <button id="open-importer-btn-r" className="menu-bank-upload" onClick={() => setShowImporter(true)}>
                <span className="icon-wrap"><BarChart2 size={24} /></span>
                <div>
                  <span className="menu-bank-upload-title">Importar desde Excel</span>
                  <span className="menu-bank-upload-sub">Carga tu propio banco de preguntas</span>
                </div>
                <span className="menu-bank-upload-arrow"><ArrowRight size={18} /></span>
              </button>
            )}
            {!hasCustom && (
              <div className="menu-bank-base">
                <span className="icon-wrap icon-bounce-in"><CheckCircle size={12} /></span> Banco oficial · <strong>200 preguntas</strong>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modales */}
      {showLb       && <Leaderboard     onClose={() => setShowLb(false)}       initialMode={difficulty} />}
      {showRules    && <RulesModal      onClose={() => setShowRules(false)}     difficulty={difficulty} />}
      {showImporter && <QuestionImporter onClose={() => setShowImporter(false)} onImported={handleImported} />}
    </div>
  );
}
