import { ACTION_DEFINITIONS } from './data/actions';
import { DUEL_RULES } from './data/rules';
import { WEAPONS } from './data/weapons';
import { WEIGHT_CLASSES } from './data/weightClasses';
import {
  GUARD_ZONES,
  RANGE_BANDS,
  type ActionCommand,
  type CombatLogEntry,
  type DerivedCombatStats,
  type DuelState,
  type FighterEffect,
  type GuardZone,
  type LegalAction,
  type PlayerLoadout,
  type PlayerState,
  type RangeBand,
  type Resources
} from './types';

const TURN_TIME_FORMAT = new Intl.DateTimeFormat([], {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function zoneLabel(zone: GuardZone): string {
  return zone[0].toUpperCase() + zone.slice(1);
}

function rangeLabel(range: RangeBand): string {
  return range[0].toUpperCase() + range.slice(1);
}

function getRangeIndex(range: RangeBand): number {
  return RANGE_BANDS.indexOf(range);
}

function shiftRange(range: RangeBand, direction: -1 | 1): RangeBand {
  const nextIndex = clamp(getRangeIndex(range) + direction, 0, RANGE_BANDS.length - 1);
  return RANGE_BANDS[nextIndex];
}

function getEffect(player: PlayerState, effectId: FighterEffect['id']): FighterEffect | undefined {
  return player.effects.find((effect) => effect.id === effectId);
}

function hasEffect(player: PlayerState, effectId: FighterEffect['id']): boolean {
  return Boolean(getEffect(player, effectId));
}

function setEffect(player: PlayerState, effect: FighterEffect): PlayerState {
  const existing = getEffect(player, effect.id);
  if (!existing) {
    return {
      ...player,
      effects: [...player.effects, effect]
    };
  }

  return {
    ...player,
    effects: player.effects.map((item) =>
      item.id === effect.id
        ? { ...item, remainingTurns: Math.max(item.remainingTurns, effect.remainingTurns) }
        : item
    )
  };
}

function removeEffect(player: PlayerState, effectId: FighterEffect['id']): PlayerState {
  return {
    ...player,
    effects: player.effects.filter((effect) => effect.id !== effectId)
  };
}

function tickEffects(player: PlayerState): PlayerState {
  return {
    ...player,
    effects: player.effects
      .map((effect) => ({ ...effect, remainingTurns: effect.remainingTurns - 1 }))
      .filter((effect) => effect.remainingTurns > 0)
  };
}

function snapshotResources(player: PlayerState): Resources {
  return { ...player.resources };
}

function clampResources(player: PlayerState): PlayerState {
  return {
    ...player,
    resources: {
      health: clamp(player.resources.health, 0, player.stats.maxHealth),
      stamina: clamp(player.resources.stamina, 0, player.stats.maxStamina),
      momentum: clamp(player.resources.momentum, 0, player.stats.maxMomentum)
    }
  };
}

function updateResources(player: PlayerState, delta: Partial<Resources>): PlayerState {
  return clampResources({
    ...player,
    resources: {
      health: player.resources.health + (delta.health ?? 0),
      stamina: player.resources.stamina + (delta.stamina ?? 0),
      momentum: player.resources.momentum + (delta.momentum ?? 0)
    }
  });
}

export function deriveCombatStats(loadout: Pick<PlayerLoadout, 'weaponId' | 'weightClassId'>): DerivedCombatStats {
  const weightClass = WEIGHT_CLASSES[loadout.weightClassId];
  const weapon = WEAPONS[loadout.weaponId];

  return {
    maxHealth: DUEL_RULES.baseResources.health + weightClass.modifiers.health,
    maxStamina: DUEL_RULES.baseResources.stamina + weightClass.modifiers.stamina,
    maxMomentum: DUEL_RULES.baseResources.momentum + weightClass.modifiers.momentum,
    strikeDamage: weapon.attackDamage + weightClass.modifiers.damage,
    powerStrikeDamage: weapon.powerAttackDamage + weightClass.modifiers.damage,
    accuracy: weapon.accuracy + weightClass.modifiers.accuracy,
    exactGuardDefense: 3 + weapon.guardBonus + weightClass.modifiers.exactGuard,
    offGuardDefense: 1 + weightClass.modifiers.offGuard,
    movementCost: Math.max(1, 1 + weightClass.modifiers.moveCost),
    braceRecovery: 3 + Math.max(0, weapon.guardBonus),
    recoverRecovery: 5 + Math.max(0, weightClass.modifiers.stamina),
    focusGain: 2 + weapon.focusBonus
  };
}

function createPlayer(playerId: string, loadout: PlayerLoadout): PlayerState {
  const stats = deriveCombatStats(loadout);

  return {
    id: playerId,
    name: loadout.name.trim() || playerId,
    weightClassId: loadout.weightClassId,
    weaponId: loadout.weaponId,
    stats,
    resources: {
      health: stats.maxHealth,
      stamina: stats.maxStamina,
      momentum: 0
    },
    guard: DUEL_RULES.startingGuard,
    effects: []
  };
}

export function createDuelState(loadouts: [PlayerLoadout, PlayerLoadout]): DuelState {
  return {
    version: DUEL_RULES.version,
    createdAt: new Date().toISOString(),
    turn: 1,
    activePlayerIndex: 0,
    range: DUEL_RULES.startingRange,
    players: [createPlayer('player-1', loadouts[0]), createPlayer('player-2', loadouts[1])],
    log: [],
    winnerId: null
  };
}

function createLogEntry(
  state: DuelState,
  actor: PlayerState,
  action: LegalAction,
  details: string[],
  rangeBefore: RangeBand,
  rangeAfter: RangeBand,
  beforePlayers: [PlayerState, PlayerState],
  afterPlayers: [PlayerState, PlayerState]
): CombatLogEntry {
  return {
    id: `${state.turn}-${actor.id}-${action.id}-${Date.now()}`,
    turn: state.turn,
    actorId: actor.id,
    actorName: actor.name,
    actionId: action.id,
    actionLabel: action.label,
    summary: details[0] ?? action.description,
    details,
    rangeBefore,
    rangeAfter,
    createdAt: TURN_TIME_FORMAT.format(new Date()),
    resourceChanges: beforePlayers.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      before: snapshotResources(player),
      after: snapshotResources(afterPlayers[index])
    }))
  };
}

