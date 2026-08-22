import { useState, useRef, useEffect } from "react";
import { X, Shirt, Palette } from "lucide-react";
import { SKIN_CATALOG, getPlayerEconomy } from "../utils/shopStore";
import { renderSnakeSegment } from "../utils/renderHelpers";

const BASE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#a855f7", "#d946ef", "#f43f5e", "#94a3b8"
];

function StaticSkinCanvas({ skinId, baseColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CELL = 20; // Bigger cells for static preview
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const snake = [
      {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5}
    ];

    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const x = seg.x * CELL;
      const y = seg.y * CELL;
      
      let segDir = {x: 1, y: 0}; // Right by default for static 
      if (!isHead && i > 0) {
         segDir = { x: snake[i-1].x - seg.x, y: snake[i-1].y - seg.y };
      }
      
      // Pasar un valor temporal '0' ya que es una imagen estática
      renderSnakeSegment(ctx, skinId, isHead, x, y, CELL, 0, i, baseColor, segDir);
    });
  }, [skinId, baseColor]);

  return <canvas ref={canvasRef} width={140} height={140} />;
}

export default function SkinsModal({ playerName, currentSkin, baseColor, onSelectSkin, onColorChange, onClose }) {
  const [economy] = useState(() => getPlayerEconomy(playerName));
  const [showColors, setShowColors] = useState(false);

  // Filtramos solo las skins desbloqueadas
  const ownedSkins = SKIN_CATALOG.filter(s => economy.unlockedSkins.includes(s.id));

  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Inventario de Skins">
      <div className="rules-modal" style={{ maxWidth: '800px', padding: 0, overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
            <Shirt size={24} className="text-blue-400" /> Tu Armario
          </h2>
          <button className="lb-close-btn" onClick={onClose} aria-label="Cerrar modal" title="Cerrar">
            <X size={24} />
          </button>
        </div>

        {/* Skins Gallery (Horizontal Scroll) */}
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '1.5rem', 
          padding: '2rem 1.5rem',
          minHeight: '400px',
          alignItems: 'center'
        }}>
          {ownedSkins.map(skin => {
            const isEquipped = currentSkin === skin.id;
            const isBaseSkin = skin.id === "google";

            return (
              <div 
                key={skin.id}
                style={{
                  flex: '0 0 220px',
                  background: 'rgba(255,255,255,0.05)',
                  border: isEquipped ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: isEquipped ? '0 10px 25px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  transform: isEquipped ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {/* Etiqueta de equipado */}
                {isEquipped && (
                   <div style={{ position: 'absolute', top: '-12px', background: 'var(--accent)', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '999px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                     EQUIPADA
                   </div>
                )}

                {/* Botón flotante Paleta para skin base */}
                {isBaseSkin && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button 
                      onClick={() => setShowColors(!showColors)}
                      style={{
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%', width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff', transition: 'all 0.2s'
                      }}
                      title="Cambiar Color"
                    >
                      <Palette size={18} />
                    </button>

                    {/* Pop-up de colores */}
                    {showColors && (
                      <div style={{
                        position: 'absolute', top: '45px', right: '-10px',
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '12px',
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.8)', zIndex: 50
                      }}>
                        {BASE_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => {
                              onColorChange(c);
                              setShowColors(false);
                            }}
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: c, border: baseColor === c ? '2px solid #fff' : '2px solid transparent',
                              cursor: 'pointer', padding: 0
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Canvas de Preview Estático */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: '12px', 
                  width: '140px', 
                  height: '140px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <StaticSkinCanvas skinId={skin.id} baseColor={baseColor} />
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', textAlign: 'center' }}>{skin.name}</h3>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', minHeight: '40px' }}>
                  {skin.desc}
                </p>

                <button 
                  onClick={() => onSelectSkin(skin.id)}
                  disabled={isEquipped}
                  className={`btn ${isEquipped ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold' }}
                >
                  {isEquipped ? 'En uso' : 'Equipar'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
