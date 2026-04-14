import type { Turn } from '../types/game'

/** Rolling average marks per turn; no max-denom shown. Active turn with pending includes live taps. */
export function averageMarksPerTurnDisplay(
  playerId: string,
  turnHistory: Turn[],
  activePlayerId: string,
  pendingTapCount: number,
): string {
  const cricketTurns = turnHistory.filter((t) => t.mode === 'cricket' && t.playerId === playerId)
  const completedSum = cricketTurns.reduce((s, t) => s + (t.summary.cricketMarkCount ?? 0), 0)
  const completedCount = cricketTurns.length

  if (playerId === activePlayerId && pendingTapCount > 0) {
    const v = (completedSum + pendingTapCount) / (completedCount + 1)
    return v.toFixed(1)
  }
  if (playerId === activePlayerId && pendingTapCount === 0) {
    if (completedCount === 0) return '—'
    return (completedSum / completedCount).toFixed(1)
  }
  if (completedCount === 0) return '—'
  return (completedSum / completedCount).toFixed(1)
}
