import type { ActionDefinition } from '../types';

export const ACTION_DEFINITIONS: Record<ActionDefinition['kind'], ActionDefinition> = {
  advance: {
    kind: 'advance',
    group: 'Position',
    label: 'Advance',
    description: 'Step one band closer to force shorter engagement distance.'
  },
  retreat: {
    kind: 'retreat',
    group: 'Position',
    label: 'Retreat',
    description: 'Open the distance by one band and reset pressure.'
  },
  'shift-guard': {
    kind: 'shift-guard',
    group: 'Defense',
    label: 'Shift Guard',
    description: 'Move your active guard to a new lane.'
  },
  strike: {
    kind: 'strike',
    group: 'Offense',
    label: 'Strike',
    description: 'Standard attack into a chosen guard lane.'
  },
  'power-strike': {
    kind: 'power-strike',
    group: 'Offense',
    label: 'Power Strike',
    description: 'Spend momentum for a heavier, riskier committed attack.'
  },
  brace: {
    kind: 'brace',
    group: 'Recovery',
    label: 'Brace',
    description: 'Recover stamina, steady guard, and clear exposure.'
  },
  recover: {
    kind: 'recover',
    group: 'Recovery',
    label: 'Recover',
    description: 'Take a large stamina recovery at the cost of tempo.'
  },
  focus: {
    kind: 'focus',
    group: 'Tempo',
    label: 'Focus',
    description: 'Build momentum and prime the next attack.'
  }
};

export const ACTION_GROUP_ORDER = ['Position', 'Defense', 'Offense', 'Tempo', 'Recovery'];
