import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { SourceControls } from './components/SourceControls'
import { GamesTable } from './components/GamesTable'
import { CheatsPanel } from './components/CheatsPanel'
import { OplRoots } from './components/OplRoots'
import { OrganizerPanel } from './components/OrganizerPanel'
import { VmcPanel } from './components/VmcPanel'
import { CoverTools } from './components/CoverTools'
import './App.css'
import { invoke } from '@tauri-apps/api/core'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { open, save } from '@tauri-apps/plugin-dialog'
import type { ValidationReport, GameInfo, RenameProposal } from './types'

const App = () => {
  const [roots, setRoots] = useState<string[]>([])
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [storeReady, setStoreReady] = useState(false)
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null)
  const [games, setGames] = useState<GameInfo[]>([])
  const [scanning, setScanning] = useState(false)
  const [renamePreview, setRenamePreview] = useState<RenameProposal[] | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  const [libraryRoot, setLibraryRoot] = useState<string | null>(null)
  const [cheatsRoot, setCheatsRoot] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<'disk' | 'library'>('disk')

  function currentRoot(): string | null {
    return activeSource === 'disk' ? selectedRoot : libraryRoot
  }

  function currentCheatRoot(): string | null {
    return cheatsRoot ?? currentRoot()
  }

  async function initStore() {
    try {
      const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
      await store.set('lastOpened', new Date().toISOString())
      setStoreReady(true)
    } catch (e) {
      console.error('Store init failed', e)
    }
  }

  async function setSource(mode: 'disk' | 'library') {
    setActiveSource(mode)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('activeSource', mode)
    const nextRoot = mode === 'disk' ? selectedRoot : libraryRoot
    if (nextRoot) {
      if (mode === 'disk') await scanGames(nextRoot)
      else await scanLibrary(nextRoot)
    }
  }

  async function chooseLibraryRoot() {
    const folder = await open({ directory: true, multiple: false })
    if (!folder || Array.isArray(folder)) return
    setLibraryRoot(folder)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('libraryRoot', folder)
    if (activeSource === 'library') {
      await scanLibrary(folder)
    }
  }

  async function chooseCheatsRoot() {
    const folder = await open({ directory: true, multiple: false })
    if (!folder || Array.isArray(folder)) return
    setCheatsRoot(folder)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('cheatsRoot', folder)
  }

  async function useLibraryForCheats() {
    if (!libraryRoot) return
    setCheatsRoot(libraryRoot)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('cheatsRoot', libraryRoot)
  }

  async function exportCatalog() {
    setExporting(true)
    setExportMsg(null)
    try {
      const dest = await save({ defaultPath: 'opl-catalog.json' })
      if (!dest) return
      const json = JSON.stringify(games, null, 2)
      const path = await invoke<string>('export_catalog_json', { dest_path: dest, json })
      setExportMsg(`Exported to ${path}`)
    } catch (e: any) {
      setExportMsg(String(e))
    } finally {
      setExporting(false)
    }
  }

  async function deleteCover(id: string | undefined) {
    if (!id) return
    const root = currentRoot()
    if (!root) return
    try {
      await invoke<boolean>('delete_cover', { opl_root: root, game_id: id })
      setGames(prev => prev.map(g => g.id === id ? { ...g, has_cover: false, cover_path: null } : g))
    } catch (e: any) {
      console.error(e)
    }
  }


  async function fixStructure(root: string) {
    const res = await invoke<ValidationReport>('fix_opl_structure', { path: root })
    setReport(res)
  }

  async function scanRoots() {
    const found = await invoke<string[]>('suggest_opl_roots')
    setRoots(found)
    setReport(null)
    if (!selectedRoot && found.length > 0) setSelectedRoot(found[0])
  }

  async function validate(path: string) {
    const res = await invoke<ValidationReport>('validate_opl_dir', { path })
    setReport(res)
  }

  async function scanGames(root: string) {
    setScanning(true)
    try {
      const result = await invoke<GameInfo[]>('scan_opl_games', { opl_root: root })
      setGames(result)
      if (storeReady) {
        const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
        await store.set('lastRoot', root)
        await store.set(`catalog:${root}`, result)
      }
    } finally {
      setScanning(false)
    }
  }

  async function scanLibrary(root: string) {
    setScanning(true)
    try {
      const result = await invoke<GameInfo[]>('scan_folder_games', { folder: root })
      setGames(result)
      if (storeReady) {
        const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
        await store.set('libraryRoot', root)
        await store.set(`libraryCatalog:${root}`, result)
      }
    } finally {
      setScanning(false)
    }
  }

  async function scanCurrent() {
    const root = currentRoot()
    if (!root) return
    if (activeSource === 'disk') await scanGames(root)
    else await scanLibrary(root)
  }

  async function previewRenames(root: string) {
    const result = await invoke<RenameProposal[]>('preview_renames', { opl_root: root })
    setRenamePreview(result)
  }

  async function applyRenames(root: string) {
    setRenaming(true)
    try {
      const result = await invoke<RenameProposal[]>('apply_renames', { opl_root: root })
      setRenamePreview(result)
      await scanGames(root)
    } finally {
      setRenaming(false)
    }
  }

  
  const [fetchingCovers, setFetchingCovers] = useState(false)
  const [fetchProgress, setFetchProgress] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  async function autoFetchCoverFor(gameId?: string, title?: string) {
    const root = currentRoot()
    if (!root || !gameId) return
    try {
      const dest = await invoke<string>('auto_fetch_cover', { opl_root: root, game_id: gameId, title_guess: title ?? null, force: true })
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, has_cover: true, cover_path: dest } : g))
    } catch (e: any) {
      console.error(e)
    }
  }

  async function autoFetchMissingCovers() {
    const root = currentRoot()
    if (!root) return
    setFetchingCovers(true)
    setFetchProgress('')
    try {
      const missing = games.filter(g => !g.has_cover && g.id)
      let done = 0
      for (const g of missing) {
        setFetchProgress(`${done}/${missing.length}: ${g.id}`)
        try {
          await autoFetchCoverFor(g.id, g.title_guess)
        } catch {}
        done++
      }
      setFetchProgress(`${done}/${missing.length} done`)
    } finally {
      setFetchingCovers(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
        const src = await store.get<string>('activeSource')
        const lib = await store.get<string>('libraryRoot')
        const cht = await store.get<string>('cheatsRoot')
        if (src === 'library') setActiveSource('library')
        if (lib) setLibraryRoot(lib)
        if (cht) setCheatsRoot(cht)

        if (src === 'library' && lib) {
          const cached = await store.get<GameInfo[]>(`libraryCatalog:${lib}`)
          if (cached && Array.isArray(cached)) setGames(cached)
          scanLibrary(lib)
        } else {
          const saved = await store.get<string>('lastRoot')
          if (saved) {
            setSelectedRoot(saved)
            const cached = await store.get<GameInfo[]>(`catalog:${saved}`)
            if (cached && Array.isArray(cached)) setGames(cached)
            scanGames(saved)
          } else {
            await scanRoots()
          }
        }
        setStoreReady(true)
      } catch {
        scanRoots()
      }
    })()
  }, [])

  return (
    <div className="card" style={{ padding: 16 }}>
      <Header />

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={scanRoots}>Scan OPL disks</button>
        <button onClick={initStore} disabled={storeReady}>
          {storeReady ? 'Store ready' : 'Init Store'}
        </button>
      </div>

      <SourceControls
        activeSource={activeSource}
        libraryRoot={libraryRoot}
        cheatsRoot={cheatsRoot}
        setSource={setSource}
        chooseLibraryRoot={chooseLibraryRoot}
        chooseCheatsRoot={chooseCheatsRoot}
        useLibraryForCheats={useLibraryForCheats}
        scanning={scanning}
        scanLibrary={scanLibrary}
      />

      {activeSource === 'disk' && roots.length > 0 && (
        <OplRoots
          roots={roots}
          scanning={scanning}
          selectedRoot={selectedRoot}
          onValidate={validate}
          onFix={fixStructure}
          onScan={scanGames}
          onSelect={setSelectedRoot}
        />
      )}

      {activeSource === 'disk' && report && (
        <div style={{ marginTop: 16 }}>
          <h2>Validation</h2>
          <div>
            <strong>Root:</strong> <code>{report.root}</code>
          </div>

          <OrganizerPanel oplRoot={selectedRoot} />
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <div>
              <strong>Present</strong>
              <ul>
                {report.present.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Missing</strong>
              <ul>
                {report.missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <VmcPanel oplRoot={selectedRoot} />
        </div>
      )}

      <CheatsPanel cheatRoot={currentCheatRoot()} />

      {currentRoot() && (
        <div style={{ marginTop: 16 }}>
          <h2>Games</h2>
          <div style={{ marginBottom: 8 }}>
            <button onClick={scanCurrent} disabled={scanning}>
              {scanning ? 'Rescanning...' : 'Rescan current source'}
            </button>
            <button onClick={autoFetchMissingCovers} disabled={fetchingCovers} style={{ marginLeft: 8 }}>
              {fetchingCovers ? 'Fetching covers...' : 'Auto-fetch missing covers'}
            </button>
            <button onClick={exportCatalog} disabled={exporting} style={{ marginLeft: 8 }}>
              {exporting ? 'Exporting...' : 'Export catalog JSON'}
            </button>
            {fetchProgress && <span style={{ marginLeft: 8 }}><code>{fetchProgress}</code></span>}
            {exportMsg && <span style={{ marginLeft: 8 }}><code>{exportMsg}</code></span>}
          </div>
          <GamesTable
            games={games}
            onDelete={deleteCover}
            onFetch={autoFetchCoverFor}
            previewCover={previewCover}
            setPreviewCover={setPreviewCover}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => selectedRoot && previewRenames(selectedRoot)}>
              Preview renames (&lt;=80)
            </button>
            <button onClick={() => selectedRoot && applyRenames(selectedRoot)} disabled={renaming}>
              {renaming ? 'Renaming...' : 'Apply renames'}
            </button>
          </div>

          {renamePreview && (
            <div style={{ marginTop: 12 }}>
              <h3>Rename preview</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>From</th>
                    <th style={{ textAlign: 'left' }}>To</th>
                    <th style={{ textAlign: 'left' }}>Change?</th>
                    <th style={{ textAlign: 'left' }}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {renamePreview.map((p) => (
                    <tr key={p.from}>
                      <td><code style={{ fontSize: 12 }}>{p.from}</code></td>
                      <td><code style={{ fontSize: 12 }}>{p.to}</code></td>
                      <td>{p.will_change ? 'Yes' : 'No'}</td>
                      <td>{p.error ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <CoverTools
            root={currentRoot()}
            onSaved={(id, path) => setGames(prev => prev.map(g => g.id === id ? { ...g, has_cover: true, cover_path: path } : g))}
          />
        </div>
      )}
    </div>
  )
}

export default App
