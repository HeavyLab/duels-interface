import {
  STAMINA_GATED_ACTIONS,
  POWER_TURN_CLEARING_ACTIONS,
  ACTION_LABELS,
} from './defaults.js';

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Returns whether an action key is available given the current fighter stamina.
 */
export function isActionAvailable(actionKey, stamina, actionCosts) {
  // Stamina-gated actions require stamina > 0
  if (STAMINA_GATED_ACTIONS.has(actionKey) && stamina <= 0) return false;
  // Action must exist in the applicable cost table
  const table = stamina <= 0 ? actionCosts.staminaAt0 : actionCosts.staminaAbove0;
  return actionKey in table;
}

/**
 * Applies a game action to the fighters array.
 * Returns { newFighters, logEntries } or null if the action isn't available.
 *
 * logEntries is an array because swap position creates two entries.
 */
export function applyAction(fighters, fighterIndex, actionKey, settings) {
  const fighter = fighters[fighterIndex];

  // --- Special: spend momentum resets to 0 absolutely ---
  if (actionKey === 'spendMomentum') {
    const before = { health: fighter.health, stamina: fighter.stamina, momentum: fighter.momentum };
    const after  = { health: fighter.health, stamina: fighter.stamina, momentum: 0 };
    return {
      newFighters: fighters.map((f, i) =>
        i === fighterIndex ? { ...f, momentum: 0, powerTurnAvailable: false } : f
      ),
      logEntries: [{
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fighterName: fighter.name,
        actionLabel: ACTION_LABELS.spendMomentum,
        before,
        after,
      }],
    };
  }

  const isStaminaAt0 = fighter.stamina <= 0;
  const costTable = isStaminaAt0
    ? settings.actionCosts.staminaAt0
    : settings.actionCosts.staminaAbove0;

  const cost = costTable[actionKey];
  if (!cost) return null;

  // --- Determine power turn flag ---
  let powerTurnAvailable = fighter.powerTurnAvailable;
  if (actionKey === 'startOfTurn') {
    // Check BEFORE applying costs
    powerTurnAvailable = fighter.momentum >= settings.maxMomentum;
  }
  if (POWER_TURN_CLEARING_ACTIONS.has(actionKey)) {
    powerTurnAvailable = false;
  }

  // --- Apply costs to the acting fighter ---
  const beforeSelf = {
    health: fighter.health,
    stamina: fighter.stamina,
    momentum: fighter.momentum,
  };

  const afterSelf = {
    health:   clamp(fighter.health   + cost.health,   0, settings.maxHealth),
    stamina:  clamp(fighter.stamina  + cost.stamina,  0, settings.maxStamina),
    momentum: clamp(fighter.momentum + cost.momentum, 0, settings.maxMomentum),
  };

  const logEntries = [];

  logEntries.push({
    id: Date.now() + Math.random(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    fighterName: fighter.name,
    actionLabel: ACTION_LABELS[actionKey] ?? actionKey,
    before: beforeSelf,
    after: afterSelf,
  });

  // --- Build new fighters array ---
  let newFighters = fighters.map((f, i) => {
    if (i === fighterIndex) {
      return {
        ...f,
        ...afterSelf,
        powerTurnAvailable,
      };
    }
    return f;
  });

  // --- Swap position: also hit opponent momentum ---
  if (actionKey === 'swapPosition') {
    const opponentIndex = 1 - fighterIndex;
    const opponent = newFighters[opponentIndex];
    const beforeOpponent = { health: opponent.health, stamina: opponent.stamina, momentum: opponent.momentum };
    const newOpponentMomentum = clamp(
      opponent.momentum + settings.swapOpponentMomentum,
      0,
      settings.maxMomentum
    );
    const afterOpponent = { ...beforeOpponent, momentum: newOpponentMomentum };

    newFighters = newFighters.map((f, i) => {
      if (i === opponentIndex) return { ...f, momentum: newOpponentMomentum };
      return f;
    });

    logEntries.push({
      id: Date.now() + Math.random() + 0.5,
      timestamp: logEntries[0].timestamp,
      fighterName: opponent.name,
      actionLabel: 'Swap (opponent effect)',
      before: beforeOpponent,
      after: afterOpponent,
    });
  }

  return { newFighters, logEntries };
}

/**
 * Scales a meter value proportionally when the maximum changes.
 */
export function scaleMeterValue(current, oldMax, newMax) {
  if (oldMax === 0) return newMax;
  return Math.round(clamp((current / oldMax) * newMax, 0, newMax));
}
