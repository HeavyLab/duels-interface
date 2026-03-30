export default function Rules({ onBack }) {
  return (
    <div className="screen rules-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="screen-title">Rules Reference</h1>
      </div>

      <div className="rules-body">

        <section className="rules-section">
          <h2>Turn Structure</h2>
          <ul>
            <li>Press <strong>Start Turn</strong>: gain +4 ST</li>
            <li>Each turn: perform <strong>2 actions</strong></li>
            <li>If momentum is full (10) at Start Turn: after both actions you may press <strong>Power Turn</strong> (MO→0) to play an extra turn immediately</li>
            <li>If Power Turn goes unused, momentum decays to 6 on the next Start Turn</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Grid &amp; Range</h2>
          <ul>
            <li>7-tile linear grid — move forward (toward opponent) or backward (−1 ST each)</li>
            <li>Range = distance between fighters</li>
            <li><strong>Swap Position</strong>: range must be 1; costs 6 ST; resets your MO to 0; you and opponent exchange tiles</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Stances</h2>
          <ul>
            <li>3 stances: <strong>High ↔ Mid ↔ Low</strong> — can only move to adjacent stances (costs 1 ST)</li>
            <li>Same stance = <strong>Direct Block</strong> (+2 MO to defender)</li>
            <li>1 apart = <strong>Indirect Block</strong> (+1 MO, −1 ST to defender)</li>
            <li>2 apart = <strong>Clean Hit</strong> (−2 MO + weapon damage to defender)</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Guard Meters</h2>
          <ul>
            <li>Each stance has its own guard meter (Light 3, Medium 4, Heavy 5)</li>
            <li>Attacking from <strong>High</strong> pressures defender's Mid guard</li>
            <li>Attacking from <strong>Mid</strong> pressures defender's High &amp; Low guards</li>
            <li>Attacking from <strong>Low</strong> pressures defender's Mid guard</li>
            <li>When a guard fills → broken for 2 of the defender's Start Turns</li>
            <li>While broken: attacker in that stance → guaranteed clean hit + 1 bonus damage</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Weapons (damage: direct / indirect / clean hit)</h2>
          <ul>
            <li><strong>Sword</strong>: 0 / 1 / 3 — effective at 1 tile, less eff. at 2, no attack &gt;2</li>
            <li><strong>Spear</strong>: 0 / 0 / 2 + 1 MO to attacker — effective at 2 tiles, less eff. at 1, no attack &gt;2</li>
            <li><strong>Hammer</strong>: 0 / 1 / 4 — effective at 1 tile, less eff. at 2, no attack &gt;2</li>
            <li>Less effective: −2 extra ST cost and −1 damage</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Weight Classes</h2>
          <ul>
            <li><strong>Light</strong> HP 12 ST 24 Guard 3 — spend 3 ST + 1 MO: gain a free extra movement action</li>
            <li><strong>Medium</strong> HP 18 ST 18 Guard 4 — 1st action each turn costs 1 less ST</li>
            <li><strong>Heavy</strong> HP 24 ST 12 Guard 5 — spend 3 ST + 2 MO: next attack applies double guard pressure</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Flow Attacks</h2>
          <ul>
            <li>Available when MO ≥ 6</li>
            <li>Acts as a stance-change (−1 ST) and costs −3 MO</li>
            <li>Grants a flow bonus: next attack costs 3 less ST</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Stamina at 0</h2>
          <p>Move, Stance, Attack, and Swap Position unavailable. Rest and manual blocks still work.</p>
        </section>

        <section className="rules-section">
          <h2>App Notes</h2>
          <ul>
            <li>Turn order is not enforced — both panels are always interactive.</li>
            <li>The action counter (two pips) tracks actions used this turn and resets on Start Turn.</li>
            <li>Settings → turn off automatic resolution to apply blocks/hits manually.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
