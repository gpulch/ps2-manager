import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '../../../ui/Button'
import { formatFileSize } from '../../../utils'

type DuplicateGame = {
  path: string
  file_name: string
  size: number
  id?: string
  title_guess?: string
}

type DuplicateGroup = {
  game_id: string
  count: number
  total_size: number
  games: DuplicateGame[]
}

type DuplicateStats = {
  total_duplicate_groups: number
  total_duplicate_files: number
  wasted_space_bytes: number
  wasted_space_mb: number
  wasted_space_gb: number
}

type Props = {
  libraryRoot: string
}

export const DuplicateManager = ({ libraryRoot }: Props) => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [stats, setStats] = useState<DuplicateStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const scanDuplicates = async () => {
    if (!libraryRoot) return
    
    setLoading(true)
    try {
      const [dupsResult, statsResult] = await Promise.all([
        invoke<DuplicateGroup[]>('find_duplicate_games', { folder: libraryRoot }),
        invoke<DuplicateStats>('get_duplicate_stats', { folder: libraryRoot })
      ])
      
      setDuplicates(dupsResult)
      setStats(statsResult)
    } catch (error) {
      console.error('Failed to scan duplicates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (libraryRoot) {
      scanDuplicates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryRoot])

  const toggleExpand = (gameId: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(gameId)) {
        next.delete(gameId)
      } else {
        next.add(gameId)
      }
      return next
    })
  }

  if (!libraryRoot) {
    return (
      <div className="section" style={{ color: 'var(--neo-accent-2)' }}>
        ⚠️ Please select a library folder first
      </div>
    )
  }

  return (
    <div className="section">
      <div className="row justify-between align-center">
        <h3>🔍 Duplicate Detector</h3>
        <Button onClick={scanDuplicates} disabled={loading}>
          {loading ? 'Scanning...' : 'Scan Duplicates'}
        </Button>
      </div>

      {stats && (
        <div className="duplicate-stats">
          <div className="stat-card">
            <span className="stat-label">Duplicate Groups:</span>
            <span className="stat-value">{stats.total_duplicate_groups}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Duplicate Files:</span>
            <span className="stat-value">{stats.total_duplicate_files}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Wasted Space:</span>
            <span className="stat-value danger">
              {stats.wasted_space_gb.toFixed(2)} GB
            </span>
          </div>
        </div>
      )}

      {duplicates.length === 0 && !loading && (
        <div className="empty-state">
          <p>✅ No duplicates found! Your library is clean.</p>
        </div>
      )}

      {duplicates.length > 0 && (
        <div className="duplicates-list">
          {duplicates.map((group) => (
            <div key={group.game_id} className="duplicate-group">
              <div
                className="duplicate-header"
                onClick={() => toggleExpand(group.game_id)}
              >
                <div>
                  <strong>{group.game_id}</strong>
                  <span className="duplicate-count">
                    {group.count} copies ({formatFileSize(group.total_size)} total)
                  </span>
                </div>
                <span className="expand-icon">
                  {expanded.has(group.game_id) ? '▼' : '▶'}
                </span>
              </div>

              {expanded.has(group.game_id) && (
                <div className="duplicate-items">
                  {group.games.map((game, idx) => (
                    <div key={idx} className="duplicate-item">
                      <div className="item-info">
                        <div className="item-title">
                          {game.title_guess || game.file_name}
                        </div>
                        <div className="item-details">
                          <code>{game.file_name}</code>
                          <span>{formatFileSize(game.size)}</span>
                        </div>
                      </div>
                      <div className="item-actions">
                        {idx > 0 && (
                          <Button size="sm" onClick={() => {
                            // TODO: Implement delete
                            console.log('Delete:', game.path)
                          }}>
                            Delete
                          </Button>
                        )}
                        {idx === 0 && (
                          <span className="keep-badge">✓ Keep</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
