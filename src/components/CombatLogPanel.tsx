import type { CombatLogEntry } from '../game/types';

interface CombatLogPanelProps {
  entries: CombatLogEntry[];
  onClear: () => void;
}

export function CombatLogPanel({ entries, onClear }: CombatLogPanelProps): JSX.Element {
  return (
    <section className="panel combat-log">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Combat Log</p>
          <h2>Resolved actions</h2>
        </div>
        <button className="button button--ghost" type="button" onClick={onClear}>
          Clear Log
        </button>
      </div>

      <div className="combat-log__list">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <article key={entry.id} className="log-entry">
              <div className="log-entry__header">
                <div>
                  <strong>
                    Turn {entry.turn}: {entry.actorName} used {entry.actionLabel}
                  </strong>
                  <p>{entry.createdAt}</p>
                </div>
                <span>
                  {entry.rangeBefore} {'->'} {entry.rangeAfter}
                </span>
              </div>

              <p className="log-entry__summary">{entry.summary}</p>
              <ul className="log-entry__details">
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>

              <div className="log-entry__resources">
                {entry.resourceChanges.map((change) => (
                  <div key={change.playerId} className="log-entry__resource-card">
                    <strong>{change.playerName}</strong>
                    <span>
                      HP {change.before.health} {'->'} {change.after.health}
                    </span>
                    <span>
                      STA {change.before.stamina} {'->'} {change.after.stamina}
                    </span>
                    <span>
                      MOM {change.before.momentum} {'->'} {change.after.momentum}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <strong>No actions resolved yet.</strong>
            <span>The duel log fills automatically as each turn is taken.</span>
          </div>
        )}
      </div>
    </section>
  );
}
