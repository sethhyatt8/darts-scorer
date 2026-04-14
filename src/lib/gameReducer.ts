import { applyCricketPendingTaps, cricketHasClosedAll, createCricketState } from './scoring/cricket'
import { applyX01Throw, createX01State, finalizeTurnSummary, getTurnTotal } from './scoring/x01'
import type {
  CricketOptions,
  CricketPlayerState,
  CricketTarget,
  MatchState,
  ThrowInput,
  TurnSummary,
  X01Options,
} from '../types/game'

export type GameAction =
  | { type: 'THROW'; throwInput: ThrowInput }
  | { type: 'CRICKET_TAP'; target: CricketTarget }
  | { type: 'END_TURN' }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'START_MATCH'; mode: 'x01' | 'cricket'; playerIds: string[]; x01Options: X01Options; cricketOptions: CricketOptions }

const emptyTurn = (): TurnSummary => ({ throws: [], total: 0 })

/** Max mark taps queued before Next Turn (cricket). */
export const CRICKET_MAX_TAPS_PER_TURN = 9

function cricketCommittedTurnSummary(markCount: number): TurnSummary {
  return { throws: [], total: 0, bust: false, cricketMarkCount: markCount }
}

export function createMatchState(args: {
  mode: 'x01' | 'cricket'
  playerIds: string[]
  x01Options: X01Options
  cricketOptions: CricketOptions
}): MatchState {
  const x01State: MatchState['x01State'] = {}
  const cricketState: MatchState['cricketState'] = {}
  args.playerIds.forEach((id) => {
    x01State[id] = createX01State(args.x01Options.startScore)
    cricketState[id] = createCricketState()
  })

  return {
    mode: args.mode,
    playerIds: args.playerIds,
    activePlayerIndex: 0,
    currentTurn: emptyTurn(),
    lastTurns: {},
    winnerId: null,
    x01Options: args.x01Options,
    cricketOptions: args.cricketOptions,
    x01State,
    cricketState,
    cricketPendingTaps: [],
    turnHistory: [],
    stateHistory: [],
  }
}

function pushSnapshot(state: MatchState): MatchState {
  return {
    ...state,
    stateHistory: [
      ...state.stateHistory,
      {
        x01State: state.x01State,
        cricketState: state.cricketState,
        currentTurn: state.currentTurn,
        activePlayerIndex: state.activePlayerIndex,
        winnerId: state.winnerId,
        lastTurns: state.lastTurns,
        turnHistory: state.turnHistory,
        cricketPendingTaps: state.cricketPendingTaps,
      },
    ],
  }
}

function nextPlayerIndex(state: MatchState): number {
  return (state.activePlayerIndex + 1) % state.playerIds.length
}

/** Active player’s board including queued single-mark taps (cricket only). */
export function cricketDisplayBoard(state: MatchState): Record<string, CricketPlayerState> {
  if (state.mode !== 'cricket') return state.cricketState
  const activePlayerId = state.playerIds[state.activePlayerIndex]
  if (!activePlayerId || state.cricketPendingTaps.length === 0) return state.cricketState
  const opponents = state.playerIds.filter((id) => id !== activePlayerId).map((id) => state.cricketState[id])
  return {
    ...state.cricketState,
    [activePlayerId]: applyCricketPendingTaps(
      state.cricketState[activePlayerId],
      opponents,
      state.cricketPendingTaps,
      state.cricketOptions.pointsMode,
    ),
  }
}

