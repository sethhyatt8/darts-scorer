import type { TurnSummary } from '../types/game'

interface TurnPanelProps {
  turn: TurnSummary
}

function TurnPanel({ turn }: TurnPanelProps) {
  return (
    <div className="turn-block compact-turn">
      <h3>Current turn (3 darts)</h3>
      <div className="throws">
        {[0, 1, 2].map((slot) => (
          <span key={slot} className="throw-pill">
            {turn.throws[slot]?.code ?? '-'}
          </span>
        ))}
      </div>
      <p>Total: {turn.total}</p>
    </div>
  )
}

export default TurnPanel
