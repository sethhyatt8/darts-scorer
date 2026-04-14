import { describe, expect, it } from 'vitest'
import type { Turn } from '../types/game'
import { averageMarksPerTurnDisplay } from './cricketAvgMarks'

function cricketTurn(playerId: string, marks: number): Turn {
  return {
    mode: 'cricket',
    playerId,
    summary: { throws: [], total: 0, cricketMarkCount: marks },
  }
}

describe('averageMarksPerTurnDisplay', () => {
  it('first turn mid-turn: 3 pending → 3.0', () => {
    const h: Turn[] = []
    expect(averageMarksPerTurnDisplay('a', h, 'a', 3)).toBe('3.0')
  })

  it('after first turn committed and second turn 2 pending: (3+2)/2 = 2.5', () => {
    const h: Turn[] = [cricketTurn('a', 3)]
    expect(averageMarksPerTurnDisplay('a', h, 'a', 2)).toBe('2.5')
  })

  it('inactive opponent with no turns shows em dash', () => {
    const h: Turn[] = [cricketTurn('a', 3)]
    expect(averageMarksPerTurnDisplay('b', h, 'a', 0)).toBe('—')
  })

  it('active after committing 3, pending 0: 3.0', () => {
    const h: Turn[] = [cricketTurn('a', 3)]
    expect(averageMarksPerTurnDisplay('a', h, 'a', 0)).toBe('3.0')
  })
})
