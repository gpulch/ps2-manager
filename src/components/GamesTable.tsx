import { convertFileSrc } from '@tauri-apps/api/core'
import type { GameInfo } from '../types'

type Props = {
  games: GameInfo[]
  onDelete: (id?: string) => void
  onFetch: (id?: string, title?: string) => void
  previewCover: string | null
  setPreviewCover: (url: string | null) => void
}

export const GamesTable = ({ games, onDelete, onFetch, previewCover, setPreviewCover }: Props) => (
  <>
    {games.length === 0 ? (
      <div>No games scanned yet.</div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Title</th>
            <th style={{ textAlign: 'left' }}>Cover</th>
            <th style={{ textAlign: 'left' }}>Type</th>
            <th style={{ textAlign: 'left' }}>File</th>
            <th style={{ textAlign: 'left' }}>Size</th>
            <th style={{ textAlign: 'left' }}>Warnings</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.path}>
              <td>{g.id ?? '-'}</td>
              <td>{g.title_guess ?? '-'}</td>
              <td>
                {g.has_cover ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setPreviewCover(g.cover_path ? convertFileSrc(g.cover_path) : null)}>
                      Preview
                    </button>
                    <button onClick={() => onDelete(g.id)}>Delete</button>
                  </div>
                ) : (
                  <button onClick={() => onFetch(g.id, g.title_guess || undefined)}>Fetch</button>
                )}
              </td>
              <td>{g.kind}</td>
              <td><code style={{ fontSize: 12 }}>{g.file_name}</code></td>
              <td>{(g.size / (1024 * 1024)).toFixed(1)} MB</td>
              <td>{g.warnings.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {previewCover && (
      <div style={{ marginTop: 8 }}>
        <img src={previewCover} alt="Cover" style={{ maxHeight: 220, borderRadius: 4, border: '1px solid #ccc' }} />
        <div>
          <button onClick={() => setPreviewCover(null)}>Close preview</button>
        </div>
      </div>
    )}
  </>
)
