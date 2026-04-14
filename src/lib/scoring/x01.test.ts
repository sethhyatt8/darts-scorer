import { describe, expect, it } from 'vitest'
import { applyX01Throw } from './x01'
import type { ThrowInput, X01Options, X01PlayerState } from '../../types/game'

const baseOptions: X01Options = {
  startScore: 501,
  doubleIn: false,
  doubleOut: true,
}

function throwInput(code: string, value: number, multiplier: ThrowInput['multiplier']): ThrowInput {
  return {
    code,
    value,
    multiplier,
    segment: code === 'DB' ? 'BULL' : 20,
  }
}

describe('x01 scoring', () => {
  it('respects double-in', () => {
    const player: X01PlayerState = { score: 501, isOpen: false, turnStartScore: 501 }
    const result = applyX01Throw(player, throwInput('S20', 20, 'S'), { ...baseOptions, doubleIn: true })
    expect(result.nextPlayerState.score).toBe(501)
    expect(result.nextPlayerState.isOpen).toBe(false)
  })

  it('busts invalid double-out finish', () => {
    const player: X01PlayerState = { score: 20, isOpen: true, turnStartScore: 20 }
    const result = applyX01Throw(player, throwInput('S20', 20, 'S'), baseOptions)
    expect(result.bust).toBe(true)
    expect(result.nextPlayerState.score).toBe(20)
  })
})
