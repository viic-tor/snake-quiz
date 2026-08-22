import React from 'react';
import { Target, Star, Gift, Zap, CheckCircle2 } from 'lucide-react';

const TIER_COLORS = {
  common: '#b0bec5',
  rare: '#4fc3f7',
  epic: '#ce93d8',
  legendary: '#ffd54f'
};

const TIER_NAMES = {
  common: 'Común',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Legendaria'
};

const MissionHUD = ({ mission }) => {
  if (!mission) return null;

  const progressPct = Math.min(100, Math.max(0, (mission.progress / mission.target) * 100));
  const isComplete = mission.progress >= mission.target;

  return (
    <div className="mission-hud" style={{
      background: 'rgba(20, 25, 34, 0.7)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${TIER_COLORS[mission.tier]}55`,
      borderRadius: '12px',
      padding: '12px',
      marginTop: '16px',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '4px',
        background: TIER_COLORS[mission.tier]
      }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={18} color={TIER_COLORS[mission.tier]} />
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' }}>Misión</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: TIER_COLORS[mission.tier], textTransform: 'uppercase', opacity: 0.9, paddingLeft: '24px' }}>
            Rareza: {TIER_NAMES[mission.tier]}
          </span>
        </div>
        {isComplete && <CheckCircle2 size={16} color="#00e676" style={{ marginTop: '4px' }} />}
      </div>

      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
        {mission.description}
      </div>

      <div className="mission-progress-bar" style={{
        width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: TIER_COLORS[mission.tier],
          transition: 'width 0.3s ease'
        }}></div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>{mission.progress} / {mission.target}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
            <Star size={12} fill="#fbbf24" /> {mission.reward.coins}
          </span>
          {mission.reward.powerup !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#a855f7' }}>
              <Zap size={12} /> 1 Powerup
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionHUD;
