/**
 * @file GameBoard.jsx
 * @description Canvas del juego responsivo.
 * Acepta `size` prop para escalar dinámicamente al espacio disponible.
 * La resolución lógica siempre es GRID_SIZE × GRID_SIZE celdas,
 * escaladas al tamaño de píxeles solicitado.
 */

import { useEffect, useRef } from "react";
import { GRID_SIZE, DIFFICULTY_CONFIG } from "../hooks/useSnakeGame";

const LOGICAL = 400; // resolución interna fija (20 × 20px)
const CELL    = LOGICAL / GRID_SIZE; // 20px

function draw(ctx, state, t, W, snakeColor) {
  const CELL = W / GRID_SIZE;
  const isHard = state.difficulty === "hard";
  const cfg = DIFFICULTY_CONFIG[state.difficulty] || DIFFICULTY_CONFIG.easy;
  const C = { ...cfg.color };

  // Override del color de la culebra si el usuario eligió uno
  if (snakeColor) {
    C.snake    = snakeColor;
    // snakeDim: version más oscura del color elegido (70% de opacidad)
    C.snakeDim = snakeColor + "b3";
  }

  // ── Fondo ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = C.boardBg;
  ctx.fillRect(0, 0, W, W);

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
  ctx.strokeStyle = isHard ? "rgba(255,100,50,0.05)" : "rgba(255,255,255,0.03)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
  }

  // ── Borde peligroso en modo difícil ──────────────────────────────────────
  if (isHard) {
    const pulse = 0.5 + 0.5 * Math.sin(t / 400);
    ctx.strokeStyle = `rgba(255,50,50,${0.3 + pulse * 0.3})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, W - 2, W - 2);
    ctx.fillStyle = `rgba(255,80,50,${0.4 + pulse * 0.3})`;
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

  // ── Serpiente ─────────────────────────────────────────────────────────────
  const len = state.snake.length;
  const eyeOff = Math.max(2, CELL * 0.3);
  const eyeR   = Math.max(1.2, CELL * 0.12);

  state.snake.forEach((seg, i) => {
    const isHead = i === 0;
    const x = seg.x * CELL;
    const y = seg.y * CELL;
    const alpha = isHead ? 1 : Math.max(0.35, 1 - (i / len) * 0.6);
    const r = isHead ? Math.max(4, CELL * 0.35) : Math.max(2, CELL * 0.2);
    const color = isHead ? C.snake : C.snakeDim;

    if (isHead) {
      const glow = ctx.createRadialGradient(x+CELL/2, y+CELL/2, 0, x+CELL/2, y+CELL/2, CELL * 1.2);
      glow.addColorStop(0, color + "44");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x+CELL/2, y+CELL/2, CELL * 1.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x+1, y+1, CELL-2, CELL-2, r);
    else ctx.rect(x+1, y+1, CELL-2, CELL-2);
    ctx.fill();

    if (isHead) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0a0a0f";
      ctx.beginPath();
      ctx.arc(x + eyeOff, y + eyeOff, eyeR, 0, Math.PI * 2);
      ctx.arc(x + CELL - eyeOff, y + eyeOff, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(x + eyeOff + eyeR * 0.3, y + eyeOff - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
      ctx.arc(x + CELL - eyeOff + eyeR * 0.3, y + eyeOff - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
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

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`game-canvas ${isHard ? "game-canvas-hard" : "game-canvas-easy"}`}
      aria-label="Tablero del juego Snake"
    />
  );
}
