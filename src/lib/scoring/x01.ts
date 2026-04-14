import type { ThrowInput, TurnSummary, X01Options, X01PlayerState } from '../../types/game'

export function createX01State(startScore: number): X01PlayerState {
  return {
    score: startScore,
    isOpen: false,
    turnStartScore: startScore,
  }
}

export function isDouble(throwInput: ThrowInput): boolean {
  return throwInput.multiplier === 'D' || throwInput.multiplier === 'DB'
}

export function getTurnTotal(turn: ThrowInput[]): number {
  return turn.reduce((sum, t) => sum + t.value, 0)
}

export function applyX01Throw(
  playerState: X01PlayerState,
  throwInput: ThrowInput,
  options: X01Options,
): {
  nextPlayerState: X01PlayerState
  bust: boolean
  checkedOut: boolean
  scoredPoints: number
} {
  let scoredPoints = throwInput.value
  if (options.doubleIn && !playerState.isOpen) {
    scoredPoints = isDouble(throwInput) ? throwInput.value : 0
  }

  const opensNow = playerState.isOpen || !options.doubleIn || isDouble(throwInput)
  const nextScore = playerState.score - scoredPoints
  const invalidDoubleOut = options.doubleOut && nextScore === 0 && !isDouble(throwInput)
  const bust = nextScore < 0 || nextScore === 1 || invalidDoubleOut
  const checkedOut = !bust && nextScore === 0

  if (bust) {
    return {
      nextPlayerState: {
        ...playerState,
        score: playerState.turnStartScore,
      },
      bust: true,
      checkedOut: false,
      scoredPoints: 0,
    }
  }

  return {
    nextPlayerState: {
      score: nextScore,
      isOpen: opensNow,
      turnStartScore: playerState.turnStartScore,
    },
    bust: false,
    checkedOut,
    scoredPoints,
  }
}

export function finalizeTurnSummary(throws: ThrowInput[], bust = false): TurnSummary {
  return {
    throws,
    total: bust ? 0 : getTurnTotal(throws),
    bust,
  }
}
