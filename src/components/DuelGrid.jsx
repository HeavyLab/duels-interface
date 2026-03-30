import { GRID_SIZE } from '../utils/defaults.js';

export default function DuelGrid({ fighters }) {
  const positions = fighters.map(f => f.position);
  const range = Math.abs(positions[0] - positions[1]);

  return (
    <div className="duel-grid-bar">
      <div className="duel-grid">
        {Array.from({ length: GRID_SIZE }, (_, tile) => {
          const f0here = positions[0] === tile;
          const f1here = positions[1] === tile;
          return (
            <div
              key={tile}
              className={[
                'grid-tile',
                f0here ? 'grid-tile-f0' : '',
                f1here ? 'grid-tile-f1' : '',
              ].filter(Boolean).join(' ')}
            >
              {f0here && <span className="grid-fighter-dot grid-fighter-dot-0">1</span>}
              {f1here && <span className="grid-fighter-dot grid-fighter-dot-1">2</span>}
            </div>
          );
        })}
      </div>
      <div className="duel-grid-range">Range: <strong>{range}</strong></div>
    </div>
  );
}
