import { PlayerLoadoutCard } from './PlayerLoadoutCard';
import type { PlayerLoadout } from '../game/types';

interface SetupScreenProps {
  setup: [PlayerLoadout, PlayerLoadout];
  canInstall: boolean;
  onInstall: () => Promise<void>;
  onStart: () => void;
  onUpdate: (playerIndex: 0 | 1, field: keyof PlayerLoadout, value: string) => void;
}

export function SetupScreen({
  setup,
  canInstall,
  onInstall,
  onStart,
  onUpdate
}: SetupScreenProps): JSX.Element {
  return (
    <main className="screen screen--setup">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Local-Only Combat Sandbox</p>
          <h1>Tablet-first duel state tracker for quick rules iteration.</h1>
          <p className="hero__copy">
            Pick two loadouts, start the match, and let the app enforce legal actions, resource changes,
            range, effects, and full combat history. All gameplay values live in the TypeScript data files
            under <code>src/game/data</code>.
          </p>
        </div>
        <div className="hero__actions">
          <button className="button button--primary" type="button" onClick={onStart}>
            Begin Duel
          </button>
          {canInstall ? (
            <button className="button button--secondary" type="button" onClick={onInstall}>
              Install on Tablet
            </button>
          ) : null}
        </div>
      </section>

      <section className="setup-grid">
        <PlayerLoadoutCard playerIndex={0} loadout={setup[0]} onUpdate={onUpdate} />
        <PlayerLoadoutCard playerIndex={1} loadout={setup[1]} onUpdate={onUpdate} />
      </section>
    </main>
  );
}
