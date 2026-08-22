import { useEffect, useRef } from "react";
import { renderSnakeSegment } from "../utils/renderHelpers";
import { SKIN_CATALOG } from "../utils/shopStore";

const CELL = 25; // Slightly larger for better visibility
const SPEED = 120; // ms per step

function randomDir() {
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 },
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

export default function MaintenanceCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Ajustar al contenedor
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cols = () => Math.floor(canvas.width / CELL);
    const rows = () => Math.floor(canvas.height / CELL);

    // Inicializar una serpiente por cada skin
    let snakes = SKIN_CATALOG.map((skin, index) => {
      // Posición aleatoria inicial
      const startX = Math.floor(Math.random() * (cols() - 10)) + 5;
      const startY = Math.floor(Math.random() * (rows() - 10)) + 5;
      const initialDir = randomDir();
      
      const segments = [];
      const length = 5 + Math.floor(Math.random() * 5); // 5 to 9 segments
      for (let i = 0; i < length; i++) {
        segments.push({ x: startX - (initialDir.x * i), y: startY - (initialDir.y * i) });
      }

      return {
        skinId: skin.id,
        baseColor: [
          "#ef4444", "#f97316", "#eab308", "#22c55e",
          "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
          "#a855f7", "#d946ef", "#f43f5e", "#94a3b8"
        ][index % 12],
        segments: segments,
        dir: initialDir,
        nextDir: initialDir,
        changeDirTimer: Math.floor(Math.random() * 15),
        food: {
          x: 1 + Math.floor(Math.random() * (cols() - 2)),
          y: 1 + Math.floor(Math.random() * (rows() - 2)),
        }
      };
    });

    const step = () => {
      snakes.forEach(snake => {
        // AI logic for this snake
        const head = snake.segments[0];
        const dx = snake.food.x - head.x;
        const dy = snake.food.y - head.y;

        snake.changeDirTimer--;
        if (snake.changeDirTimer <= 0) {
          snake.changeDirTimer = 5 + Math.floor(Math.random() * 12);
          const options = [];
          if (dx > 0) options.push({ x: 1, y: 0 });
          if (dx < 0) options.push({ x: -1, y: 0 });
          if (dy > 0) options.push({ x: 0, y: 1 });
          if (dy < 0) options.push({ x: 0, y: -1 });
          
          // Prevenir que se devuelva instantáneamente (180 grados)
          const validOptions = options.filter(opt => !(opt.x === -snake.dir.x && opt.y === -snake.dir.y));
          
          if (validOptions.length > 0) {
            snake.nextDir = validOptions[Math.floor(Math.random() * validOptions.length)];
          } else {
             // Si no hay opción válida hacia la comida, escoge al azar pero no se devuelve
             let rDir = randomDir();
             while (rDir.x === -snake.dir.x && rDir.y === -snake.dir.y) rDir = randomDir();
             snake.nextDir = rDir;
          }
        }

        snake.dir = snake.nextDir;
        const newHead = { x: head.x + snake.dir.x, y: head.y + snake.dir.y };

        // Wrap around
        newHead.x = ((newHead.x % cols()) + cols()) % cols();
        newHead.y = ((newHead.y % rows()) + rows()) % rows();

        snake.segments = [newHead, ...snake.segments.slice(0, snake.segments.length - 1)];

        // Eat food
        if (newHead.x === snake.food.x && newHead.y === snake.food.y) {
          snake.food = {
            x: 1 + Math.floor(Math.random() * (cols() - 2)),
            y: 1 + Math.floor(Math.random() * (rows() - 2)),
          };
          snake.segments.push({...snake.segments[snake.segments.length - 1]}); // grow
        }
      });
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

      // Efecto rastro o limpiar
      ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
      ctx.fillRect(0, 0, W, H);

      // Grid muy sutil
      ctx.strokeStyle = "rgba(255,255,255,0.015)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= cols(); c++) {
        ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
      }
      for (let r = 0; r <= rows(); r++) {
        ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
      }

      const pulse = 1 + 0.2 * Math.sin(t / 400);

      snakes.forEach(snake => {
        // Draw food
        const fx = snake.food.x * CELL + CELL / 2;
        const fy = snake.food.y * CELL + CELL / 2;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = snake.baseColor;
        ctx.beginPath();
        ctx.arc(fx, fy, (CELL / 2 - 3) * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw snake
        const len = snake.segments.length;
        snake.segments.forEach((seg, i) => {
          const isHead = i === 0;
          const x = seg.x * CELL;
          const y = seg.y * CELL;
          
          let segDir = snake.dir;
          if (!isHead && i > 0) {
             segDir = { x: snake.segments[i-1].x - seg.x, y: snake.segments[i-1].y - seg.y };
          }

          // Transparencia global para que sean sutiles en el fondo
          const alpha = isHead ? 0.8 : Math.max(0.15, (0.7 * (1 - i / len)));
          ctx.globalAlpha = alpha;
          
          renderSnakeSegment(ctx, snake.skinId, isHead, x, y, CELL, t, i, snake.baseColor, segDir);
        });
      });

      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
}
