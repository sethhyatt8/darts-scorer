import type { TurnSummary } from '../types/game'

interface TurnPanelProps {
  turn: TurnSummary
  onEndTurn: () => void
  onUndo: () => void
}

function TurnPanel({ turn, onEndTurn, onUndo }: TurnPanelProps) {
  return (
    <div className="turn-block">
      <h3>Current Turn</h3>
      <div className="throws">
        {[0, 1, 2].map((slot) => (
          <span key={slot} className="throw-pill">
            {turn.throws[slot]?.code ?? '-'}
          </span>
        ))}
      </div>
      <p>Total: {turn.total}</p>
      <div className="row">
        <button type="button" onClick={onEndTurn}>
          End Turn
        </button>
        <button type="button" onClick={onUndo}>
          Undo
        </button>
      </div>
    </div>
  )
}

export default TurnPanel
