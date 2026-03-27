import { ACTION_ORDER, ACTION_LABELS, STAMINA_GATED_ACTIONS } from '../utils/defaults.js';

/**
 * Renders the action button grid for one fighter panel.
 */
export default function ActionButtons({ fighter, settings, onAction }) {
  const staminaAt0 = fighter.stamina <= 0;

  // All known action keys for the current stamina state
  const availableInTable = staminaAt0
    ? new Set(Object.keys(settings.actionCosts.staminaAt0))
    : new Set(Object.keys(settings.actionCosts.staminaAbove0));

  return (
    <div className="action-grid">
      {ACTION_ORDER.map(key => {
        const inTable = availableInTable.has(key);
        const staminaGated = STAMINA_GATED_ACTIONS.has(key) && staminaAt0;
        const disabled = staminaGated;
        const hidden = !inTable && !staminaGated;

        if (hidden) return null;

        // Cost hint
        const costs = inTable
          ? (staminaAt0 ? settings.actionCosts.staminaAt0 : settings.actionCosts.staminaAbove0)[key]
          : null;

        // spendMomentum has a fixed label regardless of cost table zeros
        const isSpendMomentum = key === 'spendMomentum';

        const parts = isSpendMomentum
          ? ['MO → 0']
          : costs
          ? [
              costs.stamina  !== 0 ? `ST${costs.stamina  > 0 ? '+' : ''}${costs.stamina}`  : null,
              costs.momentum !== 0 ? `MO${costs.momentum > 0 ? '+' : ''}${costs.momentum}` : null,
              costs.health   !== 0 ? `HP${costs.health   > 0 ? '+' : ''}${costs.health}`   : null,
              key === 'swapPosition' && settings.swapOpponentMomentum !== 0
                ? `opp MO${settings.swapOpponentMomentum > 0 ? '+' : ''}${settings.swapOpponentMomentum}`
                : null,
            ].filter(Boolean)
          : [];

        const costHint = parts.length > 0 ? parts.join(' ') : 'no cost';

        return (
          <button
            key={key}
            className={[
              'action-btn',
              disabled                  ? 'action-btn-disabled'  : '',
              key === 'attack'          ? 'action-btn-attack'    : '',
              key === 'startOfTurn'     ? 'action-btn-start'     : '',
              key === 'spendMomentum'   ? 'action-btn-momentum'  : '',
            ].filter(Boolean).join(' ')}
            onClick={() => !disabled && onAction(key)}
            disabled={disabled}
            title={disabled ? 'Unavailable — stamina depleted' : costHint}
          >
            <span className="action-label">{ACTION_LABELS[key] ?? key}</span>
            {!disabled && costs && (
              <span className="action-cost">{costHint}</span>
            )}
            {disabled && (
              <span className="action-cost action-cost-unavail">stamina 0</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
