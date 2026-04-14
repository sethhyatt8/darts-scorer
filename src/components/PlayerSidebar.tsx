import type { CricketPlayerState, PlayerProfile, TurnSummary, X01PlayerState } from '../types/game'

interface PlayerSidebarProps {
  players: PlayerProfile[]
  activePlayerId: string
  mode: 'x01' | 'cricket'
  x01OptionsStart: number
  x01State: Record<string, X01PlayerState>
  cricketState: Record<string, CricketPlayerState>
  lastTurns: Record<string, TurnSummary>
  winnerId: string | null
}

function PlayerSidebar({
  players,
  activePlayerId,
  mode,
  x01OptionsStart,
  x01State,
  cricketState,
  lastTurns,
  winnerId,
}: PlayerSidebarProps) {
  return (
    <div className={`score-list ${mode === 'x01' ? 'score-list-x01' : ''}`}>
      {winnerId && <p className="winner-banner">Winner: {players.find((p) => p.id === winnerId)?.name}</p>}
      {players.map((player) => {
        const x = x01State[player.id]
        const c = cricketState[player.id]
        const last = lastTurns[player.id]
        return (
          <div className={`player-score ${player.id === activePlayerId ? 'active' : ''}`} key={player.id}>
            <h3>{player.name}</h3>
            {mode === 'x01' ? (
              <p>
                Score: <strong className="score-value">{x?.score ?? x01OptionsStart}</strong>
              </p>
            ) : (
              <p>
                Points: <strong className="score-value">{c?.points ?? 0}</strong>
              </p>
            )}
            <p className="muted">
              Last 3
            </p>
            <div className="player-last-throws">
              {[0, 1, 2].map((slot) => (
                <span key={`${player.id}-${slot}`} className="throw-pill mini-pill">
                  {last?.throws[slot]?.code ?? '-'}
                </span>
              ))}
            </div>
            <p className="muted">Turn total: {last ? last.total : '-'}</p>
          </div>
        )
      })}
    </div>
  )
}

export default PlayerSidebar
