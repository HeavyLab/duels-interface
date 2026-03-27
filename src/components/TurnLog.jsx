import { useState } from 'react';

export default function TurnLog({ log, onClose, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel log-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="log-header">
          <h2 className="log-title">Turn Log</h2>
          <div className="log-header-actions">
            {confirmClear ? (
              <>
                <span className="log-confirm-text">Clear all entries?</span>
                <button
                  className="btn-confirm-danger btn-sm"
                  onClick={() => { onClear(); setConfirmClear(false); }}
                >
                  Clear
                </button>
                <button
                  className="btn-cancel btn-sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn-cancel btn-sm"
                onClick={() => setConfirmClear(true)}
              >
                Clear log
              </button>
            )}
            <button className="close-btn" onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        <div className="log-entries">
          {log.length === 0 ? (
            <p className="log-empty">No actions recorded yet.</p>
          ) : (
            log.map(entry => (
              <div key={entry.id} className="log-entry">
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-fighter">{entry.fighterName}</span>
                <span className="log-sep">—</span>
                <span className="log-action">{entry.actionLabel}</span>
                <span className="log-deltas">
                  {formatDelta('HP', entry.before.health, entry.after.health)}
                  {formatDelta('ST', entry.before.stamina, entry.after.stamina)}
                  {formatDelta('MO', entry.before.momentum, entry.after.momentum)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatDelta(label, before, after) {
  return (
    <span
      key={label}
      className={`log-delta${after < before ? ' log-delta-loss' : after > before ? ' log-delta-gain' : ' log-delta-none'}`}
    >
      {label}: {before}→{after}
    </span>
  );
}
