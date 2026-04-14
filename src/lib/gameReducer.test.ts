import { describe, expect, it } from 'vitest'
import { createMatchState, reduceMatch } from './gameReducer'
import type { ThrowInput } from '../types/game'

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
})
