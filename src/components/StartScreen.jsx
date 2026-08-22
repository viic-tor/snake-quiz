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
import PowerupModal from "./PowerupModal";
import QuestionImporter from "./QuestionImporter";
import MenuSnakeCanvas from "./MenuSnakeCanvas";
import { DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";
import { getCustomMeta, hasCustomQuestions, clearCustomQuestions } from "../utils/questionStore";
import { getLeaderboardLocal, getLeaderboard } from "../utils/leaderboard";
import { SUPABASE_ENABLED, loginPlayer, registerPlayer } from "../utils/supabase";
import { getPlayerStats, syncAllPlayerStats, getAccuracy } from "../utils/playerStats";
import { getPlayerEconomy, savePlayerEconomy } from "../utils/shopStore";
import { Settings, Circle, AlertTriangle, BookOpen, Crown, Flame, Gamepad2, Brain, Heart, Zap, BarChart2, Skull, Sparkles, Loader2, Lightbulb, TrendingUp, Target, Medal, FolderOpen, RefreshCw, X, ArrowRight, CheckCircle, Worm, Cloud, ShoppingCart, Shirt, Coins } from "lucide-react";
import ShopModal from "./ShopModal";
import SkinsModal from "./SkinsModal";

export default function StartScreen({ onStart }) {
  const [name,           setName]           = useState(() => localStorage.getItem("snake-quiz-last-name") || "");
  const [password,       setPassword]       = useState("");
  const [authLoading,    setAuthLoading]    = useState(false);
  const [difficulty,     setDifficulty]     = useState("easy");
  const [answerCount,    setAnswerCount]    = useState(4);
  const [snakeColor,     setSnakeColor]     = useState(() => localStorage.getItem("snake-quiz-last-skin") || "google");
  const [isShopOpen,     setIsShopOpen]     = useState(false);
  const [isSkinsOpen,    setIsSkinsOpen]    = useState(false);
  const [showLb,         setShowLb]         = useState(false);
  const [showRules,      setShowRules]      = useState(false);
  const [showPowerups,   setShowPowerups]   = useState(false);
  const [showImporter,   setShowImporter]   = useState(false);
  const [customMeta,     setCustomMeta]     = useState(() => getCustomMeta());
  const [hasCustom,      setHasCustom]      = useState(() => hasCustomQuestions());
  const [error,          setError]          = useState("");
  const [top3,           setTop3]           = useState([]);
  const [top3Loading,    setTop3Loading]    = useState(true);
  const [playerStats,    setPlayerStats]    = useState(() => getPlayerStats(localStorage.getItem("snake-quiz-last-name") || "", "easy"));
  const [statsLoading,   setStatsLoading]   = useState(false);
  const [profileLoadedMsg, setProfileLoadedMsg] = useState("");
  const [economy,        setEconomy]        = useState(() => getPlayerEconomy(localStorage.getItem("snake-quiz-last-name") || ""));

  const handleImported = (stats) => {
    setCustomMeta(stats || getCustomMeta());
    setHasCustom(hasCustomQuestions());
    setShowImporter(false);
  };

  const isHard = difficulty === "hard";
  const fullDifficulty = isHard ? `hard_${answerCount}` : "easy";
  const cfg    = DIFFICULTY_CONFIG[difficulty];

  // Cargar top 3 usando Supabase si está activo, si no localStorage
  useEffect(() => {
    setTop3Loading(true);
    getLeaderboard(fullDifficulty)
      .then((board) => {
        setTop3(board.slice(0, 3));
      })
      .catch(() => {
        setTop3(getLeaderboardLocal(fullDifficulty).slice(0, 3));
      })
      .finally(() => setTop3Loading(false));
  }, [fullDifficulty]);

  // Cargar estadísticas locales al cambiar nombre o modo
  useEffect(() => {
    const trimmed = name.trim();
    setPlayerStats(getPlayerStats(trimmed, fullDifficulty));
    setEconomy(getPlayerEconomy(trimmed));
  }, [name, fullDifficulty]);

  const handleLoadProfile = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Por favor ingresa tu nombre.");
      return;
    }
    
    if (SUPABASE_ENABLED) {
      if (!password) { 
        setError("Debes ingresar una contraseña (PIN) para cargar."); 
        return; 
      }
      
      setStatsLoading(true);
      setProfileLoadedMsg("");
      setError("");
      
      try {
        const userData = await loginPlayer(trimmed, password);
        if (userData) {
          const loadedEco = { 
            coins: userData.coins || 0, 
            unlockedSkins: userData.unlocked_skins || ['google'],
            baseColor: userData.base_color || '#4ade80'
          };
          savePlayerEconomy(trimmed, loadedEco);
          setEconomy(loadedEco);
        }
      } catch (err) {
        setStatsLoading(false);
        setError(err.message === "Usuario no encontrado." ? "El perfil no existe." : "Contraseña incorrecta.");
        return;
      }
      
      const hasData = await syncAllPlayerStats(trimmed);
      
      // Refrescar las estadísticas locales para la vista actual
      setPlayerStats(getPlayerStats(trimmed, fullDifficulty));
      setStatsLoading(false);
      
      if (hasData) {
        setProfileLoadedMsg("¡Perfil cargado!");
      } else {
        setError("Aún no tienes estadísticas guardadas. ¡Juega una partida!");
      }
      setTimeout(() => setProfileLoadedMsg(""), 4000);
    }
  };

  const handleStart = async (e) => {
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
            const newUserData = await registerPlayer(trimmed, password);
            if (newUserData) {
               const initEco = { coins: 0, unlockedSkins: ['google'], baseColor: '#4ade80' };
               savePlayerEconomy(trimmed, initEco);
               setEconomy(initEco);
            }
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
    localStorage.setItem("snake-quiz-last-skin", snakeColor);
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
      <MenuSnakeCanvas color={isHard ? "#ff6b35" : "#00ff88"} skinId={snakeColor} baseColor={economy.baseColor} />

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

          {/* Menús secundarios agrupados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {/* Primera fila: Tienda y Skins */}
            <div className="menu-secondary">
              <button className="btn btn-secondary" onClick={() => setIsShopOpen(true)}>
                <span className="icon-wrap icon-pulse" style={{marginRight: 4, color: '#facc15'}}><ShoppingCart size={16}/></span> Tienda
              </button>
              <button className="btn btn-secondary" onClick={() => setIsSkinsOpen(true)}>
                <span className="icon-wrap icon-shine" style={{marginRight: 4, color: '#38bdf8'}}><Shirt size={16}/></span> Skins
              </button>
            </div>
            
            {/* Segunda fila: Reglas, Modificadores, Ranking */}
            <div className="menu-secondary section-botones-secundarios">
              <button id="show-rules-btn" className="btn btn-secondary" onClick={() => setShowRules(true)}>
                <span className="icon-wrap icon-rotate-hover" style={{marginRight: 4}}><BookOpen size={16}/></span> Reglas
              </button>
              <button id="show-powerups-btn" className="btn btn-secondary" onClick={() => setShowPowerups(true)}>
                <span className="icon-wrap icon-pulse" style={{marginRight: 4, color: '#a855f7'}}><Zap size={16}/></span> Modifs
              </button>
              <button id="show-lb-full-btn" className="btn btn-secondary" onClick={() => setShowLb(true)}>
                <span className="icon-wrap icon-shine" style={{marginRight: 4}}><Crown size={16}/></span> Ranking
              </button>
            </div>
          </div>
        </aside>

        {/* ══ COLUMNA CENTRO — Hero ══ */}
        <main id="section-center" className="menu-col menu-col-center">

          {/* Logo */}
          <div className="menu-logo">
            <div className={`menu-logo-icon ${isHard ? "menu-logo-hard" : ""}`}>
              {isHard ? <span className="icon-wrap icon-flicker"><Flame /></span> : <span className="icon-wrap icon-float">🐍</span>}
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
          <form className="menu-form" onSubmit={handleStart} noValidate>
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
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleLoadProfile}
                    disabled={statsLoading || !name.trim()}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    {statsLoading ? <><span className="icon-wrap icon-spin-slow" style={{marginRight: 4}}><Loader2 size={14}/></span> Cargando...</> : <><span className="icon-wrap" style={{marginRight: 4}}><Cloud size={14}/></span> Cargar Perfil</>}
                  </button>
                  {profileLoadedMsg && (
                    <span style={{ fontSize: '0.75rem', color: '#00ff88' }}>{profileLoadedMsg}</span>
                  )}
                </div>
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

          {/* Tus estadísticas personales y HUD Monedas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <p className="menu-col-title" style={{ margin: 0 }}>
              <span className="icon-wrap"><TrendingUp /></span> Tus Estadísticas
            </p>
            <div className="menu-coins-hud" style={{ position: 'static', padding: '6px 12px', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', border: '1px solid rgba(250,204,21,0.3)' }}>
              <span className="icon-wrap icon-pulse" style={{ color: '#facc15', marginRight: '6px' }}><Coins size={16}/></span>
              <span className="menu-coins-amount" style={{ fontSize: '1rem', color: '#facc15', fontWeight: 'bold' }}>{economy.coins}</span>
            </div>
          </div>
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
      {showRules    && <RulesModal      onClose={() => setShowRules(false)}     difficulty={difficulty} answerCount={answerCount} />}
      {showPowerups && <PowerupModal    onClose={() => setShowPowerups(false)}  difficulty={difficulty} answerCount={answerCount} />}
      {showImporter && <QuestionImporter onClose={() => setShowImporter(false)} onImported={handleImported} />}
      {isShopOpen && (
        <ShopModal 
          playerName={name} 
          currentSkin={snakeColor} 
          onSelectSkin={(skinId) => {
            setSnakeColor(skinId);
            localStorage.setItem("snake-quiz-last-skin", skinId);
          }} 
          onClose={() => {
            setIsShopOpen(false);
            setEconomy(getPlayerEconomy(name.trim()));
          }} 
        />
      )}
      {isSkinsOpen && (
        <SkinsModal 
          playerName={name} 
          currentSkin={snakeColor}
          baseColor={economy.baseColor}
          onSelectSkin={(skinId) => {
            setSnakeColor(skinId);
            localStorage.setItem("snake-quiz-last-skin", skinId);
          }}
          onColorChange={(newColor) => {
             const newEco = { ...economy, baseColor: newColor };
             savePlayerEconomy(name.trim(), newEco);
             setEconomy(newEco);
          }}
          onClose={() => setIsSkinsOpen(false)} 
        />
      )}
    </div>
  );
}
