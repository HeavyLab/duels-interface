import {
  WEIGHT_CLASSES, WEAPONS, GRID_SIZE, STANCES,
  MAX_MOMENTUM, MOMENTUM_DECAY_VALUE,
  HIT_EFFECTS, GUARD_PRESSURE_ON,
  ATTACK_STAMINA_BASE, ATTACK_STAMINA_LESS_EFFECTIVE, ATTACK_MOMENTUM_GAIN,
  GUARD_BREAK_BONUS_DAMAGE, FLOW_ATTACK_THRESHOLD,
} from './defaults.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function maxHealth(f)  { return WEIGHT_CLASSES[f.weightClass]?.maxHealth  ?? 18; }
function maxStamina(f) { return WEIGHT_CLASSES[f.weightClass]?.maxStamina ?? 18; }
function maxGuard(f)   { return WEIGHT_CLASSES[f.weightClass]?.maxGuard   ?? 4;  }

export function getRange(f0, f1) {
  return Math.abs(f0.position - f1.position);
}

export function getEffectiveness(weapon, range) {
  const w = WEAPONS[weapon];
  if (!w) return 'ineffective';
  if (w.effectiveAt.includes(range)) return 'effective';
  if ((w.lessEffectiveAt ?? []).includes(range)) return 'lessEffective';
  return 'ineffective';
}

function stanceGap(a, b) {
  const ORDER = { high: 0, mid: 1, low: 2 };
  return Math.abs((ORDER[a] ?? 1) - (ORDER[b] ?? 1));
}

function getHitType(attackerStance, defenderStance) {
  const gap = stanceGap(attackerStance, defenderStance);
  if (gap === 0) return 'directBlock';
  if (gap === 1) return 'indirectBlock';
  return 'cleanHit';
}

function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function snap(f) {
  return { health: f.health, stamina: f.stamina, momentum: f.momentum };
}

// Medium class: 1st action costs 1 less stamina (only reduces cost, doesn't add stamina)
function withClassBonus(fighter, staminaCost) {
  if (fighter.weightClass === 'medium' && fighter.actionsUsed === 0 && staminaCost < 0) {
    return staminaCost + 1;
  }
  return staminaCost;
}

// ── Main action dispatcher ─────────────────────────────────────────────────────

