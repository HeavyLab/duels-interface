// ── Weight Classes ─────────────────────────────────────────────────────────────
export const WEIGHT_CLASSES = {
  light: {
    label: 'Light',
    subtitle: 'Tempo Controller',
    maxHealth: 12,
    maxStamina: 24,
    maxGuard: 3,
    specialRule: 'Spend 3 ST + 1 MO: gain 1 extra movement action',
  },
  medium: {
    label: 'Medium',
    subtitle: 'Stability',
    maxHealth: 18,
    maxStamina: 18,
    maxGuard: 4,
    specialRule: 'Every 1st action this turn costs 1 less stamina',
  },
  heavy: {
    label: 'Heavy',
    subtitle: 'Pressure',
    maxHealth: 24,
    maxStamina: 12,
    maxGuard: 5,
    specialRule: 'Spend 3 ST + 2 MO: next attack has doubled guard pressure',
  },
};

// ── Weapons ────────────────────────────────────────────────────────────────────
export const WEAPONS = {
  sword: {
    label: 'Sword',
    damage: { directBlock: 0, indirectBlock: 1, cleanHit: 3 },
    effectiveAt: [1],
    lessEffectiveAt: [2],
    // > 2 tiles: no attack possible
  },
  spear: {
    label: 'Spear',
    damage: { directBlock: 0, indirectBlock: 0, cleanHit: 2 },
    cleanHitMomentumBonus: 1, // attacker gains +1 MO on clean hit
    effectiveAt: [2],
    lessEffectiveAt: [1],
    // > 2 tiles: no attack possible
  },
  hammer: {
    label: 'Hammer',
    damage: { directBlock: 0, indirectBlock: 1, cleanHit: 4 },
    effectiveAt: [1],
    lessEffectiveAt: [2],
    // > 2 tiles: no attack possible
  },
};

// ── Grid ───────────────────────────────────────────────────────────────────────
export const GRID_SIZE = 7;
export const INITIAL_POSITIONS = [1, 5];

// ── Stances ────────────────────────────────────────────────────────────────────
export const STANCES = ['high', 'mid', 'low'];

// Stances reachable when changing from current stance (adjacency constraint)
export const REACHABLE_FROM = {
  high: ['mid'],
  mid:  ['high', 'low'],
  low:  ['mid'],
};

// Which defender stances get guard pressure based on attacker's stance
export const GUARD_PRESSURE_ON = {
  high: ['mid'],
  mid:  ['high', 'low'],
  low:  ['mid'],
};

// ── Momentum ───────────────────────────────────────────────────────────────────
export const MAX_MOMENTUM = 10;
export const POWER_TURN_THRESHOLD = 10;   // momentum needed at turn start for power turn
export const MOMENTUM_DECAY_VALUE = 6;    // momentum decays to this if power turn unused
export const FLOW_ATTACK_THRESHOLD = 6;  // min momentum for flow attacks

// ── Action costs (base) ────────────────────────────────────────────────────────
export const ATTACK_STAMINA_BASE = -5;
export const ATTACK_STAMINA_LESS_EFFECTIVE = -7; // -5 - 2 extra at less effective range
export const ATTACK_MOMENTUM_GAIN = 3;
export const GUARD_BREAK_BONUS_DAMAGE = 1;

// ── Hit effects on DEFENDER ────────────────────────────────────────────────────
export const HIT_EFFECTS = {
  directBlock:   { momentum: +2, stamina:  0 },
  indirectBlock: { momentum: +1, stamina: -1 },
  cleanHit:      { momentum: -2, stamina:  0 },
};

// ── Default settings ───────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  automaticResolution: true,
};

// ── Initial fighter factory ────────────────────────────────────────────────────
export function createInitialFighter(id, weightClass = 'medium', weapon = 'sword', name = null) {
  const wc = WEIGHT_CLASSES[weightClass];
  return {
    id,
    name: name ?? `Fighter ${id + 1}`,
    weightClass,
    weapon,
    health: wc.maxHealth,
    stamina: wc.maxStamina,
    momentum: 0,
    stance: 'mid',
    stanceGuard: { high: 0, mid: 0, low: 0 },
    position: INITIAL_POSITIONS[id] ?? (id === 0 ? 1 : 5),
    actionsUsed: 0,            // 0–2 actions used this turn
    powerTurnAvailable: false, // momentum was full at turn start
    extraMoveAvailable: false, // Light special: 1 free extra move token
    powerGuardActive: false,   // Heavy special: double guard pressure on next attack
    flowBonusActive: false,    // flow attack bonus: -3 ST on next attack
    startTurnsToGuardReset: 0, // countdown (decrements on this fighter's own startOfTurn)
  };
}
