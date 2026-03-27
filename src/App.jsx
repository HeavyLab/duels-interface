import { useReducer, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, createInitialFighters } from './utils/defaults.js';
import { applyAction, scaleMeterValue, clamp } from './utils/gameLogic.js';
import FighterPanel from './components/FighterPanel.jsx';
import TurnLog from './components/TurnLog.jsx';
import Settings from './components/Settings.jsx';
import Rules from './components/Rules.jsx';
import './App.css';

// ─── State shape ─────────────────────────────────────────────────────────────
// Bump this whenever the saved-state schema changes incompatibly.
const STATE_VERSION = 2;

function buildInitialState() {
  try {
    const saved = localStorage.getItem('duels-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version === STATE_VERSION) return parsed;
      // Stale version — fall through to fresh state below
    }
  } catch {/* ignore */}

  const settings = DEFAULT_SETTINGS;
  return {
    version: STATE_VERSION,
    fighters: createInitialFighters(settings),
    settings,
    log: [],
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'APPLY_ACTION': {
      const { fighterIndex, actionKey } = action;
      const result = applyAction(
        state.fighters,
        fighterIndex,
        actionKey,
        state.settings
      );
      if (!result) return state;
      return {
        ...state,
        fighters: result.newFighters,
        log: [...result.logEntries, ...state.log],
      };
    }

    case 'TOGGLE_GUARD_BREAK': {
      const { fighterIndex } = action;
      return {
        ...state,
        fighters: state.fighters.map((f, i) =>
          i === fighterIndex ? { ...f, guardBroken: !f.guardBroken } : f
        ),
      };
    }

    case 'SET_FIGHTER_NAME': {
      const { fighterIndex, name } = action;
      // Also update log entries that reference the old name
      const oldName = state.fighters[fighterIndex].name;
      return {
        ...state,
        fighters: state.fighters.map((f, i) =>
          i === fighterIndex ? { ...f, name } : f
        ),
        log: state.log.map(entry =>
          entry.fighterName === oldName
            ? { ...entry, fighterName: name }
            : entry
        ),
      };
    }

    case 'UPDATE_MAX': {
      const { metric, value } = action;
      const newMax = Math.max(1, parseInt(value) || 1);
      const oldMax = state.settings[`max${capitalize(metric)}`];
      const newSettings = { ...state.settings, [`max${capitalize(metric)}`]: newMax };
      const newFighters = state.fighters.map(f => ({
        ...f,
        [metric]: scaleMeterValue(f[metric], oldMax, newMax),
      }));
      return { ...state, settings: newSettings, fighters: newFighters };
    }

    case 'UPDATE_SWAP_OPPONENT': {
      const val = parseInt(action.value);
      const newSettings = {
        ...state.settings,
        swapOpponentMomentum: isNaN(val) ? 0 : val,
      };
      return { ...state, settings: newSettings };
    }

    case 'UPDATE_ACTION_COST': {
      const { table, actionKey, stat, value } = action;
      const val = parseInt(value);
      const newSettings = {
        ...state.settings,
        actionCosts: {
          ...state.settings.actionCosts,
          [table]: {
            ...state.settings.actionCosts[table],
            [actionKey]: {
              ...state.settings.actionCosts[table][actionKey],
              [stat]: isNaN(val) ? 0 : val,
            },
          },
        },
      };
      return { ...state, settings: newSettings };
    }

    case 'CHANGE_STANCE': {
      const { fighterIndex, newStance } = action;
      const fighter = state.fighters[fighterIndex];
      if (fighter.stance === newStance) return state; // already in that stance
      // Apply the stance action cost (will return null if stamina is 0)
      const result = applyAction(state.fighters, fighterIndex, 'stance', state.settings);
      if (!result) return state;
      // Overwrite the fighter's stance and relabel the log entry
      const newFighters = result.newFighters.map((f, i) =>
        i === fighterIndex ? { ...f, stance: newStance } : f
      );
      const logEntries = result.logEntries.map(e => ({
        ...e,
        actionLabel: `Stance → ${capitalize(newStance)}`,
      }));
      return {
        ...state,
        fighters: newFighters,
        log: [...logEntries, ...state.log],
      };
    }

    case 'RESET': {
      const { settings } = state;
      return {
        ...state,
        fighters: createInitialFighters(settings),
      };
    }

    case 'CLEAR_LOG': {
      return { ...state, log: [] };
    }

    default:
      return state;
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState);
  const [screen, setScreen] = useState('main'); // 'main' | 'settings' | 'rules'
  const [showLog, setShowLog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem('duels-state', JSON.stringify({ ...state, version: STATE_VERSION }));
    } catch {/* ignore */}
  }, [state]);

  const handleAction = (fighterIndex, actionKey) => {
    dispatch({ type: 'APPLY_ACTION', fighterIndex, actionKey });
  };

  const handleToggleGuard = (fighterIndex) => {
    dispatch({ type: 'TOGGLE_GUARD_BREAK', fighterIndex });
  };

  const handleNameChange = (fighterIndex, name) => {
    dispatch({ type: 'SET_FIGHTER_NAME', fighterIndex, name });
  };

  const handleUpdateMax = (metric, value) => {
    dispatch({ type: 'UPDATE_MAX', metric, value });
  };

  const handleUpdateSwapOpponent = (value) => {
    dispatch({ type: 'UPDATE_SWAP_OPPONENT', value });
  };

  const handleUpdateActionCost = (table, actionKey, stat, value) => {
    dispatch({ type: 'UPDATE_ACTION_COST', table, actionKey, stat, value });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setShowResetConfirm(false);
  };

  const handleStanceChange = (fighterIndex, newStance) => {
    dispatch({ type: 'CHANGE_STANCE', fighterIndex, newStance });
  };

  const handleClearLog = () => {
    dispatch({ type: 'CLEAR_LOG' });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (screen === 'settings') {
    return (
      <Settings
        settings={state.settings}
        onUpdateMax={handleUpdateMax}
        onUpdateSwapOpponent={handleUpdateSwapOpponent}
        onUpdateActionCost={handleUpdateActionCost}
        onBack={() => setScreen('main')}
      />
    );
  }

  if (screen === 'rules') {
    return <Rules onBack={() => setScreen('main')} />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <span className="header-title">⚔ Duels</span>
        <div className="header-actions">
          <button
            className="header-btn"
            onClick={() => setShowLog(true)}
            title="Turn log"
          >
            📋
          </button>
          <button
            className="header-btn"
            onClick={() => setScreen('rules')}
            title="Rules reference"
          >
            📖
          </button>
          <button
            className="header-btn"
            onClick={() => setScreen('settings')}
            title="Settings"
          >
            ⚙
          </button>
          <button
            className="header-btn reset-btn"
            onClick={() => setShowResetConfirm(true)}
            title="Reset fighters"
          >
            ↺
          </button>
        </div>
      </header>

      {/* Fighter panels */}
      <main className="main-area">
        {state.fighters.map((fighter, index) => (
          <FighterPanel
            key={fighter.id}
            fighter={fighter}
            fighterIndex={index}
            settings={state.settings}
            opponentName={state.fighters[1 - index].name}
            onAction={handleAction}
            onToggleGuard={handleToggleGuard}
            onNameChange={handleNameChange}
            onStanceChange={handleStanceChange}
          />
        ))}
      </main>

      {/* Turn log modal */}
      {showLog && (
        <TurnLog
          log={state.log}
          onClose={() => setShowLog(false)}
          onClear={handleClearLog}
        />
      )}

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h3>Reset Fighters?</h3>
            <p>Both fighters will be restored to full meters. Guard breaks will be cleared. The turn log and settings are not affected.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="btn-confirm-danger" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
