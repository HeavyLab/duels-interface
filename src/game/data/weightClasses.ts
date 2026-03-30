import type { WeightClassDefinition } from '../types';

export const WEIGHT_CLASSES: Record<WeightClassDefinition['id'], WeightClassDefinition> = {
  lightweight: {
    id: 'lightweight',
    label: 'Lightweight',
    summary: 'Fast and accurate, with less staying power when exchanges get ugly.',
    modifiers: {
      health: -3,
      stamina: 2,
      momentum: 1,
      accuracy: 1,
      damage: 0,
      exactGuard: -1,
      offGuard: 0,
      moveCost: -1
    }
  },
  middleweight: {
    id: 'middleweight',
    label: 'Middleweight',
    summary: 'Neutral baseline. No extreme upsides, no major liabilities.',
    modifiers: {
      health: 0,
      stamina: 0,
      momentum: 0,
      accuracy: 0,
      damage: 0,
      exactGuard: 0,
      offGuard: 0,
      moveCost: 0
    }
  },
  heavyweight: {
    id: 'heavyweight',
    label: 'Heavyweight',
    summary: 'Harder to move and easier to read, but punishing on contact.',
    modifiers: {
      health: 4,
      stamina: -1,
      momentum: -1,
      accuracy: -1,
      damage: 1,
      exactGuard: 1,
      offGuard: 1,
      moveCost: 1
    }
  }
};

export const WEIGHT_CLASS_OPTIONS = Object.values(WEIGHT_CLASSES);
