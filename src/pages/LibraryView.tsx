import type { GameInfo, RenameProposal } from '../types'
import { SourceControls } from '../components/features/SourceControls'
import { GamesSection } from '../components/shared/GamesSection'
import { RemoteSourcesPanel } from '../components/features/remote/RemoteSourcesPanel'
import { PageLayout } from '../components/layout/PageLayout'

type Props = {
  activeSource: 'disk' | 'library'
  libraryRoot: string | null
  cheatsRoot: string | null
  setSource: (m: 'disk' | 'library') => Promise<void>
  chooseLibraryRoot: () => Promise<void>
  chooseCheatsRoot: () => Promise<void>
  useLibraryForCheats: () => Promise<void>
  scanning: boolean
  scanLibrary: (root: string) => Promise<void>

  games: GameInfo[]
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

export const LibraryView = (props: Props) => (
  <PageLayout title="Library">
    <SourceControls
      activeSource={props.activeSource}
      libraryRoot={props.libraryRoot}
      cheatsRoot={props.cheatsRoot}
      setSource={props.setSource}
      chooseLibraryRoot={props.chooseLibraryRoot}
      chooseCheatsRoot={props.chooseCheatsRoot}
      useLibraryForCheats={props.useLibraryForCheats}
      scanning={props.scanning}
      scanLibrary={props.scanLibrary}
    />

    <RemoteSourcesPanel 
      libraryRoot={props.libraryRoot}
      onDownloadComplete={props.onRescan}
    />

    {props.root && (
      <GamesSection
        games={props.games}
        scanning={props.scanning}
        fetchProgress={props.fetchProgress}
        exporting={props.exporting}
        exportMsg={props.exportMsg}
        onRescan={props.onRescan}
        onAutoFetchMissing={props.onAutoFetchMissing}
        onExport={props.onExport}
        onDeleteCover={props.onDeleteCover}
        onFetchCover={props.onFetchCover}
        previewCover={props.previewCover}
        setPreviewCover={props.setPreviewCover}
        renamePreview={props.renamePreview}
        onPreviewRenames={props.onPreviewRenames}
        onApplyRenames={props.onApplyRenames}
        renaming={props.renaming}
        root={props.root}
        onCoverSaved={props.onCoverSaved}
      />
    )}
  </PageLayout>
)
