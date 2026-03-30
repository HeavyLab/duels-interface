import { useEffect, useReducer, useState } from 'react';
import { getActivePlayer, getLegalActions } from '../game/engine';
import { DuelScreen } from '../components/DuelScreen';
import { SetupScreen } from '../components/SetupScreen';
import { appReducer, loadAppState, saveAppState } from '../state/appState';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function App(): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, undefined, loadAppState);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall(): Promise<void> {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (!state.duel) {
    return (
      <SetupScreen
        setup={state.setup}
        canInstall={Boolean(installPrompt)}
        onInstall={handleInstall}
        onStart={() => dispatch({ type: 'start-duel' })}
        onUpdate={(playerIndex, field, value) =>
          dispatch({ type: 'update-setup', playerIndex, field, value })
        }
      />
    );
  }

  return (
    <DuelScreen
      duel={state.duel}
      activePlayer={getActivePlayer(state.duel)}
      legalActions={getLegalActions(state.duel)}
      canInstall={Boolean(installPrompt)}
      onAction={(actionId) => dispatch({ type: 'apply-action', actionId })}
      onClearLog={() => dispatch({ type: 'clear-log' })}
      onInstall={handleInstall}
      onRematch={() => dispatch({ type: 'rematch' })}
      onReturnToSetup={() => dispatch({ type: 'return-to-setup' })}
    />
  );
}
