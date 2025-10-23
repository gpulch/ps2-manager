type Props = {
  message?: string
}

export const LoadingSpinner = ({ message = 'Loading...' }: Props) => (
  <div className="section" style={{ 
    textAlign: 'center', 
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid var(--neo-border)',
      borderTop: '4px solid var(--neo-accent)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: 'var(--neo-text)', opacity: 0.8 }}>{message}</p>
  </div>
)
