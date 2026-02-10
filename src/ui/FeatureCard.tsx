import type { ReactNode } from 'react'
import './FeatureCard.css'

type FeatureCardProps = {
  icon: string
  title: string
  description: string
  badge?: string
  onClick?: () => void
  disabled?: boolean
  children?: ReactNode
}

export const FeatureCard = ({
  icon,
  title,
  description,
  badge,
  onClick,
  disabled,
  children
}: FeatureCardProps) => {
  const isClickable = onClick && !disabled
  
  return (
    <div 
      className={`feature-card ${isClickable ? 'clickable' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {badge && (
        <div className="feature-badge">{badge}</div>
      )}
      
      <div className="feature-icon">
        <img src={icon} alt={title} />
      </div>
      
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>
      
      {children && (
        <div className="feature-actions">
          {children}
        </div>
      )}
      
      <div className="feature-glow"></div>
    </div>
  )
}
