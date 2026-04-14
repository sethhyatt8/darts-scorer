import type { CompletedGameRecord, PlayerProfile } from '../types/game'

const PLAYERS_KEY = 'darts.players.v1'
const HISTORY_KEY = 'darts.history.v1'

const defaultStats = () => ({
  matchesPlayed: 0,
  matchesWon: 0,
  dartsThrown: 0,
  pointsScored: 0,
  firstNinePoints: 0,
  checkoutAttempts: 0,
  successfulCheckouts: 0,
  highestFinish: 0,
  legsWon: 0,
  legsPlayed: 0,
})

function parseOr<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadPlayers(): PlayerProfile[] {
  const players = parseOr<PlayerProfile[]>(localStorage.getItem(PLAYERS_KEY), [])
  return players.map((player) => ({
    ...player,
    x01Stats: {
      ...defaultStats(),
      ...player.x01Stats,
    },
  }))
}

export function savePlayers(players: PlayerProfile[]): void {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players))
}

export function createPlayer(name: string): PlayerProfile {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
    x01Stats: defaultStats(),
  }
}

export function loadHistory(): CompletedGameRecord[] {
  return parseOr<CompletedGameRecord[]>(localStorage.getItem(HISTORY_KEY), [])
}

export function saveHistory(history: CompletedGameRecord[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
