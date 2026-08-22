/**
 * @file MenuSnakeCanvas.jsx
 * @description Canvas decorativo con una serpiente que se mueve sola en el
 * fondo del menú principal. Semi-transparente, sin interacción.
 */

import { useEffect, useRef } from "react";
import { renderSnakeSegment } from "../utils/renderHelpers";

const CELL = 20;
const SPEED = 130; // ms por paso

function randomDir() {
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 },
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

export default function MenuSnakeCanvas({ color = "#00ff88", skinId = "google", baseColor = "#4ade80" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Ajustar al contenedor
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Estado de la serpiente demo
    const cols = () => Math.floor(canvas.width / CELL);
    const rows = () => Math.floor(canvas.height / CELL);

    let snake = [
      { x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 },
      { x: 7, y: 8 }, { x: 6, y: 8 },
    ];
    let dir     = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food    = { x: 15, y: 5 };
    let changeDirTimer = 0;

    const placeFood = () => {
      food = {
        x: 1 + Math.floor(Math.random() * (cols() - 2)),
        y: 1 + Math.floor(Math.random() * (rows() - 2)),
      };
    };

    // Dirección IA simple: hacia la comida con algo de variación
    const aiDir = () => {
      const head = snake[0];
      const dx = food.x - head.x;
      const dy = food.y - head.y;

      // Cambio de dirección aleatorio ocasional
      changeDirTimer--;
      if (changeDirTimer <= 0) {
        changeDirTimer = 8 + Math.floor(Math.random() * 10);
        const options = [];
        if (dx > 0) options.push({ x: 1, y: 0 });
        if (dx < 0) options.push({ x: -1, y: 0 });
        if (dy > 0) options.push({ x: 0, y: 1 });
        if (dy < 0) options.push({ x: 0, y: -1 });
        if (options.length > 0) {
          nextDir = options[Math.floor(Math.random() * options.length)];
        }
      }
    };

    const step = () => {
      aiDir();
      dir = nextDir;

      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Wrap-around silencioso
      head.x = ((head.x % cols()) + cols()) % cols();
      head.y = ((head.y % rows()) + rows()) % rows();

      snake = [head, ...snake.slice(0, 18)]; // max 19 segmentos

      // Comer
      if (head.x === food.x && head.y === food.y) placeFood();
    };

    let animId;
    let lastStep = 0;
    let t = 0;

    const draw = (ts) => {
      animId = requestAnimationFrame(draw);
      t = ts;

      if (ts - lastStep > SPEED) {
        step();
        lastStep = ts;
      }

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Grid muy sutil
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= cols(); c++) {
        ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
      }
      for (let r = 0; r <= rows(); r++) {
        ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
      }

      // Comida
      const fx = food.x * CELL + CELL / 2;
      const fy = food.y * CELL + CELL / 2;
      const pulse = 1 + 0.2 * Math.sin(t / 400);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(fx, fy, (CELL / 2 - 3) * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Serpiente
      const len = snake.length;
      snake.forEach((seg, i) => {
        const isHead = i === 0;
        const x = seg.x * CELL;
        const y = seg.y * CELL;
        
        let segDir = dir;
        if (!isHead && i > 0) {
           segDir = { x: snake[i-1].x - seg.x, y: snake[i-1].y - seg.y };
        }

        const alpha = isHead ? 0.65 : Math.max(0.1, (0.55 * (1 - i / len)));
        ctx.globalAlpha = alpha;
        
        renderSnakeSegment(ctx, skinId, isHead, x, y, CELL, t, i, baseColor, segDir);
      });

      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [color, skinId, baseColor]);

  return (
    <canvas
      ref={canvasRef}
      className="menu-bg-canvas"
      aria-hidden="true"
    />
  );
}
