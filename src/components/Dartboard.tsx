import type { ThrowInput } from '../types/game'

interface DartboardProps {
  onThrow: (throwInput: ThrowInput) => void
}

const NUMBERS = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

function buildThrow(mult: 'S' | 'D' | 'T', segment: number): ThrowInput {
  const value = mult === 'S' ? segment : mult === 'D' ? segment * 2 : segment * 3
  return {
    code: `${mult}${segment}`,
    value,
    segment,
    multiplier: mult,
  }
}

function Dartboard({ onThrow }: DartboardProps) {
  return (
    <section className="board-card">
      <h2>Dartboard</h2>
      <p className="muted">Double and triple are oversized for easier touch input.</p>

      <div className="bull-row">
        <button
          className="ring-btn double-ring"
          type="button"
          onClick={() => onThrow({ code: 'DB', value: 50, segment: 'BULL', multiplier: 'DB' })}
        >
          DB
        </button>
        <button
          className="ring-btn single-ring"
          type="button"
          onClick={() => onThrow({ code: 'SB', value: 25, segment: 'BULL', multiplier: 'SB' })}
        >
          SB
        </button>
        <button
          className="ring-btn miss-ring"
          type="button"
          onClick={() => onThrow({ code: 'MISS', value: 0, segment: 'MISS', multiplier: 'MISS' })}
        >
          MISS
        </button>
      </div>

      <div className="segment-grid">
        {NUMBERS.map((segment) => (
          <div className="segment-row" key={segment}>
            <span className="segment-number">{segment}</span>
            <button className="ring-btn triple-ring" type="button" onClick={() => onThrow(buildThrow('T', segment))}>
              T{segment}
            </button>
            <button className="ring-btn double-ring" type="button" onClick={() => onThrow(buildThrow('D', segment))}>
              D{segment}
            </button>
            <button className="ring-btn single-ring" type="button" onClick={() => onThrow(buildThrow('S', segment))}>
              S{segment}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Dartboard
