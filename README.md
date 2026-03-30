# Duels Interface

Local-only PWA prototype for testing a 2-player turn-based duel system on Android tablets.

## Stack

- TypeScript
- React
- Vite
- `vite-plugin-pwa`

## What the app does

- lets both players choose a weight class and weapon before the duel starts
- creates a local duel state from those selections
- enforces legal actions for the active player
- resolves outcomes with a pure TypeScript combat engine
- tracks health, stamina, momentum, guard lane, range, and temporary effects
- stores the entire session in `localStorage`
- works offline after install thanks to the generated service worker

## Project structure

- `src/game/data/*`: tunable gameplay values, weapon data, weight classes, and action definitions
- `src/game/engine.ts`: pure rules and duel resolution
- `src/state/appState.ts`: app reducer and persistence wiring
- `src/components/*`: tablet UI

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- The current duel rules are sandbox rules, not a claim about final game balance.
- If you want to retune combat, start in `src/game/data/rules.ts`, `src/game/data/weapons.ts`, and `src/game/data/weightClasses.ts`.
