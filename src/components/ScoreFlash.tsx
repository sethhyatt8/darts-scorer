interface ScoreFlashProps {
  value: string
}

function ScoreFlash({ value }: ScoreFlashProps) {
  if (!value) return null

  return (
    <div className="score-flash visible" aria-live="polite">
      {value}
    </div>
  )
}

export default ScoreFlash
