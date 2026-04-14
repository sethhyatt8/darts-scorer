import { useEffect, useMemo, useRef, useState } from 'react'
import CricketTable from './components/CricketTable'
import GameSetup, { BrowseNav } from './components/GameSetup'
import PlayerSidebar from './components/PlayerSidebar'
import ScoreFlash from './components/ScoreFlash'
import TurnPanel from './components/TurnPanel'
import X01Dartboard from './components/X01Dartboard'
import { CRICKET_MAX_TAPS_PER_TURN, createMatchState, cricketDisplayBoard, reduceMatch } from './lib/gameReducer'
import { createPlayer, loadHistory, loadPlayers, saveHistory, savePlayers } from './lib/storage'
import './App.css'
import type { CompletedGameRecord, CricketOptions, CricketTarget, MatchState, PlayerProfile, X01Options } from './types/game'
import type { X01DerivedStats } from './types/stats'

type Screen = 'setup' | 'play' | 'stats'
type Mode = 'x01' | 'cricket'

function deriveStats(player: PlayerProfile): X01DerivedStats {
  const stats = player.x01Stats
  const pointsPerDart = stats.dartsThrown > 0 ? stats.pointsScored / stats.dartsThrown : 0
  const threeDartAverage = pointsPerDart * 3
  const checkoutPercentage = stats.checkoutAttempts > 0 ? (stats.successfulCheckouts / stats.checkoutAttempts) * 100 : 0
  const firstNineAverage = stats.legsPlayed > 0 ? (stats.firstNinePoints / (stats.legsPlayed * 9)) * 3 : 0
  const dartsPerLeg = stats.legsPlayed > 0 ? stats.dartsThrown / stats.legsPlayed : 0
  return { pointsPerDart, threeDartAverage, checkoutPercentage, firstNineAverage, dartsPerLeg }
}

