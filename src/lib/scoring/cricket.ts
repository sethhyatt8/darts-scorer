import type { CricketPlayerState, CricketTarget, ThrowInput } from '../../types/game'

export const CRICKET_TARGETS: CricketTarget[] = [20, 19, 18, 17, 16, 15, 'BULL']

export function createCricketState(): CricketPlayerState {
  return {
    marks: {
      20: 0,
      19: 0,
      18: 0,
      17: 0,
      16: 0,
      15: 0,
      BULL: 0,
    },
    points: 0,
  }
}

function marksFromThrow(throwInput: ThrowInput): number {
  if (throwInput.multiplier === 'T') return 3
  if (throwInput.multiplier === 'D' || throwInput.multiplier === 'DB') return 2
  if (throwInput.multiplier === 'MISS') return 0
  return 1
}

function toCricketTarget(segment: ThrowInput['segment']): CricketTarget | null {
  if (segment === 'BULL') return 'BULL'
  if (typeof segment === 'number' && segment >= 15 && segment <= 20) return segment as CricketTarget
  return null
}

function cricketTargetValue(target: CricketTarget): number {
  return target === 'BULL' ? 25 : target
}

export function cricketHasClosedAll(player: CricketPlayerState): boolean {
  return CRICKET_TARGETS.every((target) => player.marks[target] >= 3)
}

export function applyCricketThrow(
  current: CricketPlayerState,
  opponent: CricketPlayerState,
  throwInput: ThrowInput,
  pointsMode: boolean,
): {
  nextPlayerState: CricketPlayerState
  scoredPoints: number
} {
  const target = toCricketTarget(throwInput.segment)
  if (!target) return { nextPlayerState: current, scoredPoints: 0 }

  const currentMarks = current.marks[target]
  const hitMarks = marksFromThrow(throwInput)
  const nextMarks = Math.min(3, currentMarks + hitMarks)
  const overflowMarks = Math.max(0, currentMarks + hitMarks - 3)
  const opponentClosed = opponent.marks[target] >= 3
  const scoredPoints = pointsMode && !opponentClosed ? overflowMarks * cricketTargetValue(target) : 0

  return {
    nextPlayerState: {
      marks: {
        ...current.marks,
        [target]: nextMarks,
      },
      points: current.points + scoredPoints,
    },
    scoredPoints,
  }
}
