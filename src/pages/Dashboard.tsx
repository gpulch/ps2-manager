import { useMemo } from 'react'
import type { GameInfo } from '../types'
import { Button } from '../ui/Button'
import { PageLayout } from '../components/layout/PageLayout'
import { calculateDashboardStats } from '../utils'

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
  // Memoize stats calculation to avoid recalculation on every render
  const stats = useMemo(() => calculateDashboardStats(games), [games])
  const { total, withCover, missingCover, warnings } = stats

  return (
    <PageLayout title="Dashboard">
      <div className="stats-grid">
        <div className="card-ui stat-card">
          <div>Total games</div>
          <h3>{total}</h3>
        </div>
        <div className="card-ui stat-card">
          <div>With cover</div>
          <h3>{withCover}</h3>
        </div>
        <div className="card-ui stat-card">
          <div>Missing covers</div>
          <h3>{missingCover}</h3>
        </div>
        <div className="card-ui stat-card">
          <div>Warnings</div>
          <h3>{warnings}</h3>
        </div>
      </div>

      <div className="section">
        <div className="row toolbar">
          <Button onClick={onRescan} disabled={rescanning}>{rescanning ? 'Rescanning...' : 'Rescan current source'}</Button>
          <Button onClick={onAutoFetchMissing}>Auto-fetch missing covers</Button>
          <Button onClick={onExport}>Export catalog JSON</Button>
        </div>
        {fetchProgress && <div style={{ marginTop: '8px' }}><code>{fetchProgress}</code></div>}
        {exportMsg && <div style={{ marginTop: '8px' }}><code>{exportMsg}</code></div>}
      </div>
    </PageLayout>
  )
}
