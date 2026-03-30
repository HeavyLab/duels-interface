import { createDuelState, resolveDuelAction } from '../game/engine';
import type { DuelState, PlayerLoadout } from '../game/types';

const STORAGE_KEY = 'duels-interface:app-state';
const APP_STATE_VERSION = 1;

export interface AppState {
  version: number;
  setup: [PlayerLoadout, PlayerLoadout];
  duel: DuelState | null;
}

export type AppAction =
  | {
      type: 'update-setup';
      playerIndex: 0 | 1;
      field: keyof PlayerLoadout;
      value: string;
    }
  | { type: 'start-duel' }
  | { type: 'apply-action'; actionId: string }
  | { type: 'rematch' }
  | { type: 'return-to-setup' }
  | { type: 'clear-log' };

function createDefaultSetup(): [PlayerLoadout, PlayerLoadout] {
  return [
    {
      name: 'Player 1',
      weightClassId: 'middleweight',
      weaponId: 'arming-sword'
    },
    {
      name: 'Player 2',
      weightClassId: 'middleweight',
      weaponId: 'spear'
    }
  ];
}

export function createDefaultAppState(): AppState {
  return {
    version: APP_STATE_VERSION,
    setup: createDefaultSetup(),
    duel: null
  };
}

function duelToSetup(duel: DuelState): [PlayerLoadout, PlayerLoadout] {
  return duel.players.map((player) => ({
    name: player.name,
    weightClassId: player.weightClassId,
    weaponId: player.weaponId
  })) as [PlayerLoadout, PlayerLoadout];
}

export function loadAppState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultAppState();
    }

    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== APP_STATE_VERSION) {
      return createDefaultAppState();
    }

    return parsed;
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(state: AppState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'update-setup': {
      const nextSetup = state.setup.map((player, index) =>
        index === action.playerIndex
          ? {
              ...player,
              [action.field]: action.value
            }
          : player
      ) as [PlayerLoadout, PlayerLoadout];

      return {
        ...state,
        setup: nextSetup
      };
    }
    case 'start-duel':
      return {
        ...state,
        duel: createDuelState(state.setup)
      };
    case 'apply-action':
      if (!state.duel) {
        return state;
      }
      return {
        ...state,
        duel: resolveDuelAction(state.duel, action.actionId)
      };
    case 'rematch': {
      const setup = state.duel ? duelToSetup(state.duel) : state.setup;
      return {
        ...state,
        setup,
        duel: createDuelState(setup)
      };
    }
    case 'return-to-setup':
      return {
        ...state,
        setup: state.duel ? duelToSetup(state.duel) : state.setup,
        duel: null
      };
    case 'clear-log':
      if (!state.duel) {
        return state;
      }
      return {
        ...state,
        duel: {
          ...state.duel,
          log: []
        }
      };
    default:
      return state;
  }
}
