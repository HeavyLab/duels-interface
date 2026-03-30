import { getInactivePlayer, getWeaponRangeSummary } from '../game/engine';
import type { DuelState, LegalAction, PlayerState } from '../game/types';
import { ActionGrid } from './ActionGrid';
import { CombatLogPanel } from './CombatLogPanel';
import { PlayerPanel } from './PlayerPanel';

interface DuelScreenProps {
  duel: DuelState;
  activePlayer: PlayerState;
  legalActions: LegalAction[];
  canInstall: boolean;
  onAction: (actionId: string) => void;
  onClearLog: () => void;
  onInstall: () => Promise<void>;
  onRematch: () => void;
  onReturnToSetup: () => void;
}

export function DuelScreen({
  duel,
  activePlayer,
  legalActions,
  canInstall,
  onAction,
  onClearLog,
  onInstall,
  onRematch,
  onReturnToSetup
}: DuelScreenProps): JSX.Element {
  const waitingPlayer = getInactivePlayer(duel);
  const winner = duel.winnerId ? duel.players.find((player) => player.id === duel.winnerId) ?? null : null;

  return (
    <main className="screen screen--duel">
      <section className="panel topbar">
        <div>
          <p className="eyebrow">Duel State</p>
          <h1>
            {winner ? `${winner.name} wins` : `Turn ${duel.turn}: ${activePlayer.name} to act`}
          </h1>
          <p className="topbar__copy">
            Range: <strong>{duel.range}</strong> | {activePlayer.name} threatens{' '}
            {getWeaponRangeSummary(activePlayer.weaponId)} | {waitingPlayer.name} threatens{' '}
            {getWeaponRangeSummary(waitingPlayer.weaponId)}
          </p>
        </div>
        <div className="topbar__actions">
          <button className="button button--secondary" type="button" onClick={onRematch}>
            Rematch
          </button>
          <button className="button button--ghost" type="button" onClick={onReturnToSetup}>
            Back to Setup
          </button>
          {canInstall ? (
            <button className="button button--ghost" type="button" onClick={onInstall}>
              Install
            </button>
          ) : null}
        </div>
      </section>

      <section className="duel-grid">
        <PlayerPanel
          player={duel.players[0]}
          isActive={duel.activePlayerIndex === 0 && !winner}
          isWinner={duel.winnerId === duel.players[0].id}
        />

        <section className="panel command-center">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Command Center</p>
              <h2>{winner ? 'Match Over' : `${activePlayer.name} legal actions`}</h2>
            </div>
          </div>

          <div className="command-center__summary">
            <div className="stat-chip">
              <span>Current Range</span>
              <strong>{duel.range}</strong>
            </div>
            <div className="stat-chip">
              <span>Active Guard</span>
              <strong>{activePlayer.guard}</strong>
            </div>
            <div className="stat-chip">
              <span>Stamina</span>
              <strong>{activePlayer.resources.stamina}</strong>
            </div>
            <div className="stat-chip">
              <span>Momentum</span>
              <strong>{activePlayer.resources.momentum}</strong>
            </div>
          </div>

          {winner ? (
            <div className="empty-state empty-state--large">
              <strong>{winner.name} reduced the opponent to 0 health.</strong>
              <span>Use Rematch to restart with the same loadouts, or return to setup to change rules inputs.</span>
            </div>
          ) : (
            <ActionGrid actions={legalActions} disabled={false} onSelect={onAction} />
          )}
        </section>

        <PlayerPanel
          player={duel.players[1]}
          isActive={duel.activePlayerIndex === 1 && !winner}
          isWinner={duel.winnerId === duel.players[1].id}
        />
      </section>

      <CombatLogPanel entries={duel.log} onClear={onClearLog} />
    </main>
  );
}
