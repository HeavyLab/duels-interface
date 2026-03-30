import { deriveCombatStats } from '../game/engine';
import { WEAPON_OPTIONS, WEAPONS } from '../game/data/weapons';
import { WEIGHT_CLASS_OPTIONS, WEIGHT_CLASSES } from '../game/data/weightClasses';
import type { PlayerLoadout } from '../game/types';

interface PlayerLoadoutCardProps {
  playerIndex: 0 | 1;
  loadout: PlayerLoadout;
  onUpdate: (playerIndex: 0 | 1, field: keyof PlayerLoadout, value: string) => void;
}

export function PlayerLoadoutCard({
  playerIndex,
  loadout,
  onUpdate
}: PlayerLoadoutCardProps): JSX.Element {
  const preview = deriveCombatStats(loadout);

  return (
    <section className="panel loadout-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Player {playerIndex + 1}</p>
          <h2>{loadout.name || `Player ${playerIndex + 1}`}</h2>
        </div>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input
          className="text-input"
          value={loadout.name}
          maxLength={24}
          onChange={(event) => onUpdate(playerIndex, 'name', event.target.value)}
        />
      </label>

      <div className="selection-block">
        <div className="selection-block__header">
          <h3>Weight Class</h3>
          <p>Sets baseline durability, tempo, and movement cost.</p>
        </div>
        <div className="selection-grid">
          {WEIGHT_CLASS_OPTIONS.map((weightClass) => (
            <button
              key={weightClass.id}
              type="button"
              className={`choice-card ${loadout.weightClassId === weightClass.id ? 'choice-card--selected' : ''}`}
              onClick={() => onUpdate(playerIndex, 'weightClassId', weightClass.id)}
            >
              <strong>{weightClass.label}</strong>
              <span>{weightClass.summary}</span>
              <small>
                HP {weightClass.modifiers.health >= 0 ? '+' : ''}
                {weightClass.modifiers.health} | STA {weightClass.modifiers.stamina >= 0 ? '+' : ''}
                {weightClass.modifiers.stamina}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div className="selection-block">
        <div className="selection-block__header">
          <h3>Weapon</h3>
          <p>Controls reach, attack costs, and how pressure converts into damage.</p>
        </div>
        <div className="selection-grid">
          {WEAPON_OPTIONS.map((weapon) => (
            <button
              key={weapon.id}
              type="button"
              className={`choice-card ${loadout.weaponId === weapon.id ? 'choice-card--selected' : ''}`}
              onClick={() => onUpdate(playerIndex, 'weaponId', weapon.id)}
            >
              <strong>{weapon.label}</strong>
              <span>{weapon.summary}</span>
              <small>Ranges: {weapon.effectiveRanges.join(' / ')}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="loadout-preview">
        <div className="stat-chip">
          <span>Health</span>
          <strong>{preview.maxHealth}</strong>
        </div>
        <div className="stat-chip">
          <span>Stamina</span>
          <strong>{preview.maxStamina}</strong>
        </div>
        <div className="stat-chip">
          <span>Momentum Cap</span>
          <strong>{preview.maxMomentum}</strong>
        </div>
        <div className="stat-chip">
          <span>Strike</span>
          <strong>{preview.strikeDamage}</strong>
        </div>
        <div className="stat-chip">
          <span>Power Strike</span>
          <strong>{preview.powerStrikeDamage}</strong>
        </div>
        <div className="stat-chip">
          <span>Reach</span>
          <strong>{WEAPONS[loadout.weaponId].effectiveRanges.join(' / ')}</strong>
        </div>
      </div>

      <div className="loadout-notes">
        <p>{WEIGHT_CLASSES[loadout.weightClassId].summary}</p>
        <p>{WEAPONS[loadout.weaponId].summary}</p>
      </div>
    </section>
  );
}
