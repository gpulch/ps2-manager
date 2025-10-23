import './AppFooter.css'

export const AppFooter = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <div className="footer-section">
          <h4>PS2 Manager</h4>
          <p>Open source tool for managing PlayStation 2 games with Open PS2 Loader</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Documentation</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Report Issue</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Features</h4>
          <ul className="footer-features">
            <li>🔒 Secure Downloads</li>
            <li>⚡ High Performance</li>
            <li>🎮 Full OPL Support</li>
            <li>🖼️ Auto Cover Art</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} PS2 Manager. Built with Tauri + React + Rust
        </p>
        <p className="footer-disclaimer">
          PlayStation and PS2 are trademarks of Sony. This is an unofficial, community-driven tool.
        </p>
      </div>
      
      <div className="footer-glow"></div>
    </footer>
  )
}
