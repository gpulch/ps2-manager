import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { listen } from '@tauri-apps/api/event'
import type { ValidationReport, GameInfo } from './types'
import { useSourceContext } from './contexts/SourceContext'
import { suggestRoots, validateDir, fixStructure as fixStructureAction } from './actions/scanner'
import { useCoverOps } from './hooks/useCoverOps'
import { useTheme } from './hooks/useTheme'
import { useNav } from './contexts/NavContext'
import { useCatalogState } from './hooks/useCatalogState'
import { useScanOps } from './hooks/useScanOps'
import { useRenameOps } from './hooks/useRenameOps'
import { useExportOps } from './hooks/useExportOps'
import { getStoredValue } from './utils/storage'
import { NavBar } from './components/layout/NavBar'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { LoadingSpinner } from './components/shared/LoadingSpinner'
import { AppHeader } from './components/layout/AppHeader'
import { AppFooter } from './components/layout/AppFooter'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import './App.css'

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const LibraryView = lazy(() => import('./pages/LibraryView').then(m => ({ default: m.LibraryView })))
const DownloadsView = lazy(() => import('./pages/DownloadsView').then(m => ({ default: m.DownloadsView })))
const DiskView = lazy(() => import('./pages/DiskView').then(m => ({ default: m.DiskView })))
const CheatsPanel = lazy(() => import('./components/features/cheats/CheatsPanel').then(m => ({ default: m.CheatsPanel })))
const SettingsPanel = lazy(() => import('./components/features/SettingsPanel').then(m => ({ default: m.SettingsPanel })))

