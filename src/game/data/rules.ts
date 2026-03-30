import type { DuelRules } from '../types';

export const DUEL_RULES: DuelRules = {
  version: 1,
  baseResources: {
    health: 20,
    stamina: 10,
    momentum: 5
  },
  startingGuard: 'mid',
  startingRange: 'mid',
  maxLogEntries: 250,
  timings: {
    focusedTurns: 2,
    guardedTurns: 2,
    exposedTurns: 2
  },
  actions: {
    shiftGuardCost: 1,
    braceGuardBonus: 1,
    recoverMomentumLoss: 1,
    powerStrikeMomentumCost: 2
  },
  attack: {
    exactGuardHitPenalty: 2,
    exposedBonusDamage: 2,
    blockedStrikeStaminaDamage: 2,
    blockedPowerStrikeStaminaDamage: 3,
    glancingDamage: 1,
    powerGlancingDamage: 2,
    hitMomentumGain: 1,
    powerHitMomentumGain: 2,
    targetMomentumLossOnHit: 1,
    missMomentumLoss: 1,
    evadeMomentumGain: 1
  }
};
