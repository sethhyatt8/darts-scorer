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
      <div className="board-header">
        <h2>Dartboard</h2>
        <button
          className="ring-btn miss-ring miss-button"
          type="button"
          onClick={() => onThrow({ code: 'MISS', value: 0, segment: 'MISS', multiplier: 'MISS' })}
        >
          MISS
        </button>
      </div>

      <div className="visual-board" role="group" aria-label="Dartboard scoring buttons">
        <div className="ring-guide ring-guide-double" />
        <div className="ring-guide ring-guide-triple" />

        {NUMBERS.map((segment, index) => {
          const angle = (index / NUMBERS.length) * 360
          return (
            <div
              className="board-segment"
              key={segment}
              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
            >
              <button className="ring-btn double-ring" type="button" onClick={() => onThrow(buildThrow('D', segment))}>
                D{segment}
              </button>
              <button className="ring-btn triple-ring" type="button" onClick={() => onThrow(buildThrow('T', segment))}>
                T{segment}
              </button>
              <button className="ring-btn single-ring" type="button" onClick={() => onThrow(buildThrow('S', segment))}>
                S{segment}
              </button>
            </div>
          )
        })}

        <div className="bull-core">
          <button
            className="ring-btn double-ring bull-db"
            type="button"
            onClick={() => onThrow({ code: 'DB', value: 50, segment: 'BULL', multiplier: 'DB' })}
          >
            DB
          </button>
          <button
            className="ring-btn single-ring bull-sb"
            type="button"
            onClick={() => onThrow({ code: 'SB', value: 25, segment: 'BULL', multiplier: 'SB' })}
          >
            SB
          </button>
        </div>
      </div>

      <div className="quick-row">
        {NUMBERS.map((segment) => (
          <button key={`q-${segment}`} className="ring-btn single-ring quick-number" type="button" onClick={() => onThrow(buildThrow('S', segment))}>
            {segment}
          </button>
        ))}
      </div>
    </section>
  )
}

export default Dartboard
