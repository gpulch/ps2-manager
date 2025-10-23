import { convertFileSrc } from '@tauri-apps/api/core'
import type { GameInfo } from '../../types'
import { Button } from '../../ui/Button'
import { formatFileSize } from '../../utils'

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
      <table className="table">
        <thead>
          <tr>
            <th className="th-left">ID</th>
            <th className="th-left">Title</th>
            <th className="th-left">Cover</th>
            <th className="th-left">Type</th>
            <th className="th-left">File</th>
            <th className="th-left">Size</th>
            <th className="th-left">Warnings</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.path}>
              <td>{g.id ?? '-'}</td>
              <td>{g.title_guess ?? '-'}</td>
              <td>
                {g.has_cover ? (
                  <div className="row">
                    <Button onClick={() => setPreviewCover(g.cover_path ? convertFileSrc(g.cover_path) : null)}>
                      Preview
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(g.id)}>Delete</Button>
                  </div>
                ) : (
                  <Button onClick={() => onFetch(g.id, g.title_guess || undefined)}>Fetch</Button>
                )}
              </td>
              <td>{g.kind}</td>
              <td><code className="code-mini">{g.file_name}</code></td>
              <td>{formatFileSize(g.size)}</td>
              <td>{g.warnings.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {previewCover && (
      <div className="section">
        <img src={previewCover} alt="Cover" className="img-cover" />
        <div className="row"><Button onClick={() => setPreviewCover(null)}>Close preview</Button></div>
      </div>
    )}
  </>
)