function App() {
  const [players, setPlayers] = useState<PlayerProfile[]>(() => loadPlayers())
  const [history, setHistory] = useState<CompletedGameRecord[]>(() => loadHistory())
  const [screen, setScreen] = useState<Screen>('setup')
  const [mode, setMode] = useState<Mode>('x01')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [flashValue, setFlashValue] = useState('')
  const [x01Options, setX01Options] = useState<X01Options>({ startScore: 501, doubleIn: false, doubleOut: true })
  const [cricketOptions, setCricketOptions] = useState<CricketOptions>({ pointsMode: true })
  const [match, setMatch] = useState<MatchState>(() =>
    createMatchState({ mode: 'x01', playerIds: [], x01Options, cricketOptions }),
  )
  const lastRecordedWinnerRef = useRef<string>('')

  const activePlayers = useMemo(
    () => playerIds.map((id) => players.find((p) => p.id === id)).filter((p): p is PlayerProfile => Boolean(p)),
    [playerIds, players],
  )
  const activePlayer = activePlayers[match.activePlayerIndex]

  useEffect(() => {
    if (!flashValue) return
    const timeout = window.setTimeout(() => setFlashValue(''), 700)
    return () => window.clearTimeout(timeout)
  }, [flashValue])

  const persistPlayers = (nextPlayers: PlayerProfile[]) => {
    setPlayers(nextPlayers)
    savePlayers(nextPlayers)
  }

  const addPlayerProfile = () => {
    const name = newPlayerName.trim()
    if (!name) return
    const created = createPlayer(name)
    const nextPlayers = [...players, created]
    persistPlayers(nextPlayers)
    setPlayerIds((prev) => [...prev, created.id])
    setNewPlayerName('')
  }

  const startGame = () => {
    if (playerIds.length < 2) return
    setMatch(
      createMatchState({
        mode,
        playerIds,
        x01Options,
        cricketOptions,
      }),
    )
    lastRecordedWinnerRef.current = ''
    setScreen('play')
  }

  /** Lifetime player stats (x01 only): updated here when a match completes, not during play. */
  const finalizeX01Match = (finalMatch: MatchState) => {
    if (!finalMatch.winnerId || finalMatch.mode !== 'x01' || finalMatch.playerIds.length < 2) return
    const winnerKey = `${finalMatch.winnerId}:${finalMatch.turnHistory.length}`
    if (lastRecordedWinnerRef.current === winnerKey) return
    lastRecordedWinnerRef.current = winnerKey

    const now = new Date().toISOString()
    const record: CompletedGameRecord = {
      id: crypto.randomUUID(),
      mode: finalMatch.mode,
      playedAt: now,
      playerIds: finalMatch.playerIds,
      winnerId: finalMatch.winnerId,
      details: {
        x01Options: finalMatch.x01Options,
        cricketOptions: finalMatch.cricketOptions,
        turnHistory: finalMatch.turnHistory,
      },
    }

    setHistory((prev) => {
      const next = [record, ...prev].slice(0, 100)
      saveHistory(next)
      return next
    })

    setPlayers((prevPlayers) => {
      const nextPlayers = prevPlayers.map((player) => {
        if (!finalMatch.playerIds.includes(player.id)) return player
        const state = finalMatch.x01State[player.id]
        if (!state) return player
        const throws = finalMatch.turnHistory
          .filter((turn) => turn.playerId === player.id)
          .flatMap((turn) => turn.summary.throws)
        const firstNinePoints = throws.slice(0, 9).reduce((sum, t) => sum + t.value, 0)
        const won = player.id === finalMatch.winnerId ? 1 : 0
        return {
          ...player,
          updatedAt: now,
          x01Stats: {
            ...player.x01Stats,
            matchesPlayed: player.x01Stats.matchesPlayed + 1,
            matchesWon: player.x01Stats.matchesWon + won,
            legsPlayed: player.x01Stats.legsPlayed + 1,
            legsWon: player.x01Stats.legsWon + won,
            pointsScored: player.x01Stats.pointsScored + (finalMatch.x01Options.startScore - state.score),
            dartsThrown: player.x01Stats.dartsThrown + throws.length,
            firstNinePoints: player.x01Stats.firstNinePoints + firstNinePoints,
            checkoutAttempts: player.x01Stats.checkoutAttempts + 1,
            successfulCheckouts: player.x01Stats.successfulCheckouts + won,
            highestFinish: Math.max(player.x01Stats.highestFinish, won ? state.turnStartScore : 0),
          },
        }
      })
      savePlayers(nextPlayers)
      return nextPlayers
    })

    setScreen('stats')
  }

  const dispatchMatch = (action: Parameters<typeof reduceMatch>[1]) => {
    setMatch((prev) => {
      const next = reduceMatch(prev, action)
      if (!prev.winnerId && next.winnerId && next.mode === 'x01') {
        queueMicrotask(() => finalizeX01Match(next))
      }
      return next
    })
  }

  const applyThrow = (throwInput: { code: string; value: number; segment: number | 'BULL' | 'MISS'; multiplier: 'S' | 'D' | 'T' | 'SB' | 'DB' | 'MISS' }) => {
    if (match.mode !== 'x01') return
    setFlashValue(throwInput.code)
    dispatchMatch({ type: 'THROW', throwInput })
  }

  const applyCricketTap = (target: CricketTarget) => {
    dispatchMatch({ type: 'CRICKET_TAP', target })
  }

  return (
    <main
      className={`app-shell ${screen === 'play' ? 'play-mode' : 'browse-mode'}${screen === 'setup' ? ' browse-setup' : ''}`}
    >
      {screen === 'setup' && (
        <GameSetup
          onNavigate={(s) => setScreen(s)}
          mode={mode}
          setMode={setMode}
          x01Options={x01Options}
          setX01Options={setX01Options}
          cricketOptions={cricketOptions}
          setCricketOptions={setCricketOptions}
          players={players}
          selectedPlayerIds={playerIds}
          togglePlayer={(id, selected) =>
            setPlayerIds((prev) => (selected ? [...prev, id] : prev.filter((existing) => existing !== id)))
          }
          newPlayerName={newPlayerName}
          setNewPlayerName={setNewPlayerName}
          onAddPlayer={addPlayerProfile}
          onStart={startGame}
        />
      )}

      {screen === 'play' && activePlayer && (
        <section
          key={`play-${match.mode}-${match.playerIds.join('|')}`}
          className={`play-stage ${match.mode === 'x01' ? 'x01-layout' : 'cricket-layout'}`}
        >
          <div className="board-wrap">
            {match.mode === 'x01' && <ScoreFlash value={flashValue} />}
            {match.mode === 'x01' ? (
              <X01Dartboard onThrow={applyThrow} />
            ) : (
              <CricketTable
                players={activePlayers}
                activePlayerId={activePlayer.id}
                cricketState={cricketDisplayBoard(match)}
                pendingTapCount={match.cricketPendingTaps.length}
                maxPendingTaps={CRICKET_MAX_TAPS_PER_TURN}
                onMarkTarget={applyCricketTap}
              />
            )}
          </div>
          <aside className="card play-panel unified-panel">
            <h2>{match.mode === 'cricket' ? 'Your turn' : 'Now Throwing'}</h2>
            <p className="active-player-name">{activePlayer.name}</p>
            {match.mode === 'cricket' && !match.winnerId && (
              <p className="cricket-round-marks" aria-live="polite" title="Marks this round">
                <span className="cricket-round-marks__n">{match.cricketPendingTaps.length}</span>
                <span className="cricket-round-marks__sep">/</span>
                <span className="cricket-round-marks__max">{CRICKET_MAX_TAPS_PER_TURN}</span>
              </p>
            )}
            {match.winnerId && (
              <p className="winner-banner">
                Winner: {activePlayers.find((p) => p.id === match.winnerId)?.name ?? '—'}
              </p>
            )}
            <div className="row action-row">
              {match.mode === 'cricket' && (
                <button
                  type="button"
                  className="btn-compact btn-primary"
                  disabled={match.cricketPendingTaps.length === 0}
                  onClick={() => dispatchMatch({ type: 'END_TURN' })}
                >
                  Next Turn
                </button>
              )}
              <button type="button" className="btn-compact" onClick={() => dispatchMatch({ type: 'UNDO' })}>
                Undo
              </button>
              <button type="button" className="btn-compact" onClick={() => setScreen('setup')}>
                Exit Match
              </button>
            </div>
            {match.mode === 'x01' && <TurnPanel turn={match.currentTurn} />}
            {match.mode === 'x01' && (
              <>
                <h2>Scores</h2>
                <PlayerSidebar
                  players={activePlayers}
                  activePlayerId={activePlayer.id}
                  mode={match.mode}
                  x01OptionsStart={match.x01Options.startScore}
                  x01State={match.x01State}
                  cricketState={match.cricketState}
                  lastTurns={match.lastTurns}
                  winnerId={match.winnerId}
                />
              </>
            )}
          </aside>
        </section>
      )}

      {screen === 'stats' && (
        <section className="card stats-panel">
          <BrowseNav active="stats" onNavigate={(s) => setScreen(s)} />
          <h2>Player Stats (x01)</h2>
          {players.length === 0 && <p>No players yet.</p>}
          {players.map((player) => {
            const stats = player.x01Stats
            const derived = deriveStats(player)
            return (
              <article className="stat-card" key={player.id}>
                <h3>{player.name}</h3>
                <p>
                  Record: {stats.matchesWon}/{stats.matchesPlayed}
                </p>
                <p>PPD: {derived.pointsPerDart.toFixed(2)}</p>
                <p>3-dart avg: {derived.threeDartAverage.toFixed(2)}</p>
                <p>Checkout %: {derived.checkoutPercentage.toFixed(1)}%</p>
                <p>First-9 avg: {derived.firstNineAverage.toFixed(2)}</p>
                <p>Darts per leg: {derived.dartsPerLeg.toFixed(2)}</p>
                <p>Highest finish: {stats.highestFinish}</p>
              </article>
            )
          })}
          <h3>Recent Matches</h3>
          <div className="history">
            {history.slice(0, 8).map((h) => (
              <p key={h.id}>
                {new Date(h.playedAt).toLocaleDateString()} - {h.mode.toUpperCase()} - Winner:{' '}
                {players.find((p) => p.id === h.winnerId)?.name ?? 'Unknown'}
              </p>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
