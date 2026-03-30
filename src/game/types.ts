export const GUARD_ZONES = ['high', 'mid', 'low'] as const;
export const RANGE_BANDS = ['close', 'mid', 'long'] as const;
export const EFFECT_IDS = ['focused', 'guarded', 'exposed'] as const;

export type GuardZone = (typeof GUARD_ZONES)[number];
export type RangeBand = (typeof RANGE_BANDS)[number];
export type EffectId = (typeof EFFECT_IDS)[number];

export type WeightClassId = 'lightweight' | 'middleweight' | 'heavyweight';
export type WeaponId = 'arming-sword' | 'spear' | 'war-axe' | 'daggers';
export type ActionKind =
  | 'advance'
  | 'retreat'
  | 'shift-guard'
  | 'strike'
  | 'power-strike'
  | 'brace'
  | 'recover'
  | 'focus';

export interface Resources {
  health: number;
  stamina: number;
  momentum: number;
}

export interface WeightClassDefinition {
  id: WeightClassId;
  label: string;
  summary: string;
  modifiers: {
    health: number;
    stamina: number;
    momentum: number;
    accuracy: number;
    damage: number;
    exactGuard: number;
    offGuard: number;
    moveCost: number;
  };
}

export interface WeaponDefinition {
  id: WeaponId;
  label: string;
  summary: string;
  effectiveRanges: RangeBand[];
  attackCost: number;
  powerAttackCost: number;
  attackDamage: number;
  powerAttackDamage: number;
  accuracy: number;
  guardBonus: number;
  focusBonus: number;
}

export interface DerivedCombatStats {
  maxHealth: number;
  maxStamina: number;
  maxMomentum: number;
  strikeDamage: number;
  powerStrikeDamage: number;
  accuracy: number;
  exactGuardDefense: number;
  offGuardDefense: number;
  movementCost: number;
  braceRecovery: number;
  recoverRecovery: number;
  focusGain: number;
}

export interface FighterEffect {
  id: EffectId;
  remainingTurns: number;
}

export interface PlayerLoadout {
  name: string;
  weightClassId: WeightClassId;
  weaponId: WeaponId;
}

export interface PlayerState {
  id: string;
  name: string;
  weightClassId: WeightClassId;
  weaponId: WeaponId;
  stats: DerivedCombatStats;
  resources: Resources;
  guard: GuardZone;
  effects: FighterEffect[];
}

export interface ActionCommand {
  kind: ActionKind;
  zone?: GuardZone;
}

export interface LegalAction {
  id: string;
  group: string;
  label: string;
  description: string;
  command: ActionCommand;
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  actorId: string;
  actorName: string;
  actionId: string;
  actionLabel: string;
  summary: string;
  details: string[];
  rangeBefore: RangeBand;
  rangeAfter: RangeBand;
  createdAt: string;
  resourceChanges: Array<{
    playerId: string;
    playerName: string;
    before: Resources;
    after: Resources;
  }>;
}

export interface DuelState {
  version: number;
  createdAt: string;
  turn: number;
  activePlayerIndex: 0 | 1;
  range: RangeBand;
  players: [PlayerState, PlayerState];
  log: CombatLogEntry[];
  winnerId: string | null;
}

export interface ActionDefinition {
  kind: ActionKind;
  group: string;
  label: string;
  description: string;
}

export interface DuelRules {
  version: number;
  baseResources: Resources;
  startingGuard: GuardZone;
  startingRange: RangeBand;
  maxLogEntries: number;
  timings: {
    focusedTurns: number;
    guardedTurns: number;
    exposedTurns: number;
  };
  actions: {
    shiftGuardCost: number;
    braceGuardBonus: number;
    recoverMomentumLoss: number;
    powerStrikeMomentumCost: number;
  };
  attack: {
    exactGuardHitPenalty: number;
    exposedBonusDamage: number;
    blockedStrikeStaminaDamage: number;
    blockedPowerStrikeStaminaDamage: number;
    glancingDamage: number;
    powerGlancingDamage: number;
    hitMomentumGain: number;
    powerHitMomentumGain: number;
    targetMomentumLossOnHit: number;
    missMomentumLoss: number;
    evadeMomentumGain: number;
  };
}
