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
  onMatchPlayersChange: (playerIds: string[]) => void
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
    onMatchPlayersChange,
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
        <div className="setup-roster-block">
          <h3 className="setup-roster-title">Roster</h3>
          {players.length === 0 ? (
            <p className="muted setup-roster-empty">No players yet — add one below.</p>
          ) : (
            <ul className="setup-roster-list">
              {players.map((player) => (
                <li key={player.id} className="setup-roster-row">
                  <span className="setup-roster-name">{player.name}</span>
                  <button
                    type="button"
                    className="btn-remove-player"
                    onClick={() => onRemovePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="setup-multiselect-label">
          <span className="setup-multiselect-title">In this match</span>
          <span className="setup-multiselect-hint">Hold Ctrl (Windows) or ⌘ (Mac) to select multiple.</span>
          <select
            multiple
            className="setup-players-multiselect"
            size={Math.min(10, Math.max(3, players.length || 3))}
            value={selectedPlayerIds}
            onChange={(e) => onMatchPlayersChange(Array.from(e.target.selectedOptions, (o) => o.value))}
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
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
