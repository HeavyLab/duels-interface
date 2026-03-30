import { useState } from 'react';
import { WEIGHT_CLASSES, WEAPONS } from '../utils/defaults.js';

const WC_KEYS = Object.keys(WEIGHT_CLASSES);
const WPN_KEYS = Object.keys(WEAPONS);

function FighterSetup({ index, config, onChange }) {
  const wc  = WEIGHT_CLASSES[config.weightClass];
  const wpn = WEAPONS[config.weapon];

  return (
    <div className={`setup-fighter setup-fighter-${index}`}>
      <h2 className="setup-fighter-title">Fighter {index + 1}</h2>

      {/* Name */}
      <div className="setup-field">
        <label className="setup-label">Name</label>
        <input
          className="setup-name-input"
          type="text"
          maxLength={24}
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder={`Fighter ${index + 1}`}
        />
      </div>

      {/* Weight Class */}
      <div className="setup-field">
        <label className="setup-label">Weight Class</label>
        <div className="setup-btn-row">
          {WC_KEYS.map(k => (
            <button
              key={k}
              className={`setup-option-btn${config.weightClass === k ? ' setup-option-active' : ''}`}
              onClick={() => onChange({ weightClass: k })}
            >
              {WEIGHT_CLASSES[k].label}
            </button>
          ))}
        </div>
        <div className="setup-class-info">
          <div className="setup-class-stats">
            <span style={{ color: '#e05555' }}>HP {wc.maxHealth}</span>
            <span style={{ color: '#d4a017' }}>ST {wc.maxStamina}</span>
            <span style={{ color: '#c080e0' }}>Guard {wc.maxGuard}</span>
          </div>
          <div className="setup-class-special">{wc.specialRule}</div>
        </div>
      </div>

      {/* Weapon */}
      <div className="setup-field">
        <label className="setup-label">Weapon</label>
        <div className="setup-btn-row">
          {WPN_KEYS.map(k => (
            <button
              key={k}
              className={`setup-option-btn${config.weapon === k ? ' setup-option-active' : ''}`}
              onClick={() => onChange({ weapon: k })}
            >
              {WEAPONS[k].label}
            </button>
          ))}
        </div>
        <div className="setup-weapon-info">
          <div className="setup-weapon-damage">
            <span>Direct block: <strong>{wpn.damage.directBlock}</strong></span>
            <span>Indirect block: <strong>{wpn.damage.indirectBlock}</strong></span>
            <span>Clean hit: <strong>{wpn.damage.cleanHit}</strong></span>
          </div>
          <div className="setup-weapon-range">
            <span>Effective: {wpn.effectiveAt.map(r => `${r} tile${r !== 1 ? 's' : ''}`).join(', ')}</span>
            {wpn.lessEffectiveAt?.length > 0 && (
              <span>Less effective: {wpn.lessEffectiveAt.map(r => `${r} tile${r !== 1 ? 's' : ''}`).join(', ')}</span>
            )}
            {wpn.cleanHitMomentumBonus && (
              <span className="setup-weapon-note">+{wpn.cleanHitMomentumBonus} MO to attacker on clean hit</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupScreen({ onStart }) {
  const [configs, setConfigs] = useState([
    { name: 'Fighter 1', weightClass: 'medium', weapon: 'sword' },
    { name: 'Fighter 2', weightClass: 'medium', weapon: 'sword' },
  ]);

  const updateConfig = (index, patch) => {
    setConfigs(prev => prev.map((c, i) => i === index ? { ...c, ...patch } : c));
  };

  return (
    <div className="setup-screen">
      <header className="setup-header">
        <span className="setup-title">⚔ Duels</span>
        <span className="setup-subtitle">Choose your fighters</span>
      </header>

      <div className="setup-panels">
        {configs.map((cfg, i) => (
          <FighterSetup
            key={i}
            index={i}
            config={cfg}
            onChange={patch => updateConfig(i, patch)}
          />
        ))}
      </div>

      <div className="setup-footer">
        <button
          className="setup-start-btn"
          onClick={() => onStart(configs)}
        >
          Start Duel
        </button>
      </div>
    </div>
  );
}
