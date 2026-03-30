import { WEAPONS } from '../game/data/weapons';
import { WEIGHT_CLASSES } from '../game/data/weightClasses';
import { ResourceMeter } from './ResourceMeter';
import type { PlayerState } from '../game/types';

const EFFECT_LABELS: Record<string, string> = {
  focused: 'Focused',
  guarded: 'Guarded',
  exposed: 'Exposed'
};

interface PlayerPanelProps {
  player: PlayerState;
  isActive: boolean;
  isWinner: boolean;
}

export function PlayerPanel({ player, isActive, isWinner }: PlayerPanelProps): JSX.Element {
  return (
    <section className={`panel player-panel ${isActive ? 'player-panel--active' : ''}`}>
      <div className="panel__header">
        <div>
          <p className="eyebrow">{isActive ? 'Active Fighter' : 'Waiting Fighter'}</p>
          <h2>{player.name}</h2>
        </div>
        {isWinner ? <span className="victory-badge">Winner</span> : null}
      </div>

      <div className="player-panel__meta">
        <span>{WEIGHT_CLASSES[player.weightClassId].label}</span>
        <span>{WEAPONS[player.weaponId].label}</span>
        <span>Guard: {player.guard}</span>
      </div>

      <div className="player-panel__meters">
        <ResourceMeter
          label="Health"
          tone="health"
          value={player.resources.health}
          max={player.stats.maxHealth}
        />
        <ResourceMeter
          label="Stamina"
          tone="stamina"
          value={player.resources.stamina}
          max={player.stats.maxStamina}
        />
        <ResourceMeter
          label="Momentum"
          tone="momentum"
          value={player.resources.momentum}
          max={player.stats.maxMomentum}
        />
      </div>

      <div className="loadout-preview loadout-preview--compact">
        <div className="stat-chip">
          <span>Strike</span>
          <strong>{player.stats.strikeDamage}</strong>
        </div>
        <div className="stat-chip">
          <span>Power</span>
          <strong>{player.stats.powerStrikeDamage}</strong>
        </div>
        <div className="stat-chip">
          <span>Accuracy</span>
          <strong>{player.stats.accuracy >= 0 ? '+' : ''}{player.stats.accuracy}</strong>
        </div>
        <div className="stat-chip">
          <span>Exact Guard</span>
          <strong>{player.stats.exactGuardDefense}</strong>
        </div>
      </div>

      <div className="effect-row">
        {player.effects.length > 0 ? (
          player.effects.map((effect) => (
            <span
              key={effect.id}
              className={`effect-pill effect-pill--${effect.id}`}
              title={`${EFFECT_LABELS[effect.id] ?? effect.id} (${effect.remainingTurns} turns left)`}
            >
              {EFFECT_LABELS[effect.id] ?? effect.id} {effect.remainingTurns}
            </span>
          ))
        ) : (
          <span className="effect-pill effect-pill--empty">No active effects</span>
        )}
      </div>

      <div className="player-panel__notes">
        <p>{WEIGHT_CLASSES[player.weightClassId].summary}</p>
        <p>{WEAPONS[player.weaponId].summary}</p>
      </div>
    </section>
  );
}
