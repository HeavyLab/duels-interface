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
            <li>Each turn has <strong>2 actions</strong>.</li>
            <li>Action 1: nothing / rest / move / stance <em>(attack allowed from v2)</em></li>
            <li>Action 2: nothing / move / stance / attack
              <ul>
                <li>No second move if you moved in action 1</li>
                <li>No second attack</li>
              </ul>
            </li>
            <li>Resting in action 1 ends the turn — only <em>nothing</em> is available as action 2.</li>
            <li>Doing nothing in action 1 does <strong>not</strong> end the turn.</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Momentum</h2>
          <ul>
            <li>A <strong>Momentum Power Turn</strong> triggers at the <em>start</em> of a turn if the meter is full.</li>
            <li>Getting hit before your turn starts can prevent the power turn from triggering.</li>
            <li>During a power turn the fighter takes <strong>2 actions</strong> before the opponent acts.</li>
            <li>Swap Position resets own momentum entirely and reduces opponent momentum by 3.</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Guard Break</h2>
          <ul>
            <li>A guard break persists until the fighter with the broken guard takes their next action.</li>
            <li>During a momentum power turn, both actions can be taken against a broken guard before it resets.</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>Stamina Depletion (Stamina = 0)</h2>
          <ul>
            <li>Cannot Move, change Stance, Swap Position, or Attack.</li>
            <li>Direct Block gives <strong>+1 momentum</strong> instead of +2.</li>
            <li>Indirect Block gives <strong>no momentum</strong>.</li>
            <li>Getting Hit deals <strong>−3 momentum and −3 health</strong> instead of −1 and −3.</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>App Notes</h2>
          <ul>
            <li>The app <strong>does not enforce</strong> turn order — any action can be pressed at any time.</li>
            <li>Press <em>Start Turn</em> to apply stamina recovery (+4 ST by default).</li>
            <li>POWER TURN AVAILABLE is a reminder only — it shows when momentum was full at Start Turn and clears when Attack is used.</li>
            <li>Guard Break toggle is manual — players track this themselves.</li>
            <li>Settings are saved automatically. Use the Reset button to restore both fighters to full meters.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
