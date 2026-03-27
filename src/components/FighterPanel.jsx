import { useState, useRef, useEffect } from 'react';
import MeterBar from './MeterBar.jsx';
import ActionButtons from './ActionButtons.jsx';
import { STANCES } from '../utils/defaults.js';

const METER_COLORS = {
  health:   '#e05555',
  stamina:  '#d4a017',
  momentum: '#4a9ede',
};

export default function FighterPanel({
  fighter,
  fighterIndex,
  settings,
  opponentName,
  onAction,
  onToggleGuard,
  onNameChange,
  onStanceChange,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(fighter.name);
  const nameInputRef = useRef(null);

  // Sync local input if fighter name changed externally
  useEffect(() => {
    if (!editingName) setNameInput(fighter.name);
  }, [fighter.name, editingName]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const commitName = () => {
    const trimmed = nameInput.trim() || `Fighter ${fighterIndex + 1}`;
    onNameChange(fighterIndex, trimmed);
    setEditingName(false);
  };

  const momentumFull = fighter.momentum >= settings.maxMomentum;
  const staminaDepleted = fighter.stamina <= 0;

  const panelClass = [
    'fighter-panel',
    `fighter-panel-${fighterIndex}`,
    staminaDepleted ? 'fighter-panel-stamina0' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={panelClass}>
      {/* ── Name & Guard Break ─────────────────────────── */}
      <div className="panel-header">
        <div className="name-area">
          {editingName ? (
            <input
              ref={nameInputRef}
              className="name-input"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') {
                  setNameInput(fighter.name);
                  setEditingName(false);
                }
              }}
              maxLength={24}
            />
          ) : (
            <button
              className="name-btn"
              onClick={() => setEditingName(true)}
              title="Tap to rename"
            >
              {fighter.name}
              <span className="name-edit-icon">✎</span>
            </button>
          )}
        </div>

        <button
          className={`guard-btn${fighter.guardBroken ? ' guard-broken' : ''}`}
          onClick={() => onToggleGuard(fighterIndex)}
          title="Toggle guard break"
        >
          {fighter.guardBroken ? '🛡 GUARD BROKEN' : '🛡 Guard OK'}
        </button>
      </div>

      {/* ── Power Turn Banner ──────────────────────────── */}
      {fighter.powerTurnAvailable && (
        <button
          className="power-turn-banner"
          onClick={() => onAction(fighterIndex, 'spendMomentum')}
          title="Tap to spend momentum (resets MO to 0)"
        >
          ⚡ POWER TURN — tap to spend
        </button>
      )}

      {/* ── Stamina depleted warning ───────────────────── */}
      {staminaDepleted && (
        <div className="stamina-warning">
          ⚠ STAMINA DEPLETED — Move / Attack / Swap / Stance unavailable
        </div>
      )}

      {/* ── Meters ────────────────────────────────────── */}
      <div className="meters">
        <MeterBar
          label="HP"
          current={fighter.health}
          max={settings.maxHealth}
          color={METER_COLORS.health}
        />
        <MeterBar
          label="ST"
          current={fighter.stamina}
          max={settings.maxStamina}
          color={METER_COLORS.stamina}
        />
        <MeterBar
          label="MO"
          current={fighter.momentum}
          max={settings.maxMomentum}
          color={METER_COLORS.momentum}
          isPulsing={momentumFull}
        />
      </div>

      {/* ── Stance selector ───────────────────────────── */}
      <div className="stance-row">
        {STANCES.map(s => {
          const isActive = (fighter.stance ?? 'mid') === s;
          const disabled = staminaDepleted && !isActive;
          return (
            <button
              key={s}
              className={[
                'stance-btn',
                isActive   ? 'stance-btn-active'   : '',
                disabled   ? 'stance-btn-disabled'  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => !isActive && !disabled && onStanceChange(fighterIndex, s)}
              title={isActive ? `Current stance: ${s}` : staminaDepleted ? 'Cannot change stance — stamina depleted' : `Switch to ${s} stance (ST${settings.actionCosts.staminaAbove0.stance?.stamina ?? -2})`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ── Actions ───────────────────────────────────── */}
      <ActionButtons
        fighter={fighter}
        settings={settings}
        onAction={(key) => onAction(fighterIndex, key)}
      />
    </div>
  );
}
