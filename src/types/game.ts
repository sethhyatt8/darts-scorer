export type GameMode = 'x01' | 'cricket'

export type Multiplier = 'S' | 'D' | 'T'

export interface ThrowInput {
  code: string
  value: number
  segment: number | 'BULL' | 'MISS'
  multiplier: Multiplier | 'SB' | 'DB' | 'MISS'
}

export interface TurnSummary {
  throws: ThrowInput[]
  total: number
  bust?: boolean
}

export interface Turn {
  playerId: string
  summary: TurnSummary
  mode: GameMode
}

export interface X01Options {
  startScore: 301 | 501 | 701
  doubleIn: boolean
  doubleOut: boolean
}

export interface CricketOptions {
  pointsMode: boolean
}

export interface X01PlayerState {
  score: number
  isOpen: boolean
  turnStartScore: number
}

export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 'BULL'

export interface CricketPlayerState {
  marks: Record<CricketTarget, number>
  points: number
}

export interface X01StatsAggregate {
  matchesPlayed: number
  matchesWon: number
  dartsThrown: number
  pointsScored: number
  firstNinePoints: number
  checkoutAttempts: number
  successfulCheckouts: number
  highestFinish: number
  legsWon: number
  legsPlayed: number
}

export interface PlayerProfile {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  x01Stats: X01StatsAggregate
}

export interface CompletedGameRecord {
  id: string
  mode: GameMode
  playedAt: string
  playerIds: string[]
  winnerId: string
  details: Record<string, unknown>
}

export interface MatchState {
  mode: GameMode
  playerIds: string[]
  activePlayerIndex: number
  currentTurn: TurnSummary
  lastTurns: Record<string, TurnSummary>
  winnerId: string | null
  x01Options: X01Options
  cricketOptions: CricketOptions
  x01State: Record<string, X01PlayerState>
  cricketState: Record<string, CricketPlayerState>
  turnHistory: Turn[]
  stateHistory: Array<{
    x01State: Record<string, X01PlayerState>
    cricketState: Record<string, CricketPlayerState>
    currentTurn: TurnSummary
    activePlayerIndex: number
    winnerId: string | null
    lastTurns: Record<string, TurnSummary>
    turnHistory: Turn[]
  }>
}
