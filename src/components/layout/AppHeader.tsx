import './AppHeader.css'

export const AppHeader = () => {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-logo-section">
          <img 
            src="/ps2-logo.svg" 
            alt="PS2 Manager" 
            className="app-logo ps2"
          />
          <div className="app-title-section">
            <h1 className="app-title">PS2 Manager</h1>
            <p className="app-subtitle">Open PS2 Loader Management Tool</p>
          </div>
        </div>
        
        <div className="app-version-badge">
          <span className="version-label">v0.2.0-alpha</span>
          <span className="version-status">DEVELOPMENT</span>
        </div>
      </div>
      
      <div className="app-header-glow"></div>
    </header>
  )
}
