import React from 'react';
import { X, Zap, ArrowRight, Shield, Star, Crown, Focus, Box, Dna, Eye, Snowflake, Magnet } from 'lucide-react';
import { POWERUP_CONFIG } from '../hooks/useSnakeGame';
import PowerupIcon from './PowerupIcon';
export default function PowerupModal({ onClose, difficulty = "easy", answerCount = 4 }) {
  const isHard = difficulty === "hard";
  const getThresholdText = () => {
    if (!isHard) return "50 y 150pts";
    if (answerCount === 4) return "75 y 200pts";
    if (answerCount === 5) return "100 y 250pts";
    return "125 y 300pts";
  };

  const powerupsList = Object.values(POWERUP_CONFIG).sort((a, b) => {
    const rarityOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3, 'mythic': 4 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const getRarityBadge = (rarity) => {
    switch(rarity) {
      case 'common': return <span className="rule-tag" style={{ background: '#00ff8822', color: '#00ff88', border: '1px solid #00ff88' }}>Común</span>;
      case 'rare': return <span className="rule-tag" style={{ background: '#00cfff22', color: '#00cfff', border: '1px solid #00cfff' }}>Raro</span>;
      case 'epic': return <span className="rule-tag" style={{ background: '#a855f722', color: '#a855f7', border: '1px solid #a855f7' }}>Épico</span>;
      case 'legendary': return <span className="rule-tag" style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b' }}>Legendario</span>;
      case 'mythic': return <span className="rule-tag" style={{ background: '#ff2d7822', color: '#ff2d78', border: '1px solid #ff2d78' }}>Mítico</span>;
      default: return null;
    }
  };

  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Modificadores del juego">
      <div className="rules-modal">
        <div className="rules-header">
          <h2 className="rules-title">
            <span className="icon-wrap icon-pulse" style={{ color: '#a855f7', marginRight: 8 }}><Zap size={24} /></span>
            Potenciadores y Modificadores
          </h2>
          <button className="lb-close-btn" onClick={onClose} aria-label="Cerrar modal" title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="rules-content">
          
          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Star /></span> ¿Cómo funcionan?</h3>
            <p>
              A medida que acumulas puntos (entre <b>{getThresholdText()}</b>), aparecerán potenciadores aleatorios en el tablero. Recógelos para obtener increíbles ventajas, pero ten en cuenta que <b>solo duran unos segundos</b> en el mapa antes de desaparecer.
            </p>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Shield /></span> Reglas de Apilamiento (Stacking)</h3>
            <ul className="rules-list">
              <li>Solo puedes tener <b>un poder activo por cada rareza</b> al mismo tiempo.</li>
              <li>Si recoges un poder de una rareza que ya tienes activa, el nuevo <b>sobrescribirá</b> al anterior.</li>
              <li>¡Puedes combinar poderes de <b>diferentes rarezas</b> para crear sinergias!</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3><span className="icon-wrap" style={{marginRight: 4}}><Box /></span> Catálogo de Modificadores</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {powerupsList.map(p => (
                <div key={p.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderLeft: `4px solid ${p.color}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PowerupIcon iconId={p.iconId} size={24} color={p.color} />
                      <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{p.name}</strong>
                    </div>
                    {getRarityBadge(p.rarity)}
                  </div>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                  <div style={{ color: p.color, fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {p.duration ? `⏳ Duración: ${p.duration / 1000}s` : '🛡️ Efecto Pasivo (Dura hasta que se activa)'}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        <div className="rules-footer">
          <button className="btn btn-primary" onClick={onClose}>
            ¡Entendido! <span className="icon-wrap" style={{marginLeft: 4}}><ArrowRight size={18} /></span>
          </button>
        </div>

      </div>
    </div>
  );
}
