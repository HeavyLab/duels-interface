import { useRef, useEffect } from 'react';

/**
 * Segmented meter bar.
 * Segments animate via CSS transition on each segment's background colour.
 */
export default function MeterBar({ current, max, color, label, isPulsing }) {
  const prevRef = useRef(current);

  useEffect(() => {
    prevRef.current = current;
  }, [current]);

  const segments = [];
  for (let i = 0; i < max; i++) {
    segments.push(i < current);
  }

  return (
    <div className="meter-row">
      <span className="meter-label">{label}</span>
      <div className={`meter-track${isPulsing ? ' meter-pulse' : ''}`}>
        {segments.map((filled, i) => (
          <div
            key={i}
            className="meter-segment"
            style={{
              backgroundColor: filled ? color : 'rgba(255,255,255,0.08)',
              boxShadow: filled && isPulsing
                ? `0 0 6px ${color}`
                : 'none',
            }}
          />
        ))}
      </div>
      <span className="meter-value">
        {current}<span className="meter-max">/{max}</span>
      </span>
    </div>
  );
}