export function applyAction(fighters, fighterIndex, actionKey, settings) {
  const fighter = fighters[fighterIndex];
  const opponent = fighters[1 - fighterIndex];
  const timestamp = ts();
  const logEntries = [];

  const log = (name, label, before, after) => {
    logEntries.push({
      id: Date.now() + Math.random(),
      timestamp,
      fighterName: name,
      actionLabel: label,
      before,
      after,
    });
  };

  // Work on shallow-cloned copies
  let f = fighters.map(x => ({ ...x }));

  switch (actionKey) {

    // ── Start Turn ─────────────────────────────────────────────────────────────
    case 'startOfTurn': {
      const before = snap(f[fighterIndex]);

      // Decay momentum if power turn wasn't consumed
      let momentum = f[fighterIndex].momentum;
      if (f[fighterIndex].powerTurnAvailable) {
        momentum = Math.min(momentum, MOMENTUM_DECAY_VALUE);
      }

      // Check power turn availability BEFORE adding stamina (and after decay)
      const powerTurnAvailable = momentum >= MAX_MOMENTUM;

      // +4 stamina
      const newStamina = clamp(f[fighterIndex].stamina + 4, 0, maxStamina(f[fighterIndex]));

      // Tick guard reset countdown (counts this fighter's own start turns)
      let newGuard = { ...(f[fighterIndex].stanceGuard ?? { high: 0, mid: 0, low: 0 }) };
      let newCountdown = f[fighterIndex].startTurnsToGuardReset ?? 0;
      if (newCountdown > 0) {
        newCountdown -= 1;
        if (newCountdown === 0) {
          const mg = maxGuard(f[fighterIndex]);
          STANCES.forEach(s => { if (newGuard[s] >= mg) newGuard[s] = 0; });
        }
      }

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina: newStamina,
        momentum,
        actionsUsed: 0,
        powerTurnAvailable,
        extraMoveAvailable: false,
        flowBonusActive: false,
        stanceGuard: newGuard,
        startTurnsToGuardReset: newCountdown,
      };
      log(fighter.name, 'Start Turn', before, snap(f[fighterIndex]));
      break;
    }

    // ── Move ───────────────────────────────────────────────────────────────────
    case 'moveForward':
    case 'moveBackward': {
      const hasExtraMove = f[fighterIndex].extraMoveAvailable;

      // Check action budget (extra move token bypasses actionsUsed)
      if (!hasExtraMove && f[fighterIndex].actionsUsed >= 2) return null;
      if (f[fighterIndex].stamina <= 0) return null;

      const curPos  = f[fighterIndex].position;
      const oppPos  = f[1 - fighterIndex].position;
      const towardDir = oppPos > curPos ? 1 : -1;
      const dir     = actionKey === 'moveForward' ? towardDir : -towardDir;
      const newPos  = curPos + dir;

      if (newPos === oppPos || newPos < 0 || newPos >= GRID_SIZE) return null;

      const cost = withClassBonus(f[fighterIndex], -1);
      const before = snap(f[fighterIndex]);

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina: clamp(f[fighterIndex].stamina + cost, 0, maxStamina(f[fighterIndex])),
        position: newPos,
        actionsUsed: hasExtraMove ? f[fighterIndex].actionsUsed : f[fighterIndex].actionsUsed + 1,
        extraMoveAvailable: false,
      };
      log(fighter.name, actionKey === 'moveForward' ? 'Move Forward' : 'Move Backward', before, snap(f[fighterIndex]));
      break;
    }

    // ── Stance (cost only; actual new stance set by reducer) ──────────────────
    case 'stance': {
      if (f[fighterIndex].actionsUsed >= 2) return null;
      if (f[fighterIndex].stamina <= 0) return null;

      const cost = withClassBonus(f[fighterIndex], -1);
      const before = snap(f[fighterIndex]);

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina: clamp(f[fighterIndex].stamina + cost, 0, maxStamina(f[fighterIndex])),
        actionsUsed: f[fighterIndex].actionsUsed + 1,
      };
      log(fighter.name, 'Stance Change', before, snap(f[fighterIndex]));
      break;
    }

    // ── Attack ─────────────────────────────────────────────────────────────────
    case 'attack': {
      if (f[fighterIndex].actionsUsed >= 2) return null;
      if (f[fighterIndex].stamina <= 0) return null;

      const range = getRange(f[fighterIndex], f[1 - fighterIndex]);
      const weapon = f[fighterIndex].weapon ?? 'sword';
      const effectiveness = getEffectiveness(weapon, range);
      if (effectiveness === 'ineffective') return null;

      let cost = effectiveness === 'lessEffective'
        ? ATTACK_STAMINA_LESS_EFFECTIVE
        : ATTACK_STAMINA_BASE;

      // Flow bonus: -3 ST on this attack (if active)
      if (f[fighterIndex].flowBonusActive) cost += 3;

      cost = withClassBonus(f[fighterIndex], cost);

      const beforeAttacker = snap(f[fighterIndex]);
      const wasPowerGuard = f[fighterIndex].powerGuardActive;

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:      clamp(f[fighterIndex].stamina  + cost,               0, maxStamina(f[fighterIndex])),
        momentum:     clamp(f[fighterIndex].momentum + ATTACK_MOMENTUM_GAIN, 0, MAX_MOMENTUM),
        actionsUsed:  f[fighterIndex].actionsUsed + 1,
        powerTurnAvailable: false,
        powerGuardActive: false,
        flowBonusActive: false,
      };
      const rangeLabel = effectiveness === 'lessEffective' ? ' (less effective range)' : '';
      log(fighter.name, `Attack${rangeLabel}`, beforeAttacker, snap(f[fighterIndex]));

      // ── Auto-resolve defender response ────────────────────────────────────
      if (settings?.automaticResolution !== false) {
        const attackerStance = fighter.stance ?? 'mid';
        const defenderStance = f[1 - fighterIndex].stance ?? 'mid';
        const weaponDef = WEAPONS[weapon];
        const defMG = maxGuard(f[1 - fighterIndex]);

        // Guard break override: check if defender's guard at attacker's stance is broken
        const guardAtAttackerStance = f[1 - fighterIndex].stanceGuard?.[attackerStance] ?? 0;
        const isGuardBreakHit = guardAtAttackerStance >= defMG;

        const hitType = isGuardBreakHit ? 'cleanHit' : getHitType(attackerStance, defenderStance);
        const hitEffect = HIT_EFFECTS[hitType] ?? {};

        // Damage
        const baseDmg = weaponDef?.damage?.[hitType] ?? 0;
        let healthDelta = -baseDmg;
        if (isGuardBreakHit) healthDelta -= GUARD_BREAK_BONUS_DAMAGE;
        // Less effective: -1 damage (min 0 impact on health)
        if (effectiveness === 'lessEffective' && healthDelta < 0) {
          healthDelta = Math.min(healthDelta + 1, 0);
        }

        // Apply guard pressure
        const pressuredStances = GUARD_PRESSURE_ON[attackerStance] ?? [];
        let newDefGuard = { ...(f[1 - fighterIndex].stanceGuard ?? { high: 0, mid: 0, low: 0 }) };
        let newCountdown = f[1 - fighterIndex].startTurnsToGuardReset ?? 0;
        const guardPressure = wasPowerGuard ? 2 : 1; // Heavy special: double pressure
        let didBreak = false;
        for (const s of pressuredStances) {
          newDefGuard[s] = Math.min((newDefGuard[s] ?? 0) + guardPressure, defMG);
          if (newDefGuard[s] >= defMG) didBreak = true;
        }
        if (didBreak && newCountdown === 0) newCountdown = 2;

        // Spear: attacker gets +1 MO on clean hit
        if (hitType === 'cleanHit' && weaponDef?.cleanHitMomentumBonus) {
          f[fighterIndex] = {
            ...f[fighterIndex],
            momentum: clamp(f[fighterIndex].momentum + weaponDef.cleanHitMomentumBonus, 0, MAX_MOMENTUM),
          };
        }

        const beforeDef = snap(f[1 - fighterIndex]);
        f[1 - fighterIndex] = {
          ...f[1 - fighterIndex],
          health:   clamp(f[1 - fighterIndex].health   + healthDelta,          0, maxHealth(f[1 - fighterIndex])),
          stamina:  clamp(f[1 - fighterIndex].stamina  + (hitEffect.stamina ?? 0),  0, maxStamina(f[1 - fighterIndex])),
          momentum: clamp(f[1 - fighterIndex].momentum + (hitEffect.momentum ?? 0), 0, MAX_MOMENTUM),
          stanceGuard: newDefGuard,
          startTurnsToGuardReset: newCountdown,
        };

        const hitLabel = isGuardBreakHit
          ? 'Guard Break Hit (auto)'
          : { directBlock: 'Direct Block (auto)', indirectBlock: 'Indirect Block (auto)', cleanHit: 'Clean Hit (auto)' }[hitType];

        log(opponent.name, hitLabel, beforeDef, snap(f[1 - fighterIndex]));
      }
      break;
    }

    // ── Swap Position ──────────────────────────────────────────────────────────
    case 'swapPosition': {
      if (f[fighterIndex].actionsUsed >= 2) return null;

      const range = getRange(f[fighterIndex], f[1 - fighterIndex]);
      if (range !== 1) return null;

      const cost = withClassBonus(f[fighterIndex], -6);
      if (f[fighterIndex].stamina + cost < 0) return null;

      const before    = snap(f[fighterIndex]);
      const beforeOpp = snap(f[1 - fighterIndex]);
      const myPos  = f[fighterIndex].position;
      const oppPos = f[1 - fighterIndex].position;

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:     clamp(f[fighterIndex].stamina + cost, 0, maxStamina(f[fighterIndex])),
        momentum:    0,
        position:    oppPos,
        actionsUsed: f[fighterIndex].actionsUsed + 1,
      };
      f[1 - fighterIndex] = { ...f[1 - fighterIndex], position: myPos };

      log(fighter.name,  'Swap Position',          before,    snap(f[fighterIndex]));
      log(opponent.name, 'Swap (position effect)', beforeOpp, snap(f[1 - fighterIndex]));
      break;
    }

    // ── Rest ───────────────────────────────────────────────────────────────────
    case 'rest': {
      if (f[fighterIndex].actionsUsed >= 2) return null;
      const isFirst = f[fighterIndex].actionsUsed === 0;
      const before = snap(f[fighterIndex]);

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:     clamp(f[fighterIndex].stamina + (isFirst ? 2 : 1), 0, maxStamina(f[fighterIndex])),
        actionsUsed: isFirst ? 2 : f[fighterIndex].actionsUsed + 1,
      };
      log(fighter.name, isFirst ? 'Rest — turn ends (+2 ST)' : 'Rest (+1 ST)', before, snap(f[fighterIndex]));
      break;
    }

    // ── Spend Power Turn ───────────────────────────────────────────────────────
    case 'spendPowerTurn': {
      if (!f[fighterIndex].powerTurnAvailable) return null;
      if (f[fighterIndex].actionsUsed < 2) return null; // only at end of turn

      const before = snap(f[fighterIndex]);
      f[fighterIndex] = {
        ...f[fighterIndex],
        momentum:          0,
        actionsUsed:       0,
        powerTurnAvailable: false,
      };
      log(fighter.name, 'Power Turn — bonus turn', before, snap(f[fighterIndex]));
      break;
    }

    // ── Flow Attack ────────────────────────────────────────────────────────────
    case 'flowAttack': {
      if (f[fighterIndex].momentum < FLOW_ATTACK_THRESHOLD) return null;
      if (f[fighterIndex].actionsUsed >= 2) return null;
      if (f[fighterIndex].stamina <= 0) return null;

      // Flow attack: costs -3 MO and -1 ST (stance cost), grants flow bonus
      const cost = withClassBonus(f[fighterIndex], -1);
      const before = snap(f[fighterIndex]);

      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:        clamp(f[fighterIndex].stamina  + cost, 0, maxStamina(f[fighterIndex])),
        momentum:       clamp(f[fighterIndex].momentum - 3,    0, MAX_MOMENTUM),
        actionsUsed:    f[fighterIndex].actionsUsed + 1,
        flowBonusActive: true, // next attack costs 3 less ST
      };
      log(fighter.name, 'Flow Attack (stance + flow bonus)', before, snap(f[fighterIndex]));
      break;
    }

    // ── Light Special: Extra Move ──────────────────────────────────────────────
    case 'lightExtraMove': {
      if (f[fighterIndex].weightClass !== 'light') return null;
      if (f[fighterIndex].stamina < 3)   return null;
      if (f[fighterIndex].momentum < 1)  return null;

      const before = snap(f[fighterIndex]);
      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:           clamp(f[fighterIndex].stamina  - 3, 0, maxStamina(f[fighterIndex])),
        momentum:          clamp(f[fighterIndex].momentum - 1, 0, MAX_MOMENTUM),
        extraMoveAvailable: true,
      };
      log(fighter.name, 'Extra Move Token (Light)', before, snap(f[fighterIndex]));
      break;
    }

    // ── Heavy Special: Power Guard ─────────────────────────────────────────────
    case 'heavyPowerGuard': {
      if (f[fighterIndex].weightClass !== 'heavy') return null;
      if (f[fighterIndex].stamina < 3)  return null;
      if (f[fighterIndex].momentum < 2) return null;

      const before = snap(f[fighterIndex]);
      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:         clamp(f[fighterIndex].stamina  - 3, 0, maxStamina(f[fighterIndex])),
        momentum:        clamp(f[fighterIndex].momentum - 2, 0, MAX_MOMENTUM),
        powerGuardActive: true,
      };
      log(fighter.name, 'Power Guard (Heavy)', before, snap(f[fighterIndex]));
      break;
    }

    // ── Manual block/hit buttons (auto-resolution OFF) ─────────────────────────
    case 'directBlock': {
      const before = snap(f[fighterIndex]);
      f[fighterIndex] = {
        ...f[fighterIndex],
        momentum: clamp(f[fighterIndex].momentum + 2, 0, MAX_MOMENTUM),
      };
      log(fighter.name, 'Direct Block', before, snap(f[fighterIndex]));
      break;
    }
    case 'indirectBlock': {
      if (f[fighterIndex].stamina <= 0) return null;
      const before = snap(f[fighterIndex]);
      f[fighterIndex] = {
        ...f[fighterIndex],
        stamina:  clamp(f[fighterIndex].stamina  - 1, 0, maxStamina(f[fighterIndex])),
        momentum: clamp(f[fighterIndex].momentum + 1, 0, MAX_MOMENTUM),
      };
      log(fighter.name, 'Indirect Block', before, snap(f[fighterIndex]));
      break;
    }
    case 'cleanHit': {
      const before = snap(f[fighterIndex]);
      f[fighterIndex] = {
        ...f[fighterIndex],
        momentum: clamp(f[fighterIndex].momentum - 2, 0, MAX_MOMENTUM),
        health:   clamp(f[fighterIndex].health   - 2, 0, maxHealth(f[fighterIndex])),
      };
      log(fighter.name, 'Clean Hit (taken)', before, snap(f[fighterIndex]));
      break;
    }
    case 'incrementGuard': {
      // Manual guard pressure (+1 to a specific stance guard)
      // The stance is passed via the action; handled in reducer directly (not here)
      return null;
    }

    default:
      return null;
  }

  return { newFighters: f, logEntries };
}
