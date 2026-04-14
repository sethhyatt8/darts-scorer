import type { CricketOptions, Mode, PlayerProfile, X01Options } from '../types/gameUi'

interface GameSetupProps {
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
  onStart: () => void
}

function GameSetup(props: GameSetupProps) {
  const {
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
    onStart,
  } = props

  return (
    <section className="setup-grid">
      <div className="card">
        <h2>Game Mode</h2>
        <div className="row">
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

      <div className="card">
        <h2>Players</h2>
        <div className="stack">
          {players.map((player) => {
            const selected = selectedPlayerIds.includes(player.id)
            return (
              <label key={player.id} className="player-toggle">
                <input type="checkbox" checked={selected} onChange={(e) => togglePlayer(player.id, e.target.checked)} />
                {player.name}
              </label>
            )
          })}
          <div className="row">
            <input placeholder="Add player" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} />
            <button type="button" onClick={onAddPlayer}>
              Add
            </button>
          </div>
        </div>
        <button type="button" disabled={selectedPlayerIds.length < 2} onClick={onStart}>
          Start Match
        </button>
      </div>
    </section>
  )
}

export default GameSetup