function buildZoneActionId(prefix: 'shift-guard' | 'strike' | 'power-strike', zone: GuardZone): string {
  return `${prefix}:${zone}`;
}

function createAction(command: ActionCommand, label: string, description: string, group: string): LegalAction {
  return {
    id: command.zone ? buildZoneActionId(command.kind as 'shift-guard' | 'strike' | 'power-strike', command.zone) : command.kind,
    group,
    label,
    description,
    command
  };
}

export function getLegalActions(state: DuelState): LegalAction[] {
  if (state.winnerId) {
    return [];
  }

  const actor = state.players[state.activePlayerIndex];
  const weapon = WEAPONS[actor.weaponId];
  const legal: LegalAction[] = [];

  if (getRangeIndex(state.range) > 0 && actor.resources.stamina >= actor.stats.movementCost) {
    const action = ACTION_DEFINITIONS.advance;
    legal.push(createAction({ kind: 'advance' }, action.label, action.description, action.group));
  }

  if (getRangeIndex(state.range) < RANGE_BANDS.length - 1 && actor.resources.stamina >= actor.stats.movementCost) {
    const action = ACTION_DEFINITIONS.retreat;
    legal.push(createAction({ kind: 'retreat' }, action.label, action.description, action.group));
  }

  if (actor.resources.stamina >= DUEL_RULES.actions.shiftGuardCost) {
    const action = ACTION_DEFINITIONS['shift-guard'];
    GUARD_ZONES.filter((zone) => zone !== actor.guard).forEach((zone) => {
      legal.push(
        createAction(
          { kind: 'shift-guard', zone },
          `${action.label}: ${zoneLabel(zone)}`,
          `Move guard coverage to ${zoneLabel(zone)}.`,
          action.group
        )
      );
    });
  }

  if (weapon.effectiveRanges.includes(state.range)) {
    GUARD_ZONES.forEach((zone) => {
      const attack = ACTION_DEFINITIONS.strike;
      if (actor.resources.stamina >= weapon.attackCost) {
        legal.push(
          createAction(
            { kind: 'strike', zone },
            `${attack.label}: ${zoneLabel(zone)}`,
            `Attack the ${zoneLabel(zone)} line with a standard committed strike.`,
            attack.group
          )
        );
      }

      const powerAttack = ACTION_DEFINITIONS['power-strike'];
      if (
        actor.resources.stamina >= weapon.powerAttackCost &&
        actor.resources.momentum >= DUEL_RULES.actions.powerStrikeMomentumCost
      ) {
        legal.push(
          createAction(
            { kind: 'power-strike', zone },
            `${powerAttack.label}: ${zoneLabel(zone)}`,
            `Spend momentum for a stronger attack into ${zoneLabel(zone)}.`,
            powerAttack.group
          )
        );
      }
    });
  }

  const brace = ACTION_DEFINITIONS.brace;
  legal.push(createAction({ kind: 'brace' }, brace.label, brace.description, brace.group));

  const recover = ACTION_DEFINITIONS.recover;
  legal.push(createAction({ kind: 'recover' }, recover.label, recover.description, recover.group));

  const focus = ACTION_DEFINITIONS.focus;
  if (actor.resources.stamina >= 1 && actor.resources.momentum < actor.stats.maxMomentum) {
    legal.push(createAction({ kind: 'focus' }, focus.label, focus.description, focus.group));
  }

  return legal;
}

