import { useState, useRef, useEffect } from 'react';
import MeterBar from './MeterBar.jsx';
import ActionButtons from './ActionButtons.jsx';
import { STANCES, REACHABLE_FROM, WEIGHT_CLASSES, WEAPONS, MAX_MOMENTUM } from '../utils/defaults.js';

const METER_COLORS = {
  health:   '#e05555',
  stamina:  '#d4a017',
  momentum: '#4a9ede',
};

export default function FighterPanel({
  fighter,
  fighterIndex,
  opponent,
  settings,
  onAction,
  onNameChange,
  onStanceChange,
  onIncrementGuard,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(fighter.name);
  const nameInputRef = useRef(null);

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

  const wc  = WEIGHT_CLASSES[fighter.weightClass];
  const wpn = WEAPONS[fighter.weapon];
  const momentumFull   = fighter.momentum >= MAX_MOMENTUM;
  const staminaDepleted = fighter.stamina <= 0;
  const turnDone = (fighter.actionsUsed ?? 0) >= 2;
  const maxG = wc?.maxGuard ?? 3;

  const panelClass = [
    'fighter-panel',
    `fighter-panel-${fighterIndex}`,
    staminaDepleted ? 'fighter-panel-stamina0' : '',
    turnDone ? 'fighter-panel-turn-done' : '',
  ].filter(Boolean).join(' ');

  const currentStance = fighter.stance ?? 'mid';

  return (
    <div className={panelClass}>

      {/* ── Name ─────────────────────────────────────── */}
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
                if (e.key === 'Escape') { setNameInput(fighter.name); setEditingName(false); }
              }}
              maxLength={24}
            />
          ) : (
            <button className="name-btn" onClick={() => setEditingName(true)} title="Tap to rename">
              {fighter.name}
              <span className="name-edit-icon">✎</span>
            </button>
          )}
        </div>
        <div className="fighter-class-badge">
          <span className="badge-wc">{wc?.label}</span>
          <span className="badge-wpn">{wpn?.label}</span>
        </div>
      </div>

      {/* ── Actions used counter ─────────────────────── */}
      <div className="action-counter">
        <span className="action-counter-label">Actions</span>
        <div className="action-pips">
          {[0, 1].map(i => (
            <span key={i} className={`action-pip${(fighter.actionsUsed ?? 0) > i ? ' action-pip-used' : ''}`} />
          ))}
        </div>
        {turnDone && !fighter.powerTurnAvailable && (
          <span className="action-counter-done">Turn done</span>
        )}
        {fighter.powerTurnAvailable && (fighter.actionsUsed ?? 0) < 2 && (
          <span className="action-counter-pt">⚡ Power Turn ready</span>
        )}
      </div>

      {/* ── Stamina depleted warning ─────────────────── */}
      {staminaDepleted && (
        <div className="stamina-warning">
          ST 0 — Move / Attack / Swap / Stance unavailable
        </div>
      )}

      {/* ── Meters ───────────────────────────────────── */}
      <div className="meters">
        <MeterBar label="HP" current={fighter.health}   max={wc?.maxHealth  ?? 18} color={METER_COLORS.health} />
        <MeterBar label="ST" current={fighter.stamina}  max={wc?.maxStamina ?? 18} color={METER_COLORS.stamina} />
        <MeterBar label="MO" current={fighter.momentum} max={MAX_MOMENTUM}          color={METER_COLORS.momentum} isPulsing={momentumFull} />
      </div>

      {/* ── Stance selector ──────────────────────────── */}
      <div className="stance-row">
        {STANCES.map(s => {
          const isActive   = currentStance === s;
          const reachable  = REACHABLE_FROM[currentStance]?.includes(s);
          const guardVal   = fighter.stanceGuard?.[s] ?? 0;
          const isBroken   = guardVal >= maxG;
          const canChange  = !isActive && reachable && !staminaDepleted && !turnDone;
          const notReachable = !isActive && !reachable;

          return (
            <button
              key={s}
              className={[
                'stance-btn',
                isActive      ? 'stance-btn-active'      : '',
                isBroken      ? 'stance-btn-broken'      : '',
                notReachable  ? 'stance-btn-unreachable' : '',
                !canChange && !isActive ? 'stance-btn-disabled' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => canChange && onStanceChange(fighterIndex, s)}
              title={
                isActive      ? `Current stance: ${s}` :
                notReachable  ? `Cannot reach ${s} from ${currentStance}` :
                staminaDepleted ? 'ST 0 — cannot change stance' :
                turnDone      ? 'No actions left' :
                `Switch to ${s} (ST−1)`
              }
            >
              <span className="stance-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              <span className="stance-guard-pips">
                {Array.from({ length: maxG }).map((_, i) => (
                  <span key={i} className={`guard-pip${i < guardVal ? (isBroken ? ' guard-pip-broken' : ' guard-pip-filled') : ''}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Guard reset countdown ─────────────────────── */}
      {(fighter.startTurnsToGuardReset ?? 0) > 0 && (
        <div className="guard-reset-notice">
          Guard broken — resets in <strong>{fighter.startTurnsToGuardReset}</strong> of your Start Turn{fighter.startTurnsToGuardReset > 1 ? 's' : ''}
        </div>
      )}

      {/* ── Manual guard increment (auto OFF) ────────── */}
      {settings.automaticResolution === false && (
        <div className="guard-manual-row">
          {STANCES.map(s => {
            const guardVal = fighter.stanceGuard?.[s] ?? 0;
            const isFull = guardVal >= maxG;
            return (
              <button
                key={s}
                className={`guard-inc-btn${isFull ? ' guard-inc-btn-full' : ''}`}
                onClick={() => !isFull && onIncrementGuard(fighterIndex, s)}
                disabled={isFull}
                title={isFull ? `${s} guard broken` : `+1 ${s} guard`}
              >
                +1 {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────── */}
      <ActionButtons
        fighter={fighter}
        opponent={opponent}
        settings={settings}
        onAction={(key) => onAction(fighterIndex, key)}
      />
    </div>
  );
}
