import { useState, useEffect, useCallback, memo } from 'react'
import { invoke } from '@tauri-apps/api/core'

type SecurityInfo = {
  allowed_domains: string[]
  https_only: boolean
  max_file_size_gb: number
  min_file_size_mb: number
  allowed_extensions: string[]
  path_traversal_protection: boolean
  filename_sanitization: boolean
}

export const SecurityInfo = memo(() => {
  const [info, setInfo] = useState<SecurityInfo | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const fetchInfo = async () => {
      try {
        const result = await invoke<SecurityInfo>('get_security_info')
        if (mounted) {
          setInfo(result)
        }
      } catch (error) {
        console.error('Failed to fetch security info:', error)
      }
    }
    
    fetchInfo()
    
    return () => {
      mounted = false
    }
  }, [])
  
  const toggleShow = useCallback(() => setShow(prev => !prev), [])

  if (!info) return null

  return (
    <div className="security-info">
      <button
        className="security-info-toggle"
        onClick={toggleShow}
        title="Security Information"
        aria-expanded={show}
      >
        🔒 Security
      </button>

      {show && (
        <div className="security-info-panel">
          <h4>🛡️ Security Features</h4>
          
          <div className="security-item">
            <span className="security-label">✅ HTTPS Only:</span>
            <span className="security-value">{info.https_only ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div className="security-item">
            <span className="security-label">✅ Path Traversal Protection:</span>
            <span className="security-value">{info.path_traversal_protection ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div className="security-item">
            <span className="security-label">✅ Filename Sanitization:</span>
            <span className="security-value">{info.filename_sanitization ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div className="security-item">
            <span className="security-label">📁 Allowed Extensions:</span>
            <span className="security-value">{info.allowed_extensions.join(', ')}</span>
          </div>

          <div className="security-item">
            <span className="security-label">📊 File Size Limits:</span>
            <span className="security-value">
              {info.min_file_size_mb} MB - {info.max_file_size_gb} GB
            </span>
          </div>

          <div className="security-item">
            <span className="security-label">🌐 Whitelisted Domains:</span>
            <div className="security-domains">
              {info.allowed_domains.map((domain) => (
                <code key={domain} className="code-mini">{domain}</code>
              ))}
            </div>
          </div>

          <div className="security-note">
            <p>
              <strong>Note:</strong> Downloads are only allowed from whitelisted domains
              using HTTPS. All filenames are sanitized and paths are validated to
              prevent security vulnerabilities.
            </p>
          </div>
        </div>
      )}
    </div>
  )
})
