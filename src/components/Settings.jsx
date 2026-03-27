import { ACTION_LABELS, ACTION_ORDER } from '../utils/defaults.js';

const STAT_LABELS = { stamina: 'ST', momentum: 'MO', health: 'HP' };
const STATS = ['stamina', 'momentum', 'health'];

export default function Settings({
  settings,
  onUpdateMax,
  onUpdateSwapOpponent,
  onUpdateActionCost,
  onBack,
}) {
  return (
    <div className="screen settings-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="screen-title">Settings — Rules & Values</h1>
      </div>

      <div className="settings-body">
        {/* ── Section 1: Meter Maximums ─────────────────── */}
        <section className="settings-section">
          <h2 className="section-heading">Meter Maximums</h2>
          <div className="settings-row">
            {[
              { key: 'health',   label: 'Health max',   color: '#e05555' },
              { key: 'stamina',  label: 'Stamina max',  color: '#d4a017' },
              { key: 'momentum', label: 'Momentum max', color: '#4a9ede' },
            ].map(({ key, label, color }) => (
              <label key={key} className="settings-field">
                <span className="settings-field-label" style={{ color }}>{label}</span>
                <input
                  className="settings-input"
                  type="number"
                  min="1"
                  max="99"
                  value={settings[`max${key.charAt(0).toUpperCase() + key.slice(1)}`]}
                  onChange={e => onUpdateMax(key, e.target.value)}
                />
              </label>
            ))}
            <label className="settings-field">
              <span className="settings-field-label" style={{ color: '#4a9ede' }}>Swap opp. MO</span>
              <input
                className="settings-input"
                type="number"
                min="-99"
                max="99"
                value={settings.swapOpponentMomentum}
                onChange={e => onUpdateSwapOpponent(e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* ── Section 2: Action Costs ───────────────────── */}
        {['staminaAbove0', 'staminaAt0'].map(table => (
          <section key={table} className="settings-section">
            <h2 className="section-heading">
              Action Costs — {table === 'staminaAbove0' ? 'Stamina > 0' : 'Stamina = 0'}
            </h2>
            <div className="cost-table">
              {/* Header */}
              <div className="cost-row cost-header">
                <span className="cost-action-col">Action</span>
                {STATS.map(s => (
                  <span key={s} className="cost-stat-col">{STAT_LABELS[s]}</span>
                ))}
              </div>
              {/* Rows */}
              {ACTION_ORDER.filter(key => key in (settings.actionCosts[table] ?? {})).map(key => (
                <div key={key} className="cost-row">
                  <span className="cost-action-col">{ACTION_LABELS[key]}</span>
                  {STATS.map(stat => (
                    <input
                      key={stat}
                      className="cost-input"
                      type="number"
                      min="-99"
                      max="99"
                      value={settings.actionCosts[table][key][stat]}
                      onChange={e => onUpdateActionCost(table, key, stat, e.target.value)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
