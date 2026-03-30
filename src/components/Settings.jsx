export default function Settings({ settings, onToggleAuto, onBack }) {
  const autoOn = settings.automaticResolution !== false;
  return (
    <div className="screen settings-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="screen-title">Settings</h1>
      </div>

      <div className="settings-body">
        <section className="settings-section">
          <h2 className="section-heading">Attack Resolution</h2>
          <div className="settings-row" style={{ alignItems: 'center', gap: 16 }}>
            <span className="settings-field-label" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              Automatic block / hit resolution
            </span>
            <button
              className={`toggle-btn${autoOn ? ' toggle-btn-on' : ' toggle-btn-off'}`}
              onClick={onToggleAuto}
            >
              {autoOn ? 'ON' : 'OFF'}
            </button>
          </div>
          {!autoOn && (
            <p className="toggle-hint">
              Automatic stance resolution is off. Use the manual Direct Block / Indirect Block / Clean Hit buttons on each panel, and the +1 guard buttons to track guard pressure manually.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
