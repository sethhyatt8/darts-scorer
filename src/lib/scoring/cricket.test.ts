import { describe, expect, it } from 'vitest'
import { applyCricketThrow, createCricketState } from './cricket'
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
    const result = applyCricketThrow(current, opponent, t20, true)
    expect(result.nextPlayerState.marks[20]).toBe(3)
  })

  it('awards overflow points in points mode', () => {
    const current = createCricketState()
    current.marks[20] = 2
    const opponent = createCricketState()
    const result = applyCricketThrow(current, opponent, t20, true)
    expect(result.scoredPoints).toBe(40)
    expect(result.nextPlayerState.points).toBe(40)
  })
})
