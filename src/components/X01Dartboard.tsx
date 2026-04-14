import type { ThrowInput } from '../types/game'

interface X01DartboardProps {
  onThrow: (throwInput: ThrowInput) => void
}

const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const CENTER = 220

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

function wedgePath(rOuter: number, rInner: number, startAngle: number, endAngle: number) {
  const p1 = polar(CENTER, CENTER, rOuter, startAngle)
  const p2 = polar(CENTER, CENTER, rOuter, endAngle)
  const p3 = polar(CENTER, CENTER, rInner, endAngle)
  const p4 = polar(CENTER, CENTER, rInner, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`
}

function toThrow(multiplier: 'S' | 'D' | 'T', segment: number): ThrowInput {
  const value = multiplier === 'S' ? segment : multiplier === 'D' ? segment * 2 : segment * 3
  return {
    code: `${multiplier}${segment}`,
    value,
    segment,
    multiplier,
  }
}

function X01Dartboard({ onThrow }: X01DartboardProps) {
  return (
    <section className="board-card x01-board-card">
      <div className="board-header">
        <h2>x01 Board</h2>
        <button
          className="ring-btn miss-ring miss-button"
          type="button"
          onClick={() => onThrow({ code: 'MISS', value: 0, segment: 'MISS', multiplier: 'MISS' })}
        >
          MISS
        </button>
      </div>
      <div className="dartboard-svg-wrap">
        <svg viewBox="0 0 440 440" className="dartboard-svg" role="group" aria-label="x01 dartboard">
          <circle cx={CENTER} cy={CENTER} r={198} className="board-outer" />
          {ORDER.map((segment, index) => {
            const start = index * 18
            const end = start + 18
            const alternate = index % 2 === 0
            const textPos = polar(CENTER, CENTER, 206, start + 9)
            return (
              <g key={segment}>
                <path
                  d={wedgePath(194, 176, start, end)}
                  className={`wedge double-wedge ${alternate ? 'double-green' : 'double-red'}`}
                  onClick={() => onThrow(toThrow('D', segment))}
                />
                <path
                  d={wedgePath(176, 120, start, end)}
                  className={`wedge single-wedge ${alternate ? 'single-light' : 'single-dark'}`}
                  onClick={() => onThrow(toThrow('S', segment))}
                />
                <path
                  d={wedgePath(120, 102, start, end)}
                  className={`wedge triple-wedge ${alternate ? 'triple-green' : 'triple-red'}`}
                  onClick={() => onThrow(toThrow('T', segment))}
                />
                <path
                  d={wedgePath(102, 30, start, end)}
                  className={`wedge single-wedge ${alternate ? 'single-dark' : 'single-light'}`}
                  onClick={() => onThrow(toThrow('S', segment))}
                />
                <text x={textPos.x} y={textPos.y} className="board-number">
                  {segment}
                </text>
              </g>
            )
          })}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={28}
            className="wedge sb-ring"
            onClick={() => onThrow({ code: 'SB', value: 25, segment: 'BULL', multiplier: 'SB' })}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={14}
            className="wedge db-ring"
            onClick={() => onThrow({ code: 'DB', value: 50, segment: 'BULL', multiplier: 'DB' })}
          />
        </svg>
      </div>
    </section>
  )
}

export default X01Dartboard