function findLegalAction(state: DuelState, actionId: string): LegalAction | undefined {
  return getLegalActions(state).find((action) => action.id === actionId);
}

function resolveAttack(
  actor: PlayerState,
  target: PlayerState,
  state: DuelState,
  action: LegalAction
): {
  actor: PlayerState;
  target: PlayerState;
  details: string[];
} {
  if (!action.command.zone) {
    return {
      actor,
      target,
      details: ['Attack failed: no target lane was provided.']
    };
  }

  const zone = action.command.zone;
  const weapon = WEAPONS[actor.weaponId];
  const isPowerStrike = action.command.kind === 'power-strike';
  const staminaCost = isPowerStrike ? weapon.powerAttackCost : weapon.attackCost;
  const momentumCost = isPowerStrike ? DUEL_RULES.actions.powerStrikeMomentumCost : 0;
  const attackDamage = isPowerStrike ? actor.stats.powerStrikeDamage : actor.stats.strikeDamage;
  const attackBonus =
    actor.stats.accuracy +
    Math.floor(actor.resources.momentum / 2) +
    (hasEffect(actor, 'focused') ? 1 : 0);
  const defenseScore =
    (zone === target.guard ? target.stats.exactGuardDefense - DUEL_RULES.attack.exactGuardHitPenalty : target.stats.offGuardDefense) +
    (hasEffect(target, 'guarded') ? DUEL_RULES.actions.braceGuardBonus : 0);
  const margin = attackBonus - defenseScore;
  const details: string[] = [];

  let nextActor = updateResources(actor, {
    stamina: -staminaCost,
    momentum: -momentumCost
  });
  let nextTarget = target;

  if (hasEffect(nextActor, 'focused')) {
    nextActor = removeEffect(nextActor, 'focused');
  }

  if (hasEffect(nextTarget, 'guarded')) {
    nextTarget = removeEffect(nextTarget, 'guarded');
  }

  const exposedBonus = hasEffect(nextTarget, 'exposed') ? DUEL_RULES.attack.exposedBonusDamage : 0;

  if (margin >= 1) {
    const damage = attackDamage + exposedBonus;
    nextTarget = updateResources(nextTarget, {
      health: -damage,
      momentum: -DUEL_RULES.attack.targetMomentumLossOnHit
    });
    nextActor = updateResources(nextActor, {
      momentum: isPowerStrike ? DUEL_RULES.attack.powerHitMomentumGain : DUEL_RULES.attack.hitMomentumGain
    });

    details.push(
      `${actor.name} lands ${action.label.toLowerCase()} for ${damage} damage on ${target.name}.`
    );

    if (isPowerStrike || zone !== target.guard) {
      nextTarget = setEffect(nextTarget, {
        id: 'exposed',
        remainingTurns: DUEL_RULES.timings.exposedTurns
      });
      details.push(`${target.name} becomes exposed for the next exchange.`);
    }
  } else if (margin === 0) {
    if (zone === target.guard) {
      nextTarget = updateResources(nextTarget, {
        stamina: -(isPowerStrike ? DUEL_RULES.attack.blockedPowerStrikeStaminaDamage : DUEL_RULES.attack.blockedStrikeStaminaDamage)
      });
      nextActor = updateResources(nextActor, { momentum: 1 });
      details.push(`${target.name} blocks the lane but loses stamina absorbing the blow.`);

      if (isPowerStrike) {
        nextTarget = setEffect(nextTarget, {
          id: 'exposed',
          remainingTurns: DUEL_RULES.timings.exposedTurns
        });
        details.push(`${target.name}'s guard is shaken and they are exposed.`);
      }
    } else {
      const chipDamage = (isPowerStrike ? DUEL_RULES.attack.powerGlancingDamage : DUEL_RULES.attack.glancingDamage) + exposedBonus;
      nextTarget = updateResources(nextTarget, {
        health: -chipDamage
      });
      nextActor = updateResources(nextActor, { momentum: 1 });
      details.push(`${actor.name} clips ${target.name} for ${chipDamage} glancing damage.`);
    }
  } else {
    nextActor = updateResources(nextActor, {
      momentum: -DUEL_RULES.attack.missMomentumLoss
    });
    nextTarget = updateResources(nextTarget, {
      momentum: DUEL_RULES.attack.evadeMomentumGain
    });
    details.push(`${target.name} avoids the attack and steals the tempo.`);
  }

  return {
    actor: nextActor,
    target: nextTarget,
    details
  };
}

