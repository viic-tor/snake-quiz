export function renderSnakeSegment(ctx, skinId, isHead, x, y, size, t, index, baseColor, dir = {x: 1, y: 0}) {
  let color = "#10b981"; 
  let dimColor = "#059669";
  
  if (skinId === "google") {
    color = baseColor || "#4ade80"; 
    // Hacerlo un poco más oscuro
    dimColor = shadeColor(color, -20);
  } else if (skinId === "pixel") {
    color = "#eab308"; dimColor = "#ca8a04";
  } else if (skinId === "rainbow") {
    const hue = (t / 10 + index * 20) % 360;
    color = `hsl(${hue}, 100%, 60%)`;
    dimColor = `hsl(${hue}, 100%, 40%)`;
  } else if (skinId === "cosmic") {
    color = "#c084fc"; dimColor = "#7e22ce";
  } else if (skinId === "blackhole") {
    color = "#111827"; dimColor = "#000000";
  } else if (skinId === "dragon") {
    color = "#b91c1c"; dimColor = "#7f1d1d";
  } else if (skinId === "cyborg") {
    color = "#64748b"; dimColor = "#475569";
  } else if (skinId === "cat") {
    color = "#f59e0b"; dimColor = "#d97706";
  }

  ctx.fillStyle = isHead ? color : dimColor;

  const cx = x + size / 2;
  const cy = y + size / 2;
  const half = size / 2;

  // Calculamos el angulo en base a la direccion para rotar detalles (ojos, hocico, etc)
  let angle = 0;
  if (dir.x === 1) angle = 0;
  else if (dir.x === -1) angle = Math.PI;
  else if (dir.y === 1) angle = Math.PI / 2;
  else if (dir.y === -1) angle = -Math.PI / 2;

  ctx.save();
  ctx.translate(cx, cy);
  if (isHead) ctx.rotate(angle);

  if (skinId === "pixel") {
    // Cuadrado retro de 8 bits
    ctx.fillRect(-half + 1, -half + 1, size - 2, size - 2);
    if (isHead) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, -half + 3, 4, 4); // ojo 1
      ctx.fillRect(0, half - 7, 4, 4);  // ojo 2
      ctx.fillStyle = "#000";
      ctx.fillRect(2, -half + 5, 2, 2);
      ctx.fillRect(2, half - 5, 2, 2);
    }
  } 
  else if (skinId === "blackhole") {
    if (isHead) {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
      glow.addColorStop(0, "rgba(0,0,0,0.8)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#000";
    }
    ctx.beginPath(); ctx.arc(0, 0, half - 1, 0, Math.PI * 2); ctx.fill();
    // Centro brilloso si no es head, estrellas alrededor si es head
    if (!isHead) {
      ctx.fillStyle = "#4c1d95";
      ctx.beginPath(); ctx.arc(0, 0, half - 4, 0, Math.PI * 2); ctx.fill();
    }
  } 
  else if (skinId === "dragon") {
    // Escamas (picos en los bordes)
    if (ctx.roundRect) {
      ctx.beginPath(); ctx.roundRect(-half + 1, -half + 1, size - 2, size - 2, 4); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, half - 1, 0, Math.PI * 2); ctx.fill();
    }
    
    // Cresta trasera
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(-half, -half + 4);
    ctx.lineTo(0, -half - 4);
    ctx.lineTo(half, -half + 4);
    ctx.fill();

    if (isHead) {
      // Cuernos
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath(); ctx.moveTo(-half + 2, -half + 2); ctx.lineTo(-half - 4, -half - 6); ctx.lineTo(-half + 6, -half); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-half + 2, half - 2); ctx.lineTo(-half - 4, half + 6); ctx.lineTo(-half + 6, half); ctx.fill();
      
      // Ojos rasgados e intimidantes
      ctx.fillStyle = "#facc15"; // Amarillo
      ctx.beginPath(); ctx.ellipse(2, -half + 5, 4, 2, Math.PI/4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(2, half - 5, 4, 2, -Math.PI/4, 0, Math.PI*2); ctx.fill();
      // Pupila raja
      ctx.fillStyle = "#000";
      ctx.fillRect(2, -half + 4, 1, 3);
      ctx.fillRect(2, half - 6, 1, 3);

      // Hocico fuego (pequeño efecto)
      ctx.fillStyle = "#f97316";
      ctx.beginPath(); ctx.arc(half, 0, 3, 0, Math.PI*2); ctx.fill();
    }
  }
  else if (skinId === "cat") {
    if (ctx.roundRect) {
      ctx.beginPath(); ctx.roundRect(-half + 1, -half + 1, size - 2, size - 2, 6); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, half - 1, 0, Math.PI * 2); ctx.fill();
    }
    
    if (isHead) {
      // Orejas
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-half + 2, -half + 2); ctx.lineTo(-half - 2, -half - 6); ctx.lineTo(0, -half + 1); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-half + 2, half - 2); ctx.lineTo(-half - 2, half + 6); ctx.lineTo(0, half - 1); ctx.fill();
      // Oreja interior
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath(); ctx.moveTo(-half + 2, -half + 2); ctx.lineTo(-half - 1, -half - 4); ctx.lineTo(-1, -half + 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-half + 2, half - 2); ctx.lineTo(-half - 1, half + 4); ctx.lineTo(-1, half - 2); ctx.fill();
      
      // Ojos grandes y tiernos
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(1, -half + 6, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1, half - 6, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(2, -half + 6, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(2, half - 6, 2, 0, Math.PI*2); ctx.fill();
      
      // Nariz pequeña
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath(); ctx.arc(half - 2, 0, 2, 0, Math.PI*2); ctx.fill();
      
      // Bigotes
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(half - 3, -half + 4); ctx.lineTo(half, -half); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(half - 3, half - 4); ctx.lineTo(half, half); ctx.stroke();
    } else {
      // Cola si es el ultimo (simplificado usando index largo)
      // Lineas tenues simulando rayas
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -half+2); ctx.lineTo(0, half-2); ctx.stroke();
    }
  }
  else if (skinId === "cyborg") {
    // Hexagono o forma de placa de metal
    ctx.fillStyle = dimColor;
    if (ctx.roundRect) {
      ctx.beginPath(); ctx.roundRect(-half + 1, -half + 1, size - 2, size - 2, 2); ctx.fill();
    } else {
      ctx.fillRect(-half + 1, -half + 1, size - 2, size - 2);
    }
    
    // Placa interior cyan
    ctx.fillStyle = color;
    ctx.fillRect(-half + 3, -half + 3, size - 6, size - 6);
    
    // Circuit line
    ctx.strokeStyle = "#22d3ee"; // Cyan neón
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-half + 4, 0); ctx.lineTo(half - 4, 0); ctx.stroke();

    if (isHead) {
      // Ojo rojo láser
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(0, -3, 6, 6);
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 10;
      ctx.fillRect(1, -2, 4, 4);
      ctx.shadowBlur = 0;
    }
  }
  else {
    // Default (Google / Rainbow / Cosmic etc)
    if (ctx.roundRect) {
      ctx.beginPath(); ctx.roundRect(-half + 1, -half + 1, size - 2, size - 2, 6); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, half - 1, 0, Math.PI * 2); ctx.fill();
    }

    if (isHead) {
      // Ojos blancos standard
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(2, -half + 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2, half - 5, 3, 0, Math.PI * 2); ctx.fill();
      
      // Pupilas negras
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(3, -half + 5, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, half - 5, 1.5, 0, Math.PI * 2); ctx.fill();
      
      // Lengua (pequeño rectangulo)
      ctx.fillStyle = "#ef4444"; // Roja
      ctx.fillRect(half - 1, -2, 4, 4);
    }

    // Estrellitas en cósmica
    if (skinId === "cosmic") {
      ctx.fillStyle = "#fff";
      // Deterministic pseudo-random based on index so it doesn't flicker wildly
      const rx = (index * 13) % size;
      const ry = (index * 7) % size;
      if (index % 3 === 0) {
        ctx.fillRect(-half + rx, -half + ry, 2, 2);
      }
    }
  }

  ctx.restore();
}

// Utilidad para oscurecer colores HEX
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  R = Math.round((R<0)?0:R);
  G = Math.round((G<0)?0:G);
  B = Math.round((B<0)?0:B);

  let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}
