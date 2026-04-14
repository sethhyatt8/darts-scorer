import type { CricketOptions, Mode, PlayerProfile, X01Options } from '../types/gameUi'

export function BrowseNav({
  currentScreen,
  onNavigate,
}: {
  currentScreen: 'setup' | 'stats'
  onNavigate: (screen: 'setup' | 'stats') => void
}) {
  return (
    <nav className="setup-inline-nav" aria-label="Screens">
      <button
        type="button"
        className={currentScreen === 'setup' ? 'active' : ''}
        onClick={() => onNavigate('setup')}
      >
        Setup
      </button>
      <button
        type="button"
        className={currentScreen === 'stats' ? 'active' : ''}
        onClick={() => onNavigate('stats')}
      >
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
  toggleMatchPlayer: (id: string, selected: boolean) => void
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
    toggleMatchPlayer,
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
          <BrowseNav currentScreen="setup" onNavigate={onNavigate} />
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
              Double In
              <select
                value={x01Options.doubleIn ? 'yes' : 'no'}
                onChange={(e) => setX01Options({ ...x01Options, doubleIn: e.target.value === 'yes' })}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
            <label>
              Double Out
              <select
                value={x01Options.doubleOut ? 'yes' : 'no'}
                onChange={(e) => setX01Options({ ...x01Options, doubleOut: e.target.value === 'yes' })}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
          </div>
        ) : (
          <label>
            Points
            <select
              value={cricketOptions.pointsMode ? 'yes' : 'no'}
              onChange={(e) => setCricketOptions({ pointsMode: e.target.value === 'yes' })}
            >
              <option value="no">Off</option>
              <option value="yes">On</option>
            </select>
          </label>
        )}
      </div>

      <div className="card setup-players-card">
        <h2>Players</h2>
        <p className="setup-players-hint">Check at least two for this match. Remove drops them from the saved list.</p>
        {players.length === 0 ? (
          <p className="muted">No players yet — add one below.</p>
        ) : (
          <div className="setup-player-lines">
            {players.map((player) => {
              const inMatch = selectedPlayerIds.includes(player.id)
              const inputId = `setup-match-${player.id}`
              return (
                <div key={player.id} className="setup-player-line">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={inMatch}
                    onChange={(e) => toggleMatchPlayer(player.id, e.target.checked)}
                  />
                  <label htmlFor={inputId} className="setup-player-line-name">
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
        )}
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
