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
    <div className="score-list">
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
                Score: <strong>{x?.score ?? x01OptionsStart}</strong>
              </p>
            ) : (
              <p>
                Points: <strong>{c?.points ?? 0}</strong>
              </p>
            )}
            <p className="muted">
              Last turn: {last ? `${last.throws.map((t) => t.code).join(', ')} (${last.total})` : 'n/a'}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default PlayerSidebar
