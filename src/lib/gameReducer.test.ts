import { describe, expect, it } from 'vitest'
import { createMatchState, reduceMatch } from './gameReducer'
import type { CricketTarget, ThrowInput } from '../types/game'

const d20: ThrowInput = { code: 'D20', value: 40, segment: 20, multiplier: 'D' }
const t20: ThrowInput = { code: 'T20', value: 60, segment: 20, multiplier: 'T' }

describe('game reducer', () => {
  it('advances player after third throw in x01', () => {
    let state = createMatchState({
      mode: 'x01',
      playerIds: ['a', 'b'],
      x01Options: { startScore: 501, doubleIn: false, doubleOut: true },
      cricketOptions: { pointsMode: true },
    })

    state = reduceMatch(state, { type: 'THROW', throwInput: t20 })
    state = reduceMatch(state, { type: 'THROW', throwInput: t20 })
    state = reduceMatch(state, { type: 'THROW', throwInput: t20 })

    expect(state.activePlayerIndex).toBe(1)
    expect(state.currentTurn.throws).toHaveLength(0)
    expect(state.lastTurns.a.total).toBe(180)
  })

  it('supports undo snapshots', () => {
    let state = createMatchState({
      mode: 'x01',
      playerIds: ['a', 'b'],
      x01Options: { startScore: 501, doubleIn: false, doubleOut: true },
      cricketOptions: { pointsMode: true },
    })

    state = reduceMatch(state, { type: 'THROW', throwInput: d20 })
    const reduced = state.x01State.a.score
    state = reduceMatch(state, { type: 'UNDO' })

    expect(reduced).toBe(461)
    expect(state.x01State.a.score).toBe(501)
  })

  it('cricket queues up to 9 taps per turn then Next Turn (END_TURN) commits without dart throw rows', () => {
    let state = createMatchState({
      mode: 'cricket',
      playerIds: ['a', 'b'],
      x01Options: { startScore: 501, doubleIn: false, doubleOut: true },
      cricketOptions: { pointsMode: true },
    })

    const many20 = (): CricketTarget[] => Array.from({ length: 5 }, () => 20 as const)
    for (const t of many20()) {
      state = reduceMatch(state, { type: 'CRICKET_TAP', target: t })
    }
    expect(state.cricketPendingTaps).toHaveLength(5)
    expect(state.cricketState.a.marks[20]).toBe(0)

    state = reduceMatch(state, { type: 'END_TURN' })
    expect(state.cricketPendingTaps).toHaveLength(0)
    expect(state.cricketState.a.marks[20]).toBe(3)
    expect(state.activePlayerIndex).toBe(1)
    const last = state.lastTurns.a
    expect(last.throws).toHaveLength(0)
    expect(last.cricketMarkCount).toBe(5)
  })

  it('cricket ignores taps beyond 9 per turn', () => {
    let state = createMatchState({
      mode: 'cricket',
      playerIds: ['a', 'b'],
      x01Options: { startScore: 501, doubleIn: false, doubleOut: true },
      cricketOptions: { pointsMode: true },
    })
    for (let i = 0; i < 9; i += 1) {
      state = reduceMatch(state, { type: 'CRICKET_TAP', target: 20 })
    }
    expect(state.cricketPendingTaps).toHaveLength(9)
    state = reduceMatch(state, { type: 'CRICKET_TAP', target: 20 })
    expect(state.cricketPendingTaps).toHaveLength(9)
  })

  it('cricket undo removes last queued tap', () => {
    let state = createMatchState({
      mode: 'cricket',
      playerIds: ['a', 'b'],
      x01Options: { startScore: 501, doubleIn: false, doubleOut: true },
      cricketOptions: { pointsMode: true },
    })
    state = reduceMatch(state, { type: 'CRICKET_TAP', target: 20 })
    state = reduceMatch(state, { type: 'CRICKET_TAP', target: 19 })
    state = reduceMatch(state, { type: 'UNDO' })
    expect(state.cricketPendingTaps).toEqual([20])
  })
})
