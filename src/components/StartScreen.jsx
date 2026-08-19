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
  const [isAtBottom,     setIsAtBottom]     = useState(false);
  const [error,          setError]          = useState("");
  const [top3,           setTop3]           = useState([]);
  const [top3Loading,    setTop3Loading]    = useState(true);
  const [playerStats,    setPlayerStats]    = useState(() => getPlayerStats());

  // Detectar si estamos al final de la página para cambiar el ícono
  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 250;
      setIsAtBottom(scrolledToBottom);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleImported = (stats) => {
    setCustomMeta(stats || getCustomMeta());
    setHasCustom(hasCustomQuestions());
    setShowImporter(false);
  };

  const ChevronDown = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const ChevronUp = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );

  const handleScrollDown = () => {
    // Si la flecha apunta hacia arriba, forzamos la subida a la primera sección
    if (isAtBottom) {
      const firstEl = document.getElementById('section-center');
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Orden lógico en móvil: Centro (Hero/Login), Izquierda (Config), Derecha (Stats/Leaderboard)
    const sectionIds = ['section-center', 'section-left', 'section-right'];
    const currentScroll = window.scrollY + 10; // Margen para evitar atascos en la misma sección

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        if (elTop > currentScroll) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
    
    // Si estamos en la última (ninguna está más abajo), volvemos a la primera
    const firstEl = document.getElementById(sectionIds[0]);
    if (firstEl) {
      firstEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const rankMedal = (i) => ["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`;
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
          <p className="menu-col-title">⚙️ Configuración</p>

          {/* Modo de juego */}
          <div className="menu-section">
            <p className="menu-section-label">Modo de juego</p>
            <div className="menu-diff-btns">
              <button
                id="mode-easy-btn" type="button"
                className={`menu-diff-btn ${difficulty === "easy" ? "menu-diff-easy-active" : ""}`}
                onClick={() => setDifficulty("easy")}
              >
                <span className="menu-diff-icon">🟢</span>
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
                <span className="menu-diff-icon">🔴</span>
                <div>
                  <span className="menu-diff-name">Difícil</span>
                  <span className="menu-diff-desc">Paredes mortales · ×2 pts · 10s</span>
                </div>
              </button>
            </div>
            {isHard && (
              <div className="menu-diff-warning">
                ⚠️ Las paredes quitan vida · Quiz c/2 comidas · 10s por pregunta
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
                <span>🐍</span>
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
              📋 Reglas
            </button>
            <button id="show-lb-full-btn" className="btn btn-secondary" onClick={() => setShowLb(true)}>
              🏆 Ranking completo
            </button>
          </div>
        </aside>

        {/* ══ COLUMNA CENTRO — Hero ══ */}
        <main id="section-center" className="menu-col menu-col-center">

          {/* Logo */}
          <div className="menu-logo">
            <div className={`menu-logo-icon ${isHard ? "menu-logo-hard" : ""}`}>
              {isHard ? "🔥" : "🐍"}
            </div>
            <h1 className="menu-title">
              Snake<span className={`menu-title-accent ${isHard ? "menu-title-hard" : ""}`}>Quiz</span>
            </h1>
            <p className="menu-subtitle">Sistemas · Programación · Estrategia</p>
          </div>

          {/* Mini feature pills */}
          <div className="menu-pills">
            {[
              { icon: "🧠", text: `Quiz c/${cfg.quizEvery}` },
              { icon: "❤️", text: "3 vidas" },
              { icon: "⚡", text: "Velocidad creciente" },
              { icon: "📊", text: `${answerCount} respuestas` },
              { icon: isHard ? "💀" : "✨", text: isHard ? "×2 puntos" : "Paredes seguras" },
            ].map(({ icon, text }) => (
              <span key={text} className="menu-pill">{icon} {text}</span>
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
              <span>{authLoading ? "⏳ Validando..." : (isHard ? (answerCount === 4 ? "🔴 Jugar en Difícil" : answerCount === 5 ? "🔥 Jugar en Difícil Pro" : "💀 Jugar en Difícil Pro Max") : "🎮 Jugar en Fácil")}</span>
              <span className="menu-start-opts">· {answerCount} opciones</span>
            </button>
          </form>

          {/* Tip del modo — debajo del botón de inicio */}
          <div className={`menu-tip menu-tip-center ${isHard ? "menu-tip-hard" : "menu-tip-easy"}`}>
            {isHard ? (
              <><span>💡</span><p>En modo difícil cada respuesta correcta vale el doble. ¡Pero cuidado con las paredes!</p></>
            ) : (
              <><span>💡</span><p>Cada 10 preguntas correctas sin perder vidas ganas una vida extra.</p></>
            )}
          </div>
        </main>

        {/* ══ COLUMNA DERECHA — Stats & Leaderboard ══ */}
        <aside id="section-right" className="menu-col menu-col-right">

          {/* Tus estadísticas personales */}
          <p className="menu-col-title">📈 Tus Estadísticas</p>
          <div className="menu-stats-grid">
            <div className="menu-stat-card">
              <span className="menu-stat-icon">🏆</span>
              <span className="menu-stat-value">{playerStats.bestScore.toLocaleString()}</span>
              <span className="menu-stat-label">Mejor Score</span>
            </div>
            <div className="menu-stat-card">
              <span className="menu-stat-icon">🎮</span>
              <span className="menu-stat-value">{playerStats.gamesPlayed}</span>
              <span className="menu-stat-label">Partidas</span>
            </div>
            <div className="menu-stat-card">
              <span className="menu-stat-icon">🎯</span>
              <span className="menu-stat-value">{accuracy}%</span>
              <span className="menu-stat-label">Precisión</span>
            </div>
            <div className="menu-stat-card">
              <span className="menu-stat-icon">🏅</span>
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
              🏆 Top 3 — {isHard ? "Difícil" : "Fácil"}
              {SUPABASE_ENABLED && <span className="menu-global-badge">🌐 Global</span>}
            </p>
            {top3Loading ? (
              <div className="menu-top3-empty">
                <span style={{fontSize:"1.2rem"}}>⏳</span>
                <p>Cargando ranking…</p>
              </div>
            ) : top3.length === 0 ? (
              <div className="menu-top3-empty">
                <span>🎯</span>
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
            <p className="menu-section-label">📊 Banco de preguntas</p>
            {hasCustom && customMeta ? (
              <div className="menu-bank-active">
                <span>📂</span>
                <div className="menu-bank-info">
                  <span className="menu-bank-name">{customMeta.name}</span>
                  <span className="menu-bank-count">{customMeta.count} preguntas · <span className="menu-no-lb">no cuenta para ranking</span></span>
                </div>
                <div className="menu-bank-actions">
                  <button id="import-change-btn-r" className="btn btn-sm btn-ghost" title="Cambiar archivo" onClick={() => setShowImporter(true)}>🔄</button>
                  <button id="import-clear-btn-r"  className="btn btn-sm btn-ghost" title="Usar banco base"  onClick={handleClearCustom}>✕</button>
                </div>
              </div>
            ) : (
              <button id="open-importer-btn-r" className="menu-bank-upload" onClick={() => setShowImporter(true)}>
                <span>📊</span>
                <div>
                  <span className="menu-bank-upload-title">Importar desde Excel</span>
                  <span className="menu-bank-upload-sub">Carga tu propio banco de preguntas</span>
                </div>
                <span className="menu-bank-upload-arrow">→</span>
              </button>
            )}
            {!hasCustom && (
              <div className="menu-bank-base">
                ✅ Banco oficial · <strong>200 preguntas</strong>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modales */}
      {showLb       && <Leaderboard     onClose={() => setShowLb(false)}       initialMode={difficulty} />}
      {showRules    && <RulesModal      onClose={() => setShowRules(false)}     difficulty={difficulty} />}
      {showImporter && <QuestionImporter onClose={() => setShowImporter(false)} onImported={handleImported} />}

      {/* Botón flotante estilo WhatsApp para scroll */}
      <button className="menu-fab-scroll" onClick={handleScrollDown} aria-label="Desplazarse hacia abajo">
        {isAtBottom ? <ChevronUp /> : <ChevronDown />}
      </button>
    </div>
  );
}