export function reduceMatch(state: MatchState, action: GameAction): MatchState {
  if (action.type === 'START_MATCH') {
    return createMatchState({
      mode: action.mode,
      playerIds: action.playerIds,
      x01Options: action.x01Options,
      cricketOptions: action.cricketOptions,
    })
  }

  if (action.type === 'RESET') {
    return createMatchState({
      mode: state.mode,
      playerIds: state.playerIds,
      x01Options: state.x01Options,
      cricketOptions: state.cricketOptions,
    })
  }

  if (action.type === 'UNDO') {
    const previous = state.stateHistory[state.stateHistory.length - 1]
    if (!previous) return state
    return {
      ...state,
      ...previous,
      stateHistory: state.stateHistory.slice(0, -1),
    }
  }

  if (state.winnerId) return state
  const activePlayerId = state.playerIds[state.activePlayerIndex]

  if (action.type === 'END_TURN') {
    if (state.mode === 'cricket') {
      if (state.cricketPendingTaps.length === 0) return state
      const baseState = pushSnapshot(state)
      const opponents = state.playerIds.filter((id) => id !== activePlayerId).map((id) => state.cricketState[id])
      if (opponents.length === 0) return state

      const nextActive = applyCricketPendingTaps(
        state.cricketState[activePlayerId],
        opponents,
        state.cricketPendingTaps,
        state.cricketOptions.pointsMode,
      )
      const updatedCricketState = {
        ...state.cricketState,
        [activePlayerId]: nextActive,
      }

      const finalizedTurn = cricketCommittedTurnSummary(state.cricketPendingTaps.length)
      const closes = cricketHasClosedAll(nextActive)
      const maxOpponentPoints = Math.max(...opponents.map((o) => o.points))
      const ahead = nextActive.points >= maxOpponentPoints

      if (closes && ahead) {
        return {
          ...baseState,
          cricketState: updatedCricketState,
          winnerId: activePlayerId,
          cricketPendingTaps: [],
          currentTurn: finalizedTurn,
          lastTurns: { ...state.lastTurns, [activePlayerId]: finalizedTurn },
          turnHistory: [...state.turnHistory, { mode: 'cricket', playerId: activePlayerId, summary: finalizedTurn }],
        }
      }

      return {
        ...baseState,
        cricketState: updatedCricketState,
        cricketPendingTaps: [],
        currentTurn: emptyTurn(),
        lastTurns: { ...state.lastTurns, [activePlayerId]: finalizedTurn },
        turnHistory: [...state.turnHistory, { mode: 'cricket', playerId: activePlayerId, summary: finalizedTurn }],
        activePlayerIndex: nextPlayerIndex(state),
      }
    }

    if (state.currentTurn.throws.length === 0) return state
    const x01State =
      state.mode === 'x01'
        ? {
            ...state.x01State,
            [activePlayerId]: {
              ...state.x01State[activePlayerId],
              turnStartScore: state.x01State[activePlayerId].score,
            },
          }
        : state.x01State

    const finalizedTurn = finalizeTurnSummary(state.currentTurn.throws, state.currentTurn.bust ?? false)
    return {
      ...state,
      currentTurn: emptyTurn(),
      x01State,
      lastTurns: { ...state.lastTurns, [activePlayerId]: finalizedTurn },
      turnHistory: [...state.turnHistory, { mode: state.mode, playerId: activePlayerId, summary: finalizedTurn }],
      activePlayerIndex: nextPlayerIndex(state),
    }
  }

  if (action.type === 'CRICKET_TAP') {
    if (state.mode !== 'cricket') return state
    if (state.cricketPendingTaps.length >= CRICKET_MAX_TAPS_PER_TURN) return state
    const baseState = pushSnapshot(state)
    return {
      ...baseState,
      cricketPendingTaps: [...state.cricketPendingTaps, action.target],
    }
  }

  if (action.type !== 'THROW') return state
  if (state.mode === 'cricket') return state

  const baseState = pushSnapshot(state)
  const throws = [...state.currentTurn.throws, action.throwInput]
  const turnTotal = getTurnTotal(throws)

  const currentPlayerState = state.x01State[activePlayerId]
  const result = applyX01Throw(currentPlayerState, action.throwInput, state.x01Options)

  const updatedX01State = {
    ...state.x01State,
    [activePlayerId]: result.nextPlayerState,
  }

  const currentTurn = {
    throws,
    total: turnTotal,
    bust: result.bust,
  }

  if (result.checkedOut) {
    const winningTurn = finalizeTurnSummary(throws, false)
    return {
      ...baseState,
      x01State: updatedX01State,
      winnerId: activePlayerId,
      currentTurn: winningTurn,
      lastTurns: { ...state.lastTurns, [activePlayerId]: winningTurn },
      turnHistory: [...state.turnHistory, { mode: 'x01', playerId: activePlayerId, summary: winningTurn }],
    }
  }

  if (result.bust || throws.length >= 3) {
    const finalizedTurn = finalizeTurnSummary(throws, result.bust)
    return {
      ...baseState,
      x01State: {
        ...updatedX01State,
        [activePlayerId]: {
          ...updatedX01State[activePlayerId],
          turnStartScore: updatedX01State[activePlayerId].score,
        },
      },
      currentTurn: emptyTurn(),
      lastTurns: { ...state.lastTurns, [activePlayerId]: finalizedTurn },
      turnHistory: [...state.turnHistory, { mode: 'x01', playerId: activePlayerId, summary: finalizedTurn }],
      activePlayerIndex: nextPlayerIndex(state),
    }
  }

  return {
    ...baseState,
    x01State: updatedX01State,
    currentTurn,
  }
}