const App = () => {
  const [roots, setRoots] = useState<string[]>([])
  const [report, setReport] = useState<ValidationReport | null>(null)
  const { activeSource, selectedRoot, setSelectedRoot, libraryRoot, cheatsRoot, setSource, chooseLibraryRoot, chooseCheatsRoot, useLibraryForCheats, currentRoot, currentCheatRoot, storeReady } = useSourceContext()
  const { page } = useNav()

  const { games, setGames } = useCatalogState()
  const { scanning, scanGames, scanLibrary, scanCurrent } = useScanOps({ setGames, storeReady, currentRoot, activeSource })
  const { renamePreview, renaming, previewRenames, applyRenames } = useRenameOps({ refreshAfterApply: scanGames })
  const { exporting, exportMsg, exportCatalog } = useExportOps({ games })
  const {
    deleteCover,
    autoFetchCoverFor,
    autoFetchMissingCovers,
    fetchProgress,
    fetchingCovers,
  } = useCoverOps({ games, setGames, currentRoot })

  // Theme modal
  const [themeOpen, setThemeOpen] = useState(false)
  const { fontSize, setFontSize, accent, setAccent, apply } = useTheme()

  // Native menu events
  useEffect(() => {
    const unsubs: Array<() => void> = []
    const sub = async () => {
      unsubs.push(await listen('menu:chooseLibrary', async () => { await chooseLibraryRoot() }))
      unsubs.push(await listen('menu:chooseCheats', async () => { await chooseCheatsRoot() }))
      unsubs.push(await listen('menu:rescan', async () => { await scanCurrent() }))
      unsubs.push(await listen('menu:autoFetchCovers', async () => { await autoFetchMissingCovers() }))
      unsubs.push(await listen('menu:exportCatalog', async () => { await exportCatalog() }))
      unsubs.push(await listen('menu:showTheme', () => { setThemeOpen(true) }))
    }
    sub()
    return () => { unsubs.forEach(u => u()) }
  }, [scanCurrent, autoFetchMissingCovers, exportCatalog, chooseLibraryRoot, chooseCheatsRoot])

  const fixStructure = useCallback(
    async (root: string): Promise<void> => {
      const result = await fixStructureAction(root)
      setReport(result)
    },
    []
  )

  const scanRoots = useCallback(async (): Promise<void> => {
    const found = await suggestRoots()
    setRoots(found)
    setReport(null)
    if (!selectedRoot && found.length > 0) {
      setSelectedRoot(found[0])
    }
  }, [selectedRoot, setSelectedRoot])

  const validate = useCallback(
    async (path: string): Promise<void> => {
      const result = await validateDir(path)
      setReport(result)
    },
    []
  )

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      if (!storeReady) return

      if (activeSource === 'library' && libraryRoot) {
        const cached = await getStoredValue<GameInfo[]>(`libraryCatalog:${libraryRoot}`)
        if (cached && Array.isArray(cached)) setGames(cached)
        await scanLibrary(libraryRoot)
      } else if (selectedRoot) {
        const cached = await getStoredValue<GameInfo[]>(`catalog:${selectedRoot}`)
        if (cached && Array.isArray(cached)) setGames(cached)
        await scanGames(selectedRoot)
      } else {
        await scanRoots()
      }
    }

    initializeApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeReady])

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: 'system-ui', color: 'var(--neo-text)' }}>
        <AppHeader />
        <NavBar />

        <Modal open={themeOpen} title="Theme settings" onClose={() => setThemeOpen(false)}
          footer={
            <div className="row">
              <Button onClick={async () => { await apply(); setThemeOpen(false) }}>Save</Button>
              <Button variant="ghost" onClick={() => setThemeOpen(false)}>Cancel</Button>
            </div>
          }
        >
          <div className="row">
            <label>Font size</label>
            <Input uiSize="sm" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
          </div>
          <div className="row section">
            <label>Accent color</label>
            <Input uiSize="sm" value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
        </Modal>

        <Suspense fallback={<LoadingSpinner />}>
          {page === 'dashboard' && (
            <Dashboard
              games={games}
              onRescan={scanCurrent}
              rescanning={scanning}
              onAutoFetchMissing={autoFetchMissingCovers}
              onExport={exportCatalog}
              fetchProgress={fetchProgress}
              exportMsg={exportMsg}
              fetchingCovers={fetchingCovers}
            />
          )}

          {page === 'downloads' && (
            <DownloadsView
              libraryRoot={libraryRoot}
              onRescan={scanCurrent}
            />
          )}

          {page === 'library' && (
            <LibraryView
              activeSource={activeSource}
              libraryRoot={libraryRoot}
              cheatsRoot={cheatsRoot}
              setSource={setSource}
              chooseLibraryRoot={chooseLibraryRoot}
              chooseCheatsRoot={chooseCheatsRoot}
              useLibraryForCheats={useLibraryForCheats}
              scanning={scanning}
              scanLibrary={scanLibrary}

              games={games}
              fetchProgress={fetchProgress}
              exporting={exporting}
              exportMsg={exportMsg}
              onRescan={scanCurrent}
              onAutoFetchMissing={autoFetchMissingCovers}
              onExport={exportCatalog}
              onDeleteCover={deleteCover}
              onFetchCover={autoFetchCoverFor}
              renamePreview={renamePreview}
              onPreviewRenames={() => selectedRoot && previewRenames(selectedRoot)}
              onApplyRenames={() => selectedRoot && applyRenames(selectedRoot)}
              renaming={renaming}
              root={currentRoot()}
              onCoverSaved={(id, path) => setGames(prev => prev.map(g => g.id === id ? { ...g, has_cover: true, cover_path: path } : g))}
            />
          )}

          {page === 'disk' && (
            <DiskView
              roots={roots}
              scanning={scanning}
              selectedRoot={selectedRoot}
              onValidate={validate}
              onFix={fixStructure}
              onScan={scanGames}
              onSelect={setSelectedRoot}
              report={report}
            />
          )}

          {page === 'cheats' && <CheatsPanel cheatRoot={currentCheatRoot()} />}

          {page === 'settings' && (
            <SettingsPanel
              libraryRoot={libraryRoot}
              cheatsRoot={cheatsRoot}
              onChooseLibrary={chooseLibraryRoot}
              onChooseCheats={chooseCheatsRoot}
              onOpenTheme={() => setThemeOpen(true)}
            />
          )}
        </Suspense>
        <AppFooter />
      </div>
    </ErrorBoundary>
  )
}

export default App
