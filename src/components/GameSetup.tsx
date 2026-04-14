import type { CricketOptions, Mode, PlayerProfile, X01Options } from '../types/gameUi'

export function BrowseNav({
  active,
  onNavigate,
}: {
  active: 'setup' | 'stats'
  onNavigate: (screen: 'setup' | 'stats') => void
}) {
  return (
    <nav className="setup-inline-nav" aria-label="Screens">
      <button type="button" className={active === 'setup' ? 'active' : ''} onClick={() => onNavigate('setup')}>
        Setup
      </button>
      <button type="button" className={active === 'stats' ? 'active' : ''} onClick={() => onNavigate('stats')}>
        Stats
      </button>
    </nav>
  )
}

interface GameSetupProps {
  onNavigate: (screen: 'setup' | 'stats') => void
  mode: Mode
  setMode: (mode: Mode) => void
  x01Options: X01Options
  setX01Options: (next: X01Options) => void
  cricketOptions: CricketOptions
  setCricketOptions: (next: CricketOptions) => void
  players: PlayerProfile[]
  selectedPlayerIds: string[]
  togglePlayer: (id: string, selected: boolean) => void
  newPlayerName: string
  setNewPlayerName: (name: string) => void
  onAddPlayer: () => void
  onRemovePlayer: (id: string) => void
  onStart: () => void
}

function GameSetup(props: GameSetupProps) {
  const {
    onNavigate,
    mode,
    setMode,
    x01Options,
    setX01Options,
    cricketOptions,
    setCricketOptions,
    players,
    selectedPlayerIds,
    togglePlayer,
    newPlayerName,
    setNewPlayerName,
    onAddPlayer,
    onRemovePlayer,
    onStart,
  } = props

  return (
    <section className="setup-grid">
      <div className="card setup-options-card">
        <div className="setup-section-header">
          <h2>Game Mode</h2>
          <BrowseNav active="setup" onNavigate={onNavigate} />
        </div>
        <div className="row setup-mode-btns">
          <button type="button" className={mode === 'x01' ? 'active' : ''} onClick={() => setMode('x01')}>
            x01
          </button>
          <button type="button" className={mode === 'cricket' ? 'active' : ''} onClick={() => setMode('cricket')}>
            Cricket
          </button>
        </div>
        {mode === 'x01' ? (
          <div className="stack">
            <label>
              Start
              <select
                value={x01Options.startScore}
                onChange={(e) =>
                  setX01Options({
                    ...x01Options,
                    startScore: Number(e.target.value) as 301 | 501 | 701,
                  })
                }
              >
                <option value={301}>301</option>
                <option value={501}>501</option>
                <option value={701}>701</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={x01Options.doubleIn}
                onChange={(e) => setX01Options({ ...x01Options, doubleIn: e.target.checked })}
              />
              Double In
            </label>
            <label>
              <input
                type="checkbox"
                checked={x01Options.doubleOut}
                onChange={(e) => setX01Options({ ...x01Options, doubleOut: e.target.checked })}
              />
              Double Out
            </label>
          </div>
        ) : (
          <label>
            <input
              type="checkbox"
              checked={cricketOptions.pointsMode}
              onChange={(e) => setCricketOptions({ pointsMode: e.target.checked })}
            />
            Cricket with points
          </label>
        )}
      </div>

      <div className="card setup-players-card">
        <h2>Players</h2>
        <div className="setup-players-list">
          {players.map((player) => {
            const selected = selectedPlayerIds.includes(player.id)
            const inputId = `setup-player-${player.id}`
            return (
              <div key={player.id} className="player-toggle">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => togglePlayer(player.id, e.target.checked)}
                />
                <label htmlFor={inputId} className="player-toggle__name">
                  {player.name}
                </label>
                <button
                  type="button"
                  className="btn-remove-player"
                  onClick={() => onRemovePlayer(player.id)}
                  aria-label={`Remove ${player.name}`}
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
        <div className="row setup-players-add">
          <input placeholder="Add player" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} />
          <button type="button" onClick={onAddPlayer}>
            Add
          </button>
        </div>
        <button type="button" className="btn-primary" disabled={selectedPlayerIds.length < 2} onClick={onStart}>
          Start Match
        </button>
      </div>
    </section>
  )
}

export default GameSetup
