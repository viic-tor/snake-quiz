/**
 * @file GameBoard.jsx
 * @description Tablero de juego renderizado en <canvas>.
 * Dibuja la serpiente, la comida pulsante y el flash de quiz.
 * El componente se re-renderiza en cada frame vía requestAnimationFrame
 * para animar el pulso de la comida en tiempo real.
 */

import { useEffect, useRef } from "react";
import { GRID_SIZE } from "../hooks/useSnakeGame";

// Paleta de colores
const C = {
  bg: "#0d0d1a",
  gridLine: "rgba(255,255,255,0.03)",
  snakeHead: "#00ff88",
  snakeBody: "#00cc6a",
  snakeGlow: "rgba(0,255,136,0.25)",
  food: "#ff4d6d",
  foodGlow: "rgba(255,77,109,0.4)",
  flashCorrect: "rgba(0,255,136,0.12)",
  flashWrong: "rgba(255,77,109,0.15)",
  flashBonus: "rgba(255,215,0,0.15)",
};

const CELL = 20; // px — tablero de 400×400
const W = GRID_SIZE * CELL;

/** Dibuja el tablero completo en el canvas */
function draw(ctx, state, t) {
  // ── Fondo ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, W);

  // ── Flash de retroalimentación ─────────────────────────────────────────────
  if (state.flashEffect) {
    let flashColor = C.flashWrong;
    if (state.flashEffect === "correct") flashColor = C.flashCorrect;
    if (state.flashEffect === "bonus-life") flashColor = C.flashBonus;
    ctx.fillStyle = flashColor;
    ctx.fillRect(0, 0, W, W);
  }

  // ── Grid sutil ─────────────────────────────────────────────────────────────
  ctx.strokeStyle = C.gridLine;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, W);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(W, i * CELL);
    ctx.stroke();
  }

  // ── Comida pulsante ────────────────────────────────────────────────────────
  const { food } = state;
  const fx = food.x * CELL + CELL / 2;
  const fy = food.y * CELL + CELL / 2;
  const pulse = 1 + 0.18 * Math.sin(t / 300);
  const foodR = (CELL / 2 - 2) * pulse;

  // Halo exterior
  const foodGrad = ctx.createRadialGradient(fx, fy, foodR * 0.2, fx, fy, foodR * 2);
  foodGrad.addColorStop(0, C.foodGlow);
  foodGrad.addColorStop(1, "transparent");
  ctx.fillStyle = foodGrad;
  ctx.beginPath();
  ctx.arc(fx, fy, foodR * 2, 0, Math.PI * 2);
  ctx.fill();

  // Núcleo
  ctx.fillStyle = C.food;
  ctx.beginPath();
  ctx.arc(fx, fy, foodR, 0, Math.PI * 2);
  ctx.fill();

  // Brillo interior
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(fx - foodR * 0.25, fy - foodR * 0.25, foodR * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Serpiente ──────────────────────────────────────────────────────────────
  const len = state.snake.length;
  state.snake.forEach((seg, i) => {
    const isHead = i === 0;
    const x = seg.x * CELL;
    const y = seg.y * CELL;
    const alpha = isHead ? 1 : Math.max(0.35, 1 - (i / len) * 0.6);
    const r = isHead ? 7 : 4;
    const color = isHead ? C.snakeHead : C.snakeBody;

    // Glow en la cabeza
    if (isHead) {
      const glow = ctx.createRadialGradient(
        x + CELL / 2, y + CELL / 2, 0,
        x + CELL / 2, y + CELL / 2, CELL * 1.2
      );
      glow.addColorStop(0, C.snakeGlow);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x + CELL / 2, y + CELL / 2, CELL * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, r);
    } else {
      ctx.rect(x + 1, y + 1, CELL - 2, CELL - 2);
    }
    ctx.fill();

    // Ojos de la cabeza
    if (isHead) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0a0a0f";
      ctx.beginPath();
      ctx.arc(x + 7, y + 7, 2.5, 0, Math.PI * 2);
      ctx.arc(x + CELL - 7, y + 7, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function GameBoard({ state }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  const animIdRef = useRef(null);

  // Mantener ref actualizada en cada render sin recrear el loop
  stateRef.current = state;

  // Iniciar loop de animación una sola vez
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = (t) => {
      draw(ctx, stateRef.current, t);
      animIdRef.current = requestAnimationFrame(loop);
    };
    animIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animIdRef.current);
  }, []); // ← solo al montar

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={W}
      style={{
        display: "block",
        borderRadius: "12px",
        border: "1px solid rgba(0,255,136,0.15)",
        boxShadow: "0 0 40px rgba(0,255,136,0.12), 0 0 80px rgba(0,255,136,0.05)",
      }}
      aria-label="Tablero del juego Snake"
    />
  );
}
