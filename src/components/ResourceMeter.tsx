interface ResourceMeterProps {
  label: string;
  value: number;
  max: number;
  tone: 'health' | 'stamina' | 'momentum';
}

export function ResourceMeter({ label, value, max, tone }: ResourceMeterProps): JSX.Element {
  const width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;

  return (
    <div className="resource-meter">
      <div className="resource-meter__header">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="resource-meter__track">
        <div className={`resource-meter__fill resource-meter__fill--${tone}`} style={{ width }} />
      </div>
    </div>
  );
}
