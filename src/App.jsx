import { useReducer, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, createInitialFighter, REACHABLE_FROM, WEIGHT_CLASSES } from './utils/defaults.js';
import { applyAction } from './utils/gameLogic.js';
import SetupScreen from './components/SetupScreen.jsx';
import FighterPanel from './components/FighterPanel.jsx';
import DuelGrid from './components/DuelGrid.jsx';
import TurnLog from './components/TurnLog.jsx';
import Settings from './components/Settings.jsx';
import Rules from './components/Rules.jsx';
import './App.css';

const STATE_VERSION = 4;

function buildInitialState() {
  try {
    const saved = localStorage.getItem('duels-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch { /* ignore */ }

  return {
    version: STATE_VERSION,
    phase: 'setup',        // 'setup' | 'duel'
    fighters: [],
    settings: DEFAULT_SETTINGS,
    log: [],
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'START_DUEL': {
      const { configs } = action;
      return {
        ...state,
        phase: 'duel',
        fighters: configs.map((cfg, id) =>
          createInitialFighter(id, cfg.weightClass, cfg.weapon, cfg.name.trim() || `Fighter ${id + 1}`)
        ),
        log: [],
      };
    }

    case 'APPLY_ACTION': {
      const { fighterIndex, actionKey } = action;
      const result = applyAction(state.fighters, fighterIndex, actionKey, state.settings);
      if (!result) return state;
      return {
        ...state,
        fighters: result.newFighters,
        log: [...result.logEntries, ...state.log],
      };
    }

    case 'CHANGE_STANCE': {
      const { fighterIndex, newStance } = action;
      const fighter = state.fighters[fighterIndex];
      if (fighter.stance === newStance) return state;
      // Enforce adjacency constraint
      if (!REACHABLE_FROM[fighter.stance]?.includes(newStance)) return state;
      // Apply stamina cost
      const result = applyAction(state.fighters, fighterIndex, 'stance', state.settings);
      if (!result) return state;
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

    case 'INCREMENT_GUARD': {
      const { fighterIndex, stance } = action;
      const fighter = state.fighters[fighterIndex];
      const maxG = WEIGHT_CLASSES[fighter.weightClass]?.maxGuard ?? 3;
      const curVal = fighter.stanceGuard?.[stance] ?? 0;
      if (curVal >= maxG) return state;
      const newVal = curVal + 1;
      const newGuard = { ...(fighter.stanceGuard ?? { high: 0, mid: 0, low: 0 }), [stance]: newVal };
      const newCountdown = newVal >= maxG ? 2 : (fighter.startTurnsToGuardReset ?? 0);
      const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fighterName: fighter.name,
        actionLabel: `Guard +1 ${capitalize(stance)}`,
        before: { health: fighter.health, stamina: fighter.stamina, momentum: fighter.momentum },
        after:  { health: fighter.health, stamina: fighter.stamina, momentum: fighter.momentum },
      };
      return {
        ...state,
        fighters: state.fighters.map((f, i) =>
          i === fighterIndex
            ? { ...f, stanceGuard: newGuard, startTurnsToGuardReset: newCountdown }
            : f
        ),
        log: [logEntry, ...state.log],
      };
    }

    case 'SET_FIGHTER_NAME': {
      const { fighterIndex, name } = action;
      const oldName = state.fighters[fighterIndex].name;
      return {
        ...state,
        fighters: state.fighters.map((f, i) => i === fighterIndex ? { ...f, name } : f),
        log: state.log.map(e => e.fighterName === oldName ? { ...e, fighterName: name } : e),
      };
    }

    case 'TOGGLE_AUTO': {
      return {
        ...state,
        settings: { ...state.settings, automaticResolution: !(state.settings.automaticResolution ?? true) },
      };
    }

    case 'RESET': {
      // Reset fighters to full health/stamina but keep class/weapon
      return {
        ...state,
        fighters: state.fighters.map(f => createInitialFighter(f.id, f.weightClass, f.weapon, f.name)),
      };
    }

    case 'NEW_DUEL': {
      return {
        ...state,
        phase: 'setup',
        fighters: [],
        log: [],
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

  useEffect(() => {
    try {
      localStorage.setItem('duels-state', JSON.stringify({ ...state, version: STATE_VERSION }));
    } catch { /* ignore */ }
  }, [state]);

  const handleAction = (fighterIndex, actionKey) =>
    dispatch({ type: 'APPLY_ACTION', fighterIndex, actionKey });

  const handleNameChange = (fighterIndex, name) =>
    dispatch({ type: 'SET_FIGHTER_NAME', fighterIndex, name });

  const handleStanceChange = (fighterIndex, newStance) =>
    dispatch({ type: 'CHANGE_STANCE', fighterIndex, newStance });

  const handleIncrementGuard = (fighterIndex, stance) =>
    dispatch({ type: 'INCREMENT_GUARD', fighterIndex, stance });

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setShowResetConfirm(false);
  };

  const handleStartDuel = (configs) => {
    dispatch({ type: 'START_DUEL', configs });
  };

  // ── Setup phase ─────────────────────────────────────────────────────────────
  if (state.phase === 'setup') {
    return <SetupScreen onStart={handleStartDuel} />;
  }

  // ── Settings / Rules screens ─────────────────────────────────────────────────
  if (screen === 'settings') {
    return (
      <Settings
        settings={state.settings}
        onToggleAuto={() => dispatch({ type: 'TOGGLE_AUTO' })}
        onBack={() => setScreen('main')}
      />
    );
  }

  if (screen === 'rules') {
    return <Rules onBack={() => setScreen('main')} />;
  }

  // ── Main game ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="header">
        <span className="header-title">⚔ Duels</span>
        <div className="header-actions">
          <button className="header-btn" onClick={() => setShowLog(true)} title="Turn log">📋</button>
          <button className="header-btn" onClick={() => setScreen('rules')} title="Rules">📖</button>
          <button className="header-btn" onClick={() => setScreen('settings')} title="Settings">⚙</button>
          <button className="header-btn" onClick={() => setShowResetConfirm(true)} title="Reset fighters">↺</button>
          <button className="header-btn" onClick={() => dispatch({ type: 'NEW_DUEL' })} title="New duel (back to setup)">🆕</button>
        </div>
      </header>

      <DuelGrid fighters={state.fighters} />

      <main className="main-area">
        {state.fighters.map((fighter, index) => (
          <FighterPanel
            key={fighter.id}
            fighter={fighter}
            fighterIndex={index}
            opponent={state.fighters[1 - index]}
            settings={state.settings}
            onAction={handleAction}
            onNameChange={handleNameChange}
            onStanceChange={handleStanceChange}
            onIncrementGuard={handleIncrementGuard}
          />
        ))}
      </main>

      {showLog && (
        <TurnLog
          log={state.log}
          onClose={() => setShowLog(false)}
          onClear={() => dispatch({ type: 'CLEAR_LOG' })}
        />
      )}

      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h3>Reset Fighters?</h3>
            <p>Both fighters restored to full stats. Positions and guard reset. Log and settings unchanged.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn-confirm-danger" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
