import { useState, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import type { RemoteGame, DownloadProgress } from '../../../types/remote'
import { fetchArchiveOrgGames, downloadRemoteIsoWithProgress } from '../../../actions/remote'
import { Button } from '../../../ui/Button'
import { Input } from '../../../ui/Input'
import { ProgressBar } from '../../shared/ProgressBar'
import { LoadingOverlay } from '../../shared/LoadingOverlay'
import { formatFileSize } from '../../../utils'

type Props = {
  libraryRoot: string | null
  onDownloadComplete: () => void
}

export const RemoteSourcesPanel = ({ libraryRoot, onDownloadComplete }: Props) => {
  const [sourceUrl, setSourceUrl] = useState('https://archive.org/download/playstation2_essentials')
  const [games, setGames] = useState<RemoteGame[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unlisten = listen<DownloadProgress>('download-progress', (event) => {
      setProgress(event.payload)
      
      if (event.payload.status === 'completed') {
        // Success! Show validation passed message briefly
        setError(null)
        setTimeout(() => {
          setDownloading(null)
          setProgress(null)
          onDownloadComplete()
        }, 500)
      } else if (event.payload.status === 'failed') {
        setDownloading(null)
        setProgress(null)
        setError('Download failed. Please try again.')
      }
    })

    return () => {
      unlisten.then(fn => fn()).catch(() => {
        // Ignore cleanup errors
      })
    }
  }, [onDownloadComplete])

  const fetchGames = async (): Promise<void> => {
    if (!sourceUrl) return
    
    setLoading(true)
    setError(null)
    try {
      const result = await fetchArchiveOrgGames(sourceUrl)
      setGames(result)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const downloadGame = async (game: RemoteGame): Promise<void> => {
    if (!libraryRoot) {
      setError('Please select a library folder first')
      return
    }

    setDownloading(game.name)
    setProgress(null)
    setError(null)

    try {
      // Download will run in background thread
      await downloadRemoteIsoWithProgress(game.download_url, libraryRoot, game.name)
      // Note: completion is handled by the event listener
    } catch (err) {
      setError(String(err))
      setDownloading(null)
      setProgress(null)
    }
  }

  return (
    <>
      <LoadingOverlay 
        show={loading} 
        message="Fetching games from Archive.org"
      >
        <p>This may take a few seconds...</p>
      </LoadingOverlay>

      <div className="section">
        <h3>Remote ISO Sources</h3>
      
      <div className="row toolbar">
        <Input
          placeholder="Archive.org collection URL"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={fetchGames} disabled={loading || !sourceUrl}>
          {loading ? 'Loading...' : 'Fetch Games'}
        </Button>
      </div>

      {error && (
        <div className="section" style={{ 
          background: 'rgba(255, 61, 61, 0.1)', 
          border: '2px solid var(--ui-danger)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--ui-danger)' }}>
            ❌ Error
          </p>
          <code style={{ fontSize: '13px', wordBreak: 'break-word' }}>{error}</code>
          
          {(error.includes('incomplete') || error.includes('mismatch')) && (
            <p style={{ margin: '12px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              💡 <strong>Tip:</strong> The download was interrupted. The incomplete file has been automatically removed. You can try again.
            </p>
          )}
          
          {error.includes('already exists') && (
            <p style={{ margin: '12px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              💡 <strong>Tip:</strong> Delete the existing file in your Library folder and try again.
            </p>
          )}
        </div>
      )}

      {progress && downloading && (
        <div className="section">
          <ProgressBar
            value={progress.downloaded}
            max={progress.total}
            label={`Downloading: ${downloading}`}
            showPercentage={true}
          />
          <div className="row justify-between" style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
            <span>{formatFileSize(progress.downloaded)}</span>
            <span>{formatFileSize(progress.total)}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
            <em>⚠️ Download in progress - The app remains usable during download</em>
          </div>
        </div>
      )}

      {games.length > 0 && (
        <div className="section">
          <h4>Available Games ({games.length})</h4>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th-left">Name</th>
                  <th className="th-left">Size</th>
                  <th className="th-left">Format</th>
                  <th className="th-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.download_url}>
                    <td><code className="code-mini">{game.name}</code></td>
                    <td>{game.size ? formatFileSize(game.size) : 'Unknown'}</td>
                    <td>{game.format.toUpperCase()}</td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => downloadGame(game)}
                        disabled={downloading !== null || !libraryRoot}
                      >
                        {downloading === game.name ? '⏳ Downloading...' : '📥 Download'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!libraryRoot && (
        <div className="section" style={{ color: 'var(--neo-accent-2)' }}>
          ⚠️ Please select a library folder in Settings before downloading games.
        </div>
      )}

      {downloading && (
        <div className="section" style={{ 
          background: 'rgba(76, 194, 255, 0.1)', 
          border: '2px solid var(--neo-accent)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
            🔄 <strong>Download in progress in background</strong>
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
            You can continue using the application normally
          </p>
        </div>
      )}
      </div>
    </>
  )
}
