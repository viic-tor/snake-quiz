import { useState, useEffect, useRef } from "react";
import { X, ShoppingCart, Check, Coins } from "lucide-react";
import { SKIN_CATALOG, getPlayerEconomy, buySkin } from "../utils/shopStore";
import { renderSnakeSegment } from "../utils/renderHelpers";

// Un mini canvas inofensivo para previsualizar la serpiente
function SkinPreviewCanvas({ skinId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CELL = 16;
    
    const cols = () => Math.floor(canvas.width / CELL);
    const rows = () => Math.floor(canvas.height / CELL);

    let snake = [
      {x: 6, y: 3}, {x: 5, y: 3}, {x: 4, y: 3}, {x: 3, y: 3}, {x: 2, y: 3}
    ];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 8, y: 3 };
    let changeDirTimer = 0;

    const placeFood = () => {
      food = {
        x: Math.floor(Math.random() * cols()),
        y: Math.floor(Math.random() * rows()),
      };
    };

    const aiDir = () => {
      const head = snake[0];
      const dx = food.x - head.x;
      const dy = food.y - head.y;

      changeDirTimer--;
      if (changeDirTimer <= 0) {
        changeDirTimer = 3 + Math.floor(Math.random() * 5);
        const options = [];
        if (dx > 0 && dir.x !== -1) options.push({ x: 1, y: 0 });
        if (dx < 0 && dir.x !== 1) options.push({ x: -1, y: 0 });
        if (dy > 0 && dir.y !== -1) options.push({ x: 0, y: 1 });
        if (dy < 0 && dir.y !== 1) options.push({ x: 0, y: -1 });
        if (options.length > 0) {
          nextDir = options[Math.floor(Math.random() * options.length)];
        }
      }
    };

    const step = () => {
      aiDir();
      dir = nextDir;

      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      head.x = ((head.x % cols()) + cols()) % cols();
      head.y = ((head.y % rows()) + rows()) % rows();

      snake = [head, ...snake.slice(0, 5)];

      if (head.x === food.x && head.y === food.y) placeFood();
    };

    let animationFrameId;
    let lastStep = 0;
    let t = 0;
    const SPEED = 130;

    const render = (ts) => {
      animationFrameId = requestAnimationFrame(render);
      t = ts;

      if (ts - lastStep > SPEED) {
        step();
        lastStep = ts;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid sutil
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += CELL) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += CELL) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Dibujar manzana (como moneda o roja)
      const fx = food.x * CELL + CELL / 2;
      const fy = food.y * CELL + CELL / 2;
      const pulse = 1 + 0.15 * Math.sin(t / 150);
      ctx.fillStyle = "#ff4757"; // Manzana roja
      ctx.beginPath();
      ctx.arc(fx, fy, (CELL / 2 - 2) * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Dibujar la serpiente con la skin
      const len = snake.length;
      snake.forEach((seg, i) => {
        const isHead = i === 0;
        const x = seg.x * CELL;
        const y = seg.y * CELL;
        
        let segDir = dir;
        if (!isHead && i > 0) {
           segDir = { x: snake[i-1].x - seg.x, y: snake[i-1].y - seg.y };
        }
        
        // Determinar baseColor a partir del estado economy para la skin 'google' si hiciera falta.
        // Pero no lo tenemos pasado aquí, pasaremos un verde por defecto.
        renderSnakeSegment(ctx, skinId, isHead, x, y, CELL, t, i, "#4ade80", segDir);
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [skinId]);

  return (
    <canvas 
      ref={canvasRef} 
      width={160} 
      height={120} 
      style={{ 
        background: '#0a0a0a', 
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    />
  );
}

export default function ShopModal({ playerName, currentSkin, onSelectSkin, onClose }) {
  const [economy, setEconomy] = useState(() => getPlayerEconomy(playerName));
  const [previewSkin, setPreviewSkin] = useState(currentSkin || "google");
  const [activeTab, setActiveTab] = useState("skins");

  const handleBuy = (skinId, price) => {
    if (buySkin(playerName, skinId, price)) {
      setEconomy(getPlayerEconomy(playerName));
    }
  };

  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Tienda">
      <div className="rules-modal" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Header / Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
              <ShoppingCart size={24} className="text-blue-400" /> Tienda
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setActiveTab("skins")}
                style={{
                  background: activeTab === "skins" ? 'var(--accent)' : 'transparent',
                  color: activeTab === "skins" ? '#fff' : '#9ca3af',
                  border: 'none', padding: '6px 16px', borderRadius: '999px',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >Skins</button>
              <button 
                onClick={() => setActiveTab("powerups")}
                style={{
                  background: activeTab === "powerups" ? 'var(--accent)' : 'transparent',
                  color: activeTab === "powerups" ? '#fff' : '#9ca3af',
                  border: 'none', padding: '6px 16px', borderRadius: '999px',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >Potenciadores</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(251, 191, 36, 0.1)', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <Coins size={18} className="text-amber-400 icon-pulse" />
              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>{economy.coins}</span>
            </div>
            <button className="lb-close-btn" onClick={onClose} aria-label="Cerrar modal" title="Cerrar">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Layout de 2 columnas (responsive a 1 columna en móvil) */}
        <div className="shop-layout">
          
          {/* Panel Izquierdo: Preview interactivo */}
          <div className="shop-preview-panel">
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Previsualización</h3>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}>
                 <SkinPreviewCanvas skinId={previewSkin} />
               </div>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#9ca3af', textAlign: 'center' }}>
              Selecciona un artículo de la derecha para previsualizarlo en movimiento.
            </p>
          </div>

          {/* Panel Derecho: Productos */}
          <div className="shop-products-panel">
            {activeTab === "skins" ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {SKIN_CATALOG.map(skin => {
                  const isUnlocked = economy.unlockedSkins.includes(skin.id);
                  const isEquipped = currentSkin === skin.id;

                  return (
                    <div 
                      key={skin.id}
                      onMouseEnter={() => setPreviewSkin(skin.id)}
                      onClick={() => setPreviewSkin(skin.id)}
                      style={{ 
                        background: previewSkin === skin.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                        border: previewSkin === skin.id ? '2px solid var(--accent)' : '2px solid transparent',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      {/* Badge equipado invisible en la tienda, pero util si lo queremos ver */}
                      {isEquipped && (
                         <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                           EN USO
                         </div>
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{skin.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af', minHeight: '2.4rem' }}>{skin.desc}</p>
                      </div>

                      <div style={{ marginTop: 'auto' }}>
                        {isUnlocked ? (
                          <div style={{ 
                            width: '100%', padding: '0.5rem', borderRadius: '8px', 
                            background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', 
                            textAlign: 'center', fontWeight: 'bold', border: '1px solid rgba(34, 197, 94, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}>
                            <Check size={16} /> Adquirido
                          </div>
                        ) : (
                          <button 
                            className="btn"
                            style={{ 
                              width: '100%', padding: '0.5rem', 
                              background: economy.coins >= skin.price ? '#fbbf24' : '#374151',
                              color: economy.coins >= skin.price ? '#000' : '#9ca3af',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              fontWeight: 'bold', border: 'none'
                            }}
                            onClick={(e) => { e.stopPropagation(); handleBuy(skin.id, skin.price); }}
                            disabled={economy.coins < skin.price}
                          >
                            <Coins size={16} /> {skin.price}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '1rem' }}>
                <span className="icon-wrap icon-float"><ShoppingCart size={48} /></span>
                <p>Próximamente: Compra vidas extra, tiempo adicional y escudos.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