function concludeTurn(state: DuelState, actorIndex: 0 | 1, players: [PlayerState, PlayerState], range: RangeBand): DuelState {
  const resolvedPlayers = [...players] as [PlayerState, PlayerState];
  resolvedPlayers[actorIndex] = tickEffects(resolvedPlayers[actorIndex]);

  const defeated = resolvedPlayers.find((player) => player.resources.health <= 0);
  if (defeated) {
    return {
      ...state,
      players: resolvedPlayers,
      range,
      winnerId: defeated.id
    };
  }

  return {
    ...state,
    players: resolvedPlayers,
    range,
    turn: state.turn + 1,
    activePlayerIndex: actorIndex === 0 ? 1 : 0,
    winnerId: null
  };
}

export function resolveDuelAction(state: DuelState, actionId: string): DuelState {
  const action = findLegalAction(state, actionId);
  if (!action) {
    return state;
  }

  const actorIndex = state.activePlayerIndex;
  const targetIndex = actorIndex === 0 ? 1 : 0;
  const actor = state.players[actorIndex];
  const target = state.players[targetIndex];
  const beforePlayers = state.players;
  let afterActor = actor;
  let afterTarget = target;
  let rangeAfter = state.range;
  let details: string[] = [];

  switch (action.command.kind) {
    case 'advance': {
      afterActor = updateResources(actor, { stamina: -actor.stats.movementCost });
      rangeAfter = shiftRange(state.range, -1);
      details = [`${actor.name} advances from ${rangeLabel(state.range)} to ${rangeLabel(rangeAfter)} range.`];
      break;
    }
    case 'retreat': {
      afterActor = updateResources(actor, { stamina: -actor.stats.movementCost });
      rangeAfter = shiftRange(state.range, 1);
      details = [`${actor.name} retreats from ${rangeLabel(state.range)} to ${rangeLabel(rangeAfter)} range.`];
      break;
    }
    case 'shift-guard': {
      if (!action.command.zone) {
        return state;
      }
      afterActor = updateResources(actor, { stamina: -DUEL_RULES.actions.shiftGuardCost });
      afterActor = {
        ...afterActor,
        guard: action.command.zone
      };
      details = [`${actor.name} shifts guard coverage to ${zoneLabel(action.command.zone)}.`];
      break;
    }
    case 'brace': {
      afterActor = updateResources(actor, {
        stamina: afterActor.stats.braceRecovery
      });
      afterActor = removeEffect(afterActor, 'exposed');
      afterActor = setEffect(afterActor, {
        id: 'guarded',
        remainingTurns: DUEL_RULES.timings.guardedTurns
      });
      details = [
        `${actor.name} braces, recovers ${afterActor.stats.braceRecovery} stamina, and steadies their defense.`
      ];
      break;
    }
    case 'recover': {
      afterActor = updateResources(actor, {
        stamina: afterActor.stats.recoverRecovery,
        momentum: -DUEL_RULES.actions.recoverMomentumLoss
      });
      details = [
        `${actor.name} recovers ${afterActor.stats.recoverRecovery} stamina but gives up some momentum.`
      ];
      break;
    }
    case 'focus': {
      afterActor = updateResources(actor, {
        stamina: -1,
        momentum: afterActor.stats.focusGain
      });
      afterActor = setEffect(afterActor, {
        id: 'focused',
        remainingTurns: DUEL_RULES.timings.focusedTurns
      });
      details = [`${actor.name} focuses and banks momentum for the next attack.`];
      break;
    }
    case 'strike':
    case 'power-strike': {
      const attackResult = resolveAttack(actor, target, state, action);
      afterActor = attackResult.actor;
      afterTarget = attackResult.target;
      details = attackResult.details;
      break;
    }
  }

  const nextPlayers = [...state.players] as [PlayerState, PlayerState];
  nextPlayers[actorIndex] = afterActor;
  nextPlayers[targetIndex] = afterTarget;

  const nextState = concludeTurn(state, actorIndex, nextPlayers, rangeAfter);
  const logEntry = createLogEntry(state, actor, action, details, state.range, rangeAfter, beforePlayers, nextState.players);

  return {
    ...nextState,
    log: [logEntry, ...nextState.log].slice(0, DUEL_RULES.maxLogEntries)
  };
}

export function getActivePlayer(state: DuelState): PlayerState {
  return state.players[state.activePlayerIndex];
}

export function getInactivePlayer(state: DuelState): PlayerState {
  return state.players[state.activePlayerIndex === 0 ? 1 : 0];
}

export function describePlayerLoadout(loadout: Pick<PlayerState, 'weaponId' | 'weightClassId'>): string {
  return `${WEIGHT_CLASSES[loadout.weightClassId].label} / ${WEAPONS[loadout.weaponId].label}`;
}

export function getWeaponRangeSummary(weaponId: PlayerState['weaponId']): string {
  return WEAPONS[weaponId].effectiveRanges.map(rangeLabel).join(' / ');
}
