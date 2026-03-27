export const DEFAULT_SETTINGS = {
  maxHealth: 16,
  maxStamina: 24,
  maxMomentum: 10,
  swapOpponentMomentum: -3,
  actionCosts: {
    staminaAbove0: {
      startOfTurn:             { stamina: 4,  momentum: 0,   health: 0  },
      move:                    { stamina: -1, momentum: 0,   health: 0  },
      stance:                  { stamina: -2, momentum: 0,   health: 0  },
      attack:                  { stamina: -6, momentum: 3,   health: 0  },
      directBlock:             { stamina: -1, momentum: 2,   health: 0  },
      indirectBlock:           { stamina: -2, momentum: 1,   health: -1 },
      swapPosition:            { stamina: -8, momentum: -10, health: 0  },
      restAction1:             { stamina: 3,  momentum: 0,   health: 0  },
      restAction2:             { stamina: 2,  momentum: 0,   health: 0  },
      gettingHit:              { stamina: 0,  momentum: -1,  health: -3 },
      gettingHitIndirectBlock: { stamina: 0,  momentum: 0,   health: -1 },
    },
    staminaAt0: {
      startOfTurn:  { stamina: 4, momentum: 0,  health: 0  },
      directBlock:  { stamina: 0, momentum: 1,  health: 0  },
      indirectBlock:{ stamina: 0, momentum: 0,  health: 0  },
      restAction1:  { stamina: 3, momentum: 0,  health: 0  },
      restAction2:  { stamina: 2, momentum: 0,  health: 0  },
      gettingHit:   { stamina: 0, momentum: -3, health: -3 },
    },
  },
};

// Display labels for each action key
export const ACTION_LABELS = {
  startOfTurn:             'Start Turn',
  move:                    'Move',
  stance:                  'Stance',
  attack:                  'Attack',
  directBlock:             'Direct Block',
  indirectBlock:           'Indirect Block',
  swapPosition:            'Swap Position',
  restAction1:             'Rest (Action 1)',
  restAction2:             'Rest (Action 2)',
  gettingHit:              'Getting Hit',
  gettingHitIndirectBlock: 'Hit (Ind. Block)',
};

// These actions are only available when stamina > 0
export const STAMINA_GATED_ACTIONS = new Set([
  'move', 'stance', 'attack', 'swapPosition', 'gettingHitIndirectBlock',
]);

// These actions clear the power turn indicator when used
export const POWER_TURN_CLEARING_ACTIONS = new Set(['attack']);

// Display order for action buttons
export const ACTION_ORDER = [
  'startOfTurn',
  'move',
  'stance',
  'attack',
  'directBlock',
  'indirectBlock',
  'swapPosition',
  'restAction1',
  'restAction2',
  'gettingHit',
  'gettingHitIndirectBlock',
];

// Human-readable labels for settings sections
export const ACTION_SECTION_LABELS = {
  staminaAbove0: 'Stamina Above 0',
  staminaAt0:    'Stamina At 0',
};

export function createInitialFighters(settings) {
  return [
    {
      id: 0,
      name: 'Fighter 1',
      health: settings.maxHealth,
      stamina: settings.maxStamina,
      momentum: settings.maxMomentum,
      guardBroken: false,
      powerTurnAvailable: false,
    },
    {
      id: 1,
      name: 'Fighter 2',
      health: settings.maxHealth,
      stamina: settings.maxStamina,
      momentum: settings.maxMomentum,
      guardBroken: false,
      powerTurnAvailable: false,
    },
  ];
}
