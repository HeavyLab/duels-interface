import { WEIGHT_CLASSES, WEAPONS, FLOW_ATTACK_THRESHOLD } from '../utils/defaults.js';
import { getRange, getEffectiveness } from '../utils/gameLogic.js';

export default function ActionButtons({ fighter, opponent, settings, onAction }) {
  const st  = fighter.stamina;
  const mo  = fighter.momentum;
  const acts = fighter.actionsUsed ?? 0;
  const turnDone = acts >= 2;
  const staminaDepleted = st <= 0;
  const wc  = WEIGHT_CLASSES[fighter.weightClass];
  const range = getRange(fighter, opponent);
  const effectiveness = getEffectiveness(fighter.weapon, range);
  const canAttack = !staminaDepleted && !turnDone && effectiveness !== 'ineffective';
  const canSwap   = !staminaDepleted && !turnDone && range === 1 && st >= 6;

  const btn = (key, label, hint, disabled, className = '') => (
    <button
      key={key}
      className={['action-btn', className, disabled ? 'action-btn-disabled' : ''].filter(Boolean).join(' ')}
      onClick={() => !disabled && onAction(key)}
      disabled={disabled}
      title={disabled ? hint : hint}
    >
      <span className="action-label">{label}</span>
      {hint && <span className="action-cost">{hint}</span>}
    </button>
  );

  // Medium class 1st action bonus
  const medBonus = fighter.weightClass === 'medium' && acts === 0;

  // Attack stamina cost display
  let attackCost = effectiveness === 'lessEffective' ? -7 : -5;
  if (fighter.flowBonusActive) attackCost += 3;
  if (medBonus && attackCost < 0) attackCost += 1;
  const attackLabel = effectiveness === 'lessEffective' ? 'Attack (less eff.)' : 'Attack';

  // Move cost (medium bonus)
  const moveCost = (medBonus ? 0 : -1);

  const autoOff = settings.automaticResolution === false;

  return (
    <div className="action-grid">
      {/* ── Always available ─────────────────────────── */}
      {btn('startOfTurn', 'Start Turn', '+4 ST', false, 'action-btn-start')}

      {/* ── Turn actions (disabled after 2 actions) ── */}
      {btn('moveForward',  'Move Fwd', `ST${moveCost}`, staminaDepleted || turnDone)}
      {btn('moveBackward', 'Move Back', `ST${moveCost}`, staminaDepleted || turnDone)}
      {btn('attack', attackLabel,
        `ST${attackCost} MO+3` + (effectiveness === 'lessEffective' ? ' (−1 dmg)' : ''),
        !canAttack,
        'action-btn-attack'
      )}
      {btn('rest', acts === 0 ? 'Rest (end turn)' : 'Rest',
        acts === 0 ? '+2 ST, ends turn' : '+1 ST',
        turnDone
      )}
      {btn('swapPosition', 'Swap Position',
        canSwap ? 'ST−6, MO→0' : range !== 1 ? 'Need range 1' : 'Need 6 ST',
        !canSwap
      )}

      {/* ── Power Turn (end of turn only) ───────────── */}
      {fighter.powerTurnAvailable && acts >= 2 && (
        btn('spendPowerTurn', '⚡ Power Turn', 'MO→0, bonus turn', false, 'action-btn-power')
      )}

      {/* ── Flow Attack (MO ≥ 6) ───────────────────── */}
      {mo >= FLOW_ATTACK_THRESHOLD && !turnDone && !staminaDepleted && (
        btn('flowAttack', 'Flow Attack',
          `ST−1 MO−3 → next attack ST+3`,
          false, 'action-btn-flow'
        )
      )}

      {/* ── Light Special ───────────────────────────── */}
      {fighter.weightClass === 'light' && !fighter.extraMoveAvailable && (
        btn('lightExtraMove', 'Extra Move',
          st >= 3 && mo >= 1 ? 'ST−3 MO−1' : 'Need 3ST + 1MO',
          st < 3 || mo < 1
        )
      )}
      {fighter.extraMoveAvailable && (
        <div className="action-token-notice">Extra move ready — use Move Fwd/Back</div>
      )}

      {/* ── Heavy Special ───────────────────────────── */}
      {fighter.weightClass === 'heavy' && !fighter.powerGuardActive && (
        btn('heavyPowerGuard', 'Power Guard',
          st >= 3 && mo >= 2 ? 'ST−3 MO−2' : 'Need 3ST + 2MO',
          st < 3 || mo < 2
        )
      )}
      {fighter.powerGuardActive && (
        <div className="action-token-notice action-token-heavy">Power Guard active — next attack ×2 guard</div>
      )}

      {/* ── Manual block/hit (auto-resolution OFF) ── */}
      {autoOff && (
        <>
          <div className="action-section-label">Manual resolution</div>
          {btn('directBlock',   'Direct Block',   'MO+2',       false)}
          {btn('indirectBlock', 'Indirect Block',  'MO+1 ST−1', staminaDepleted)}
          {btn('cleanHit',      'Clean Hit taken', 'MO−2 HP−2', false)}
        </>
      )}
    </div>
  );
}
