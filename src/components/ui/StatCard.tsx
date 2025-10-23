import type { ReactNode } from 'react'
import './StatCard.css'

type StatCardProps = {
  label: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'magenta' | 'red'
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  children?: ReactNode
}

export const StatCard = ({
  label,
  value,
  icon,
  color = 'blue',
  trend,
  subtitle,
  children
}: StatCardProps) => {
  const colorClass = `stat-card-${color}`
  
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-card-header">
        {icon && (
          <div className="stat-icon">
            <img src={icon} alt={label} />
          </div>
        )}
        <div className="stat-label">{label}</div>
      </div>
      
      <div className="stat-value-container">
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend stat-trend-${trend}`}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'neutral' && '→'}
          </div>
        )}
      </div>
      
      {subtitle && (
        <div className="stat-subtitle">{subtitle}</div>
      )}
      
      {children}
      
      <div className="stat-card-glow"></div>
    </div>
  )
}
