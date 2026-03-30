import type { WeaponDefinition } from '../types';

export const WEAPONS: Record<WeaponDefinition['id'], WeaponDefinition> = {
  'arming-sword': {
    id: 'arming-sword',
    label: 'Arming Sword',
    summary: 'Reliable at close or mid range with balanced pressure and defense.',
    effectiveRanges: ['close', 'mid'],
    attackCost: 3,
    powerAttackCost: 5,
    attackDamage: 3,
    powerAttackDamage: 5,
    accuracy: 1,
    guardBonus: 1,
    focusBonus: 0
  },
  spear: {
    id: 'spear',
    label: 'Spear',
    summary: 'Dominates space from mid to long range and rewards cleaner setup.',
    effectiveRanges: ['mid', 'long'],
    attackCost: 2,
    powerAttackCost: 4,
    attackDamage: 3,
    powerAttackDamage: 4,
    accuracy: 2,
    guardBonus: 0,
    focusBonus: 1
  },
  'war-axe': {
    id: 'war-axe',
    label: 'War Axe',
    summary: 'High commitment, high payoff. Excellent for breaking guarded opponents.',
    effectiveRanges: ['close', 'mid'],
    attackCost: 4,
    powerAttackCost: 6,
    attackDamage: 4,
    powerAttackDamage: 6,
    accuracy: 0,
    guardBonus: -1,
    focusBonus: 0
  },
  daggers: {
    id: 'daggers',
    label: 'Daggers',
    summary: 'Very short reach, but efficient and difficult to track once in range.',
    effectiveRanges: ['close'],
    attackCost: 2,
    powerAttackCost: 4,
    attackDamage: 2,
    powerAttackDamage: 4,
    accuracy: 2,
    guardBonus: 0,
    focusBonus: 1
  }
};

export const WEAPON_OPTIONS = Object.values(WEAPONS);
