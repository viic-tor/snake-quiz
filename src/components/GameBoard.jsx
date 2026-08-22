/**
 * @file GameBoard.jsx
 * @description Canvas del juego responsivo.
 * Acepta `size` prop para escalar dinámicamente al espacio disponible.
 * La resolución lógica siempre es GRID_SIZE × GRID_SIZE celdas,
 * escaladas al tamaño de píxeles solicitado.
 */

import { useEffect, useRef } from "react";
import { GRID_SIZE, DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";
import PowerupIcon from "./PowerupIcon";
import { renderSnakeSegment } from "../utils/renderHelpers";
import { BIOMES } from "../data/biomes";
const LOGICAL = 400; // resolución interna fija (20 × 20px)
const CELL    = LOGICAL / GRID_SIZE; // 20px

function draw(ctx, state, t, W, snakeColor) {
  const CELL = W / GRID_SIZE;
  const isHard = state.difficulty === "hard";
  const cfg = DIFFICULTY_CONFIG[state.difficulty] || DIFFICULTY_CONFIG.easy;
  const C = { ...cfg.color };

  // Override del color de la culebra si el usuario eligió uno
  let skinId = "google";
  if (snakeColor) {
    skinId = snakeColor;
    if (skinId === "google") {
      C.snake = "#4ade80"; C.snakeDim = "#22c55e";
    } else if (skinId === "pixel") {
      C.snake = "#eab308"; C.snakeDim = "#ca8a04";
    } else if (skinId === "rainbow") {
      C.snake = "#ec4899"; C.snakeDim = "#be185d";
    } else if (skinId === "cosmic") {
      C.snake = "#c084fc"; C.snakeDim = "#7e22ce";
    } else if (skinId === "blackhole") {
      C.snake = "#111827"; C.snakeDim = "#000000";
    } else {
      C.snake    = snakeColor;
      C.snakeDim = snakeColor + "b3";
    }
  }

  // Determine baseColor from localstorage or use a default since we don't have it directly.
  // We can pass baseColor through props later, for now we will read it if needed.
  // Actually, we can get it from localstorage economy of the last played name.
  let baseColor = "#4ade80";
  try {
    const lastName = localStorage.getItem("snake-quiz-last-name");
    if (lastName) {
      const ecoStr = localStorage.getItem(`snake-quiz-economy-${lastName}`);
      if (ecoStr) {
        try {
          baseColor = JSON.parse(ecoStr).baseColor || baseColor;
        } catch(e) {}
      }
    }
  } catch (e) {}

  const hasSlowmo = state.activePowerups?.some(p => p.id === "epic_slowmo");

  const biome = BIOMES[state.biomeIndex || 0] || BIOMES[0];

  // ── Fondo ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = biome.boardBg;
  ctx.fillRect(0, 0, W, W);

  if (hasSlowmo) {
    ctx.fillStyle = "rgba(0, 200, 255, 0.08)";
    ctx.fillRect(0, 0, W, W);
  }

  // ── Flash de respuesta ────────────────────────────────────────────────────
  if (state.flashEffect) {
    const fc = state.flashEffect === "bonus-life"
      ? "rgba(255,215,0,0.15)"
      : state.flashEffect === "correct"
      ? "rgba(0,255,136,0.12)"
      : "rgba(255,77,109,0.18)";
    ctx.fillStyle = fc;
    ctx.fillRect(0, 0, W, W);
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  ctx.strokeStyle = hasSlowmo 
    ? "rgba(0,255,255,0.1)" 
    : isHard ? biome.gridHard : biome.grid;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
  }

  // ── Borde peligroso en modo difícil ──────────────────────────────────────
  if (isHard) {
    const pulse = 0.5 + 0.5 * Math.sin(t / 400);
    ctx.strokeStyle = `rgba(${biome.borderHard},${0.3 + pulse * 0.3})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, W - 2, W - 2);
    ctx.fillStyle = `rgba(${biome.borderHard},${0.4 + pulse * 0.3})`;
    const cs = 10;
    [[0,0],[W-cs,0],[0,W-cs],[W-cs,W-cs]].forEach(([x,y]) => {
      ctx.fillRect(x, y, cs, cs);
    });
  }

  // ── Comida pulsante ───────────────────────────────────────────────────────
  const { food } = state;
  const fx = food.x * CELL + CELL / 2;
  const fy = food.y * CELL + CELL / 2;
  const pulse = 1 + 0.18 * Math.sin(t / 300);
  const foodR = (CELL / 2 - 2) * pulse;

  const foodGrad = ctx.createRadialGradient(fx, fy, foodR * 0.2, fx, fy, foodR * 2.2);
  foodGrad.addColorStop(0, C.food + "66");
  foodGrad.addColorStop(1, "transparent");
  ctx.fillStyle = foodGrad;
  ctx.beginPath(); ctx.arc(fx, fy, foodR * 2.2, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = C.food;
  ctx.beginPath(); ctx.arc(fx, fy, foodR, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath(); ctx.arc(fx - foodR * 0.25, fy - foodR * 0.25, foodR * 0.3, 0, Math.PI * 2); ctx.fill();

  // ── Powerup en tablero ────────────────────────────────────────────────────
  if (state.boardPowerup) {
    const p = state.boardPowerup;
    const px = p.x * CELL + CELL / 2;
    const py = p.y * CELL + CELL / 2;
    const pPulse = 1 + 0.1 * Math.sin(t / 200);
    const pR = (CELL / 2 - 2) * pPulse;

    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pR * 2.5);
    pGrad.addColorStop(0, p.color + "88");
    pGrad.addColorStop(1, "transparent");
    ctx.fillStyle = pGrad;
    ctx.beginPath(); ctx.arc(px, py, pR * 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const ratio = Math.max(0, p.remainingDespawn / p.despawn);
    ctx.arc(px, py, pR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    ctx.stroke();
  }

  // ── Coin en tablero ───────────────────────────────────────────────────────
  if (state.boardCoin) {
    const c = state.boardCoin;
    const cx = c.x * CELL + CELL / 2;
    const cy = c.y * CELL + CELL / 2;
    const cPulse = 1 + 0.15 * Math.sin(t / 150);
    const cR = (CELL / 2 - 2) * cPulse;

    const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 2.5);
    cGrad.addColorStop(0, "#fbbf2488"); // amber-400
    cGrad.addColorStop(1, "transparent");
    ctx.fillStyle = cGrad;
    ctx.beginPath(); ctx.arc(cx, cy, cR * 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.font = `${Math.floor(CELL * 0.9 * cPulse)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🪙", cx, cy);
  }

  // ── Serpiente ─────────────────────────────────────────────────────────────
  const len = state.snake.length;
  const eyeOff = Math.max(2, CELL * 0.3);
  const eyeR   = Math.max(1.2, CELL * 0.12);

  const hasGhost = state.activePowerups?.some(p => p.id === "epic_ghost");

  state.snake.forEach((seg, i) => {
    const isHead = i === 0;
    const x = seg.x * CELL;
    const y = seg.y * CELL;
    
    // Calcular dirección
    let dir = state.dir || {x: 1, y: 0};
    if (!isHead && i > 0) {
       dir = { x: state.snake[i-1].x - seg.x, y: state.snake[i-1].y - seg.y };
    }

    let alpha = isHead ? 1 : Math.max(0.35, 1 - (i / len) * 0.6);
    if (hasGhost) alpha = isHead ? 0.7 : 0.2;
    ctx.globalAlpha = alpha;

    renderSnakeSegment(ctx, skinId, isHead, x, y, CELL, t, i, baseColor, dir);

    ctx.globalAlpha = 1;
  });

  // ── Filtro de Congelado (Slowmo) ──────────────────────────────────────────
  if (hasSlowmo) {
    ctx.fillStyle = "rgba(0, 200, 255, 0.15)";
    ctx.fillRect(0, 0, W, W);
    
    // Frost edges
    ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, W - 8, W - 8);
  }
}

export default function GameBoard({ state, size = 400, snakeColor = null }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(state);
  const animIdRef = useRef(null);
  const sizeRef   = useRef(size);

  stateRef.current = state;
  sizeRef.current  = size;

  const isHard = state.difficulty === "hard";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const render = (ts) => {
      animIdRef.current = requestAnimationFrame(render);
      draw(ctx, stateRef.current, ts, sizeRef.current, snakeColor);
    };
    animIdRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [snakeColor]);

  const cellPx = size / GRID_SIZE;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`game-canvas ${isHard ? "game-canvas-hard" : "game-canvas-easy"}`}
        aria-label="Tablero del juego Snake"
      />
      {state.boardPowerup && (
        <div style={{
          position: 'absolute',
          left: state.boardPowerup.x * cellPx,
          top: state.boardPowerup.y * cellPx,
          width: cellPx,
          height: cellPx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <PowerupIcon 
            iconId={state.boardPowerup.iconId} 
            size={cellPx * 0.7} 
            color={state.boardPowerup.color} 
          />
        </div>
      )}
    </div>
  );
}
