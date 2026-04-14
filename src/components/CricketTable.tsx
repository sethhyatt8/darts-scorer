import type { CricketPlayerState, CricketTarget, PlayerProfile } from '../types/game'

interface CricketTableProps {
  players: PlayerProfile[]
  activePlayerId: string
  cricketState: Record<string, CricketPlayerState>
  pendingTapCount: number
  maxPendingTaps: number
  onMarkTarget: (target: CricketTarget) => void
}

const TARGETS: CricketTarget[] = [20, 19, 18, 17, 16, 15, 'BULL']

function markSymbol(marks: number): string {
  if (marks <= 0) return ''
  if (marks === 1) return '/'
  if (marks === 2) return 'X'
  return '⊗'
}

function CricketTable({
  players,
  activePlayerId,
  cricketState,
  pendingTapCount,
  maxPendingTaps,
  onMarkTarget,
}: CricketTableProps) {
  const atTapLimit = pendingTapCount >= maxPendingTaps
  const pct = (n: number) => (maxPendingTaps > 0 ? Math.round((n / maxPendingTaps) * 100) : 0)
  return (
    <section className="cricket-panel">
      <div className="cricket-head">
        <h2>Cricket</h2>
      </div>
      <div className="cricket-table-wrap">
        <table className="cricket-table">
          <thead>
            <tr>
              <th>Target</th>
              {players.map((player) => (
                <th key={player.id} className={player.id === activePlayerId ? 'active-col' : ''}>
                  {player.name}
                </th>
              ))}
            </tr>
            <tr className="cricket-marks-turn-row">
              <th scope="row" className="cricket-marks-turn-label">
                Marks / turn
              </th>
              {players.map((player) => {
                const n = player.id === activePlayerId ? pendingTapCount : 0
                return (
                  <th
                    key={`${player.id}-marks-turn`}
                    scope="col"
                    className={`cricket-marks-turn-cell ${player.id === activePlayerId ? 'active-col' : ''}`}
                  >
                    <span className="cricket-marks-turn-nums">
                      {n}/{maxPendingTaps}
                    </span>
                    <span className="cricket-marks-turn-pct">{pct(n)}%</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {TARGETS.map((target) => (
              <tr key={target}>
                <td className="target-cell">{target === 'BULL' ? 'BULL' : target}</td>
                {players.map((player) => {
                  const marks = cricketState[player.id]?.marks[target] ?? 0
                  const isActive = player.id === activePlayerId
                  return (
                    <td key={`${player.id}-${target}`} className={player.id === activePlayerId ? 'active-col' : ''}>
                      {isActive ? (
                        <button
                          type="button"
                          className="mark-button"
                          disabled={atTapLimit}
                          onClick={() => onMarkTarget(target)}
                        >
                          <span className={`mark mark-${marks}`}>{markSymbol(marks)}</span>
                        </button>
                      ) : (
                        <span className={`mark mark-${marks}`}>{markSymbol(marks)}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr className="points-row">
              <td className="target-cell">Points</td>
              {players.map((player) => (
                <td key={`${player.id}-points`} className={player.id === activePlayerId ? 'active-col' : ''}>
                  <strong>{cricketState[player.id]?.points ?? 0}</strong>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CricketTable
