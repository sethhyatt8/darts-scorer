import { describe, expect, it } from 'vitest'
import { applyCricketPendingTaps, applyCricketThrow, createCricketState } from './cricket'
import type { ThrowInput } from '../../types/game'

const t20: ThrowInput = {
  code: 'T20',
  value: 60,
  segment: 20,
  multiplier: 'T',
}

describe('cricket scoring', () => {
  it('closes marks when hitting triple', () => {
    const current = createCricketState()
    const opponent = createCricketState()
    const result = applyCricketThrow(current, [opponent], t20, true)
    expect(result.nextPlayerState.marks[20]).toBe(3)
  })

  it('awards overflow points in points mode', () => {
    const current = createCricketState()
    current.marks[20] = 2
    const opponent = createCricketState()
    const result = applyCricketThrow(current, [opponent], t20, true)
    expect(result.scoredPoints).toBe(40)
    expect(result.nextPlayerState.points).toBe(40)
  })

  it('applies many ordered single-mark taps (no triple shortcut)', () => {
    const current = createCricketState()
    const opponent = createCricketState()
    const pending = Array.from({ length: 9 }, () => 20 as const)
    const next = applyCricketPendingTaps(current, [opponent], pending, true)
    expect(next.marks[20]).toBe(3)
    expect(next.points).toBe(20 * 6)
  })

  it('does not award points when all opponents are closed', () => {
    const current = createCricketState()
    current.marks[20] = 2
    const opponentA = createCricketState()
    const opponentB = createCricketState()
    opponentA.marks[20] = 3
    opponentB.marks[20] = 3
    const result = applyCricketThrow(current, [opponentA, opponentB], t20, true)
    expect(result.scoredPoints).toBe(0)
  })
})
