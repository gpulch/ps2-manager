import type { GameInfo } from '../types'
import { Button } from '../ui/Button'

type Props = {
  games: GameInfo[]
  onRescan: () => void
  rescanning: boolean
  onAutoFetchMissing: () => void
  onExport: () => void
  fetchProgress: string | null
  exportMsg: string | null
}

export const Dashboard = ({ games, onRescan, rescanning, onAutoFetchMissing, onExport, fetchProgress, exportMsg }: Props) => {
  const total = games.length
  const withCover = games.filter(g => g.has_cover).length
  const missingCover = total - withCover
  const warnings = games.reduce((acc, g) => acc + (g.warnings?.length || 0), 0)

  return (
    <div className="section">
      <h2>Dashboard</h2>
      <div className="row gap-24">
        <div className="card-ui">
          <div>Total games</div>
          <h3 style={{ margin: 0 }}>{total}</h3>
        </div>
        <div className="card-ui">
          <div>With cover</div>
          <h3 style={{ margin: 0 }}>{withCover}</h3>
        </div>
        <div className="card-ui">
          <div>Missing covers</div>
          <h3 style={{ margin: 0 }}>{missingCover}</h3>
        </div>
        <div className="card-ui">
          <div>Warnings</div>
          <h3 style={{ margin: 0 }}>{warnings}</h3>
        </div>
      </div>

      <div className="row toolbar section">
        <Button onClick={onRescan} disabled={rescanning}>{rescanning ? 'Rescanning...' : 'Rescan current source'}</Button>
        <Button onClick={onAutoFetchMissing}>Auto-fetch missing covers</Button>
        <Button onClick={onExport}>Export catalog JSON</Button>
        {fetchProgress && <span><code>{fetchProgress}</code></span>}
        {exportMsg && <span><code>{exportMsg}</code></span>}
      </div>
    </div>
  )
}
