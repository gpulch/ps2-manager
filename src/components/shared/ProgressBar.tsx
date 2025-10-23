import { memo, useMemo } from 'react'

type Props = {
  value: number
  max: number
  label?: string
  showPercentage?: boolean
}

export const ProgressBar = memo(({ value, max, label, showPercentage = true }: Props) => {
  const percentage = useMemo(() => 
    max > 0 ? (value / max) * 100 : 0,
    [value, max]
  )

  return (
    <div className="progress-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span className="progress-percentage">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-bar-fill"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  )
})
