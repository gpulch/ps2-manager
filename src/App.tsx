import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { CheatsPanel } from './components/CheatsPanel'
import './App.css'
import { load as loadStore } from '@tauri-apps/plugin-store'
import type { ValidationReport, GameInfo } from './types'
import { useSourceContext } from './contexts/SourceContext'
import { suggestRoots, validateDir, fixStructure as fixStructureAction } from './actions/scanner'
import { useCoverOps } from './hooks/useCoverOps'
import { listen } from '@tauri-apps/api/event'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { useTheme } from './hooks/useTheme'
import { useNav } from './contexts/NavContext'
import { NavBar } from './components/NavBar'
import { Dashboard } from './pages/Dashboard'
import { LibraryView } from './pages/LibraryView'
import { DiskView } from './pages/DiskView'
import { SettingsPanel } from './components/SettingsPanel'
import { useCatalogState } from './hooks/useCatalogState'
import { useScanOps } from './hooks/useScanOps'
import { useRenameOps } from './hooks/useRenameOps'
import { useExportOps } from './hooks/useExportOps'

const App = () => {
  const [roots, setRoots] = useState<string[]>([])
  const [report, setReport] = useState<ValidationReport | null>(null)
  const { activeSource, selectedRoot, setSelectedRoot, libraryRoot, cheatsRoot, setSource, chooseLibraryRoot, chooseCheatsRoot, useLibraryForCheats, currentRoot, currentCheatRoot, storeReady } = useSourceContext()
  const { page } = useNav()

  const { games, setGames, previewCover, setPreviewCover } = useCatalogState()
  const { scanning, scanGames, scanLibrary, scanCurrent } = useScanOps({ setGames, storeReady, currentRoot, activeSource })
  const { renamePreview, renaming, previewRenames, applyRenames } = useRenameOps({ refreshAfterApply: scanGames })
  const { exporting, exportMsg, exportCatalog } = useExportOps({ games })
  const {
    deleteCover,
    autoFetchCoverFor,
    autoFetchMissingCovers,
    fetchProgress,
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

  const fixStructure = async (root: string) => setReport(await fixStructureAction(root))

  const scanRoots = async () => {
    const found = await suggestRoots()
    setRoots(found)
    setReport(null)
    if (!selectedRoot && found.length > 0) setSelectedRoot(found[0])
  }

  const validate = async (path: string) => setReport(await validateDir(path))

  useEffect(() => {
    (async () => {
      if (!storeReady) return
      const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
      if (activeSource === 'library' && libraryRoot) {
        const cached = await store.get<GameInfo[]>(`libraryCatalog:${libraryRoot}`)
        if (cached && Array.isArray(cached)) setGames(cached)
        await scanLibrary(libraryRoot)
      } else if (selectedRoot) {
        const cached = await store.get<GameInfo[]>(`catalog:${selectedRoot}`)
        if (cached && Array.isArray(cached)) setGames(cached)
        await scanGames(selectedRoot)
      } else {
        await scanRoots()
      }
    })()
  }, [storeReady])

  return (
    <div className="card">
      <Header />
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

      {page === 'dashboard' && (
        <Dashboard
          games={games}
          onRescan={scanCurrent}
          rescanning={scanning}
          onAutoFetchMissing={autoFetchMissingCovers}
          onExport={exportCatalog}
          fetchProgress={fetchProgress}
          exportMsg={exportMsg}
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
          previewCover={previewCover}
          setPreviewCover={setPreviewCover}
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
    </div>
  )
}

export default App
