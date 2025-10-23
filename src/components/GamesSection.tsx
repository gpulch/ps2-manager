import { GamesTable } from './GamesTable'
import { RenamePreview } from './RenamePreview'
import { CoverTools } from './CoverTools'
import type { GameInfo, RenameProposal } from '../types'
import { Button } from '../ui/Button'

type Props = {
  games: GameInfo[]
  scanning: boolean
  fetchProgress: string | null
  exporting: boolean
  exportMsg: string | null
  onRescan: () => void
  onAutoFetchMissing: () => void
  onExport: () => void
  onDeleteCover: (id?: string) => void
  onFetchCover: (id?: string, title?: string) => void
  previewCover: string | null
  setPreviewCover: (url: string | null) => void
  renamePreview: RenameProposal[] | null
  onPreviewRenames: () => void
  onApplyRenames: () => void
  renaming: boolean
  root: string | null
  onCoverSaved: (id: string, path: string) => void
}

export const GamesSection = ({
  games,
  scanning,
  fetchProgress,
  exporting,
  exportMsg,
  onRescan,
  onAutoFetchMissing,
  onExport,
  onDeleteCover,
  onFetchCover,
  previewCover,
  setPreviewCover,
  renamePreview,
  onPreviewRenames,
  onApplyRenames,
  renaming,
  root,
  onCoverSaved,
}: Props) => (
  <div className="section">
    <h2>Games</h2>
    <div className="row toolbar">
      <Button onClick={onRescan} disabled={scanning}>
        {scanning ? 'Rescanning...' : 'Rescan current source'}
      </Button>
      <Button onClick={onAutoFetchMissing}>Auto-fetch missing covers</Button>
      <Button onClick={onExport} disabled={exporting}>
        {exporting ? 'Exporting...' : 'Export catalog JSON'}
      </Button>
      {fetchProgress && <span><code>{fetchProgress}</code></span>}
      {exportMsg && <span><code>{exportMsg}</code></span>}
    </div>

    <div className="table-wrap">
      <GamesTable
        games={games}
        onDelete={onDeleteCover}
        onFetch={onFetchCover}
        previewCover={previewCover}
        setPreviewCover={setPreviewCover}
      />
    </div>

    <RenamePreview
      preview={renamePreview}
      onPreview={onPreviewRenames}
      onApply={onApplyRenames}
      busy={renaming}
    />

    <CoverTools root={root} onSaved={onCoverSaved} />
  </div>
)
