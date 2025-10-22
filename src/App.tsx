import { useEffect, useState } from 'react'
import sonyLogo from './assets/sony.svg'
import ps2Logo from './assets/ps2.svg'
import './App.css'
import { invoke, convertFileSrc } from '@tauri-apps/api/core'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { open, save } from '@tauri-apps/plugin-dialog'

type ValidationReport = {
  root: string
  present: string[]
  missing: string[]
}
type GameInfo = {
  path: string
  file_name: string
  size: number
  kind: string
  id?: string
  title_guess?: string
  warnings: string[]
  has_cover: boolean
  cover_path?: string | null
}
type RenameProposal = {
  from: string
  to: string
  will_change: boolean
  error?: string | null
}

type VmcInfo = {
  file_name: string
  path: string
  size: number
  modified: number
}

type OrganizeProposal = {
  from: string
  to: string
  will_move: boolean
  reason: string
  error?: string | null
}

function App() {
  const [roots, setRoots] = useState<string[]>([])
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [storeReady, setStoreReady] = useState(false)
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null)
  const [games, setGames] = useState<GameInfo[]>([])
  const [scanning, setScanning] = useState(false)
  const [renamePreview, setRenamePreview] = useState<RenameProposal[] | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  const [vmcs, setVmcs] = useState<VmcInfo[]>([])
  const [vmcLoading, setVmcLoading] = useState(false)
  const [cheatId, setCheatId] = useState('')
  const [cheatText, setCheatText] = useState('')
  const [cheatMsg, setCheatMsg] = useState<string | null>(null)
  const [cheatLoading, setCheatLoading] = useState(false)
  const [orgPreview, setOrgPreview] = useState<OrganizeProposal[] | null>(null)
  const [organizing, setOrganizing] = useState(false)
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
      // update local state optimistically
      setGames(prev => prev.map(g => g.id === id ? { ...g, has_cover: false, cover_path: null } : g))
    } catch (e: any) {
      setCoverMsg(String(e))
    }
  }

  async function previewOrganize() {
    if (!selectedRoot) return
    const res = await invoke<OrganizeProposal[]>('preview_organize', { opl_root: selectedRoot })
    setOrgPreview(res)
  }

  async function applyOrganize() {
    if (!selectedRoot) return
    setOrganizing(true)
    try {
      const res = await invoke<OrganizeProposal[]>('apply_organize', { opl_root: selectedRoot })
      setOrgPreview(res)
      await scanGames(selectedRoot)
    } finally {
      setOrganizing(false)
    }
  }
  async function refreshVmcs() {
    if (!selectedRoot) return
    setVmcLoading(true)
    try {
      const list = await invoke<VmcInfo[]>('list_vmcs', { opl_root: selectedRoot })
      setVmcs(list)
    } finally {
      setVmcLoading(false)
    }
  }

  async function importVmc() {
    if (!selectedRoot) return
    const file = await open({ multiple: false, filters: [{ name: 'VMC', extensions: ['vmc','ps2','psu'] }] })
    if (!file || Array.isArray(file)) return
    await invoke<string>('import_vmc', { opl_root: selectedRoot, src_path: file })
    await refreshVmcs()
  }

  async function exportVmc(fileName: string) {
    if (!selectedRoot) return
    const dest = await save({ defaultPath: fileName })
    if (!dest) return
    await invoke<string>('export_vmc', { opl_root: selectedRoot, file_name: fileName, dest_path: dest })
  }

  async function deleteVmc(fileName: string) {
    if (!selectedRoot) return
    await invoke<boolean>('delete_vmc', { opl_root: selectedRoot, file_name: fileName })
    await refreshVmcs()
  }

  async function loadCheat() {
    const root = currentCheatRoot()
    if (!root || !cheatId) return
    setCheatLoading(true)
    setCheatMsg(null)
    try {
      const content = await invoke<string>('load_cht', { opl_root: root, game_id: cheatId })
      setCheatText(content)
    } catch (e: any) {
      setCheatMsg(String(e))
    } finally {
      setCheatLoading(false)
    }
  }

  async function saveCheat() {
    const root = currentCheatRoot()
    if (!root || !cheatId) return
    setCheatLoading(true)
    setCheatMsg(null)
    try {
      const path = await invoke<string>('save_cht', { opl_root: root, game_id: cheatId, content: cheatText })
      setCheatMsg(`Saved to ${path}`)
    } catch (e: any) {
      setCheatMsg(String(e))
    } finally {
      setCheatLoading(false)
    }
  }

  async function importCheat() {
    const root = currentCheatRoot()
    if (!root) return
    setCheatMsg(null)
    const file = await open({ multiple: false, filters: [{ name: 'Cheat', extensions: ['cht'] }] })
    if (!file || Array.isArray(file)) return
    try {
      const dest = await invoke<string>('import_cht', { opl_root: root, maybe_game_id: cheatId || null, src_path: file })
      setCheatMsg(`Imported to ${dest}`)
      if (cheatId) {
        await loadCheat()
      }
    } catch (e: any) {
      setCheatMsg(String(e))
    }
  }

  async function exportCheat() {
    const root = currentCheatRoot()
    if (!root || !cheatId) return
    setCheatMsg(null)
    const dest = await save({ defaultPath: `${cheatId}.cht` })
    if (!dest) return
    try {
      const out = await invoke<string>('export_cht', { opl_root: root, game_id: cheatId, dest_path: dest })
      setCheatMsg(`Exported to ${out}`)
    } catch (e: any) {
      setCheatMsg(String(e))
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

  const [coverId, setCoverId] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverMsg, setCoverMsg] = useState<string | null>(null)
  const [fetchingCovers, setFetchingCovers] = useState(false)
  const [fetchProgress, setFetchProgress] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  async function saveCoverFromUrl() {
    const root = currentRoot()
    if (!root) return
    setCoverMsg(null)
    try {
      const dest = await invoke<string>('save_cover_from_url', { opl_root: root, game_id: coverId, url: coverUrl })
      setCoverMsg(`Saved to ${dest}`)
      setGames(prev => prev.map(g => g.id === coverId ? { ...g, has_cover: true, cover_path: dest } : g))
    } catch (e: any) {
      setCoverMsg(String(e))
    }
  }

  async function saveCoverFromFile() {
    const root = currentRoot()
    if (!root) return
    setCoverMsg(null)
    const file = await open({ multiple: false, filters: [{ name: 'Images', extensions: ['png','jpg','jpeg','gif','webp'] }] })
    if (!file || Array.isArray(file)) return
    try {
      const dest = await invoke<string>('save_cover_from_file', { opl_root: root, game_id: coverId, src_path: file })
      setCoverMsg(`Saved to ${dest}`)
      setGames(prev => prev.map(g => g.id === coverId ? { ...g, has_cover: true, cover_path: dest } : g))
    } catch (e: any) {
      setCoverMsg(String(e))
    }
  }

  async function autoFetchCoverById() {
    const root = currentRoot()
    if (!root || !coverId) return
    setCoverMsg(null)
    try {
      const dest = await invoke<string>('auto_fetch_cover', { opl_root: root, game_id: coverId, title_guess: null, force: true })
      setCoverMsg(`Fetched to ${dest}`)
      setGames(prev => prev.map(g => g.id === coverId ? { ...g, has_cover: true, cover_path: dest } : g))
    } catch (e: any) {
      setCoverMsg(String(e))
    }
  }

  async function autoFetchCoverFor(gameId?: string, title?: string) {
    const root = currentRoot()
    if (!root || !gameId) return
    try {
      const dest = await invoke<string>('auto_fetch_cover', { opl_root: root, game_id: gameId, title_guess: title ?? null, force: true })
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, has_cover: true, cover_path: dest } : g))
    } catch (e: any) {
      setCoverMsg(String(e))
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
      <div className="neo-header">
        <img src={sonyLogo} alt="Sony" style={{ height: 28 }} />
        <img src={ps2Logo} alt="PlayStation 2" style={{ height: 28 }} />
        <h1 style={{ margin: 0, marginLeft: 8 }}>PS2 Manager</h1>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={scanRoots}>Scan OPL disks</button>
        <button onClick={initStore} disabled={storeReady}>
          {storeReady ? 'Store ready' : 'Init Store'}
        </button>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>Source</strong>
        <button onClick={() => setSource('disk')} disabled={activeSource === 'disk'}>Disk</button>
        <button onClick={() => setSource('library')} disabled={activeSource === 'library'}>Library</button>
        {activeSource === 'library' && (
          <>
            <button onClick={chooseLibraryRoot}>Choose library folder</button>
            <button onClick={chooseCheatsRoot}>Choose cheats folder</button>
            <button onClick={useLibraryForCheats}>Use library for cheats</button>
            <span>Library: <code style={{ fontSize: 12 }}>{libraryRoot ?? '-'}</code></span>
            <span>Cheats: <code style={{ fontSize: 12 }}>{(cheatsRoot ?? libraryRoot) ?? '-'}</code></span>
            <button onClick={() => libraryRoot && scanLibrary(libraryRoot)} disabled={scanning || !libraryRoot}>
              {scanning ? 'Scanning...' : 'Scan library'}
            </button>
          </>
        )}
      </div>

      {activeSource === 'disk' && roots.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2>Detected OPL roots</h2>
          <ul>
            {roots.map((r) => (
              <li key={r} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ fontSize: 12 }}>{r}</code>
                <button onClick={() => validate(r)}>Validate</button>
                <button onClick={() => fixStructure(r)}>Fix missing dirs</button>
                <button onClick={() => { setSelectedRoot(r); scanGames(r) }} disabled={scanning}>
                  {scanning && selectedRoot === r ? 'Scanning...' : 'Scan games'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeSource === 'disk' && report && (
        <div style={{ marginTop: 16 }}>
          <h2>Validation</h2>
          <div>
            <strong>Root:</strong> <code>{report.root}</code>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>Organizer (CD/DVD)</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button onClick={previewOrganize}>Preview organization</button>
              <button onClick={applyOrganize} disabled={organizing}>{organizing ? 'Organizing...' : 'Apply organization'}</button>
            </div>
            {orgPreview && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>From</th>
                    <th style={{ textAlign: 'left' }}>To</th>
                    <th style={{ textAlign: 'left' }}>Move?</th>
                    <th style={{ textAlign: 'left' }}>Reason</th>
                    <th style={{ textAlign: 'left' }}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {orgPreview.map(p => (
                    <tr key={p.from + '->' + p.to}>
                      <td><code style={{ fontSize: 12 }}>{p.from}</code></td>
                      <td><code style={{ fontSize: 12 }}>{p.to}</code></td>
                      <td>{p.will_move ? 'Yes' : 'No'}</td>
                      <td>{p.reason}</td>
                      <td>{p.error ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

          <div style={{ marginTop: 16 }}>
            <h3>VMC manager</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <button onClick={refreshVmcs} disabled={vmcLoading}>{vmcLoading ? 'Refreshing...' : 'Refresh VMCs'}</button>
              <button onClick={importVmc}>Import VMC</button>
            </div>
            {vmcs.length === 0 ? (
              <div>No VMC files found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>File</th>
                    <th style={{ textAlign: 'left' }}>Size</th>
                    <th style={{ textAlign: 'left' }}>Modified</th>
                    <th style={{ textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vmcs.map(v => (
                    <tr key={v.path}>
                      <td><code style={{ fontSize: 12 }}>{v.file_name}</code></td>
                      <td>{(v.size / (1024 * 1024)).toFixed(2)} MB</td>
                      <td>{new Date(v.modified * 1000).toLocaleString()}</td>
                      <td>
                        <button onClick={() => exportVmc(v.file_name)}>Export</button>
                        <button onClick={() => deleteVmc(v.file_name)} style={{ marginLeft: 8 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h3>Cheat manager (.CHT)</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input placeholder="Game ID (e.g. SLUS_203.12)" value={cheatId} onChange={(e) => setCheatId(e.target.value)} />
          <button onClick={loadCheat} disabled={cheatLoading}>{cheatLoading ? 'Loading...' : 'Load'}</button>
          <button onClick={saveCheat} disabled={cheatLoading || !cheatId}>{cheatLoading ? 'Saving...' : 'Save'}</button>
          <button onClick={importCheat} disabled={cheatLoading}>Import (.CHT)</button>
          <button onClick={exportCheat} disabled={cheatLoading || !cheatId}>Export (.CHT)</button>
        </div>
        <textarea value={cheatText} onChange={(e) => setCheatText(e.target.value)} rows={10} style={{ width: '100%' }} />
        {cheatMsg && <div style={{ marginTop: 8 }}><code>{cheatMsg}</code></div>}
      </div>

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
                          <button onClick={() => deleteCover(g.id)}>Delete</button>
                        </div>
                      ) : (
                        <button onClick={() => autoFetchCoverFor(g.id, g.title_guess || undefined)}>Fetch</button>
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

          <div style={{ marginTop: 16 }}>
            <h3>Cover tools</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input placeholder="Game ID (e.g. SLUS_203.12)" value={coverId} onChange={(e) => setCoverId(e.target.value)} />
              <input placeholder="Image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={{ minWidth: 320 }} />
              <button onClick={saveCoverFromUrl}>Save cover from URL</button>
              <button onClick={saveCoverFromFile}>Save cover from file</button>
              <button onClick={autoFetchCoverById}>Auto-fetch cover</button>
            </div>
            {coverMsg && <div style={{ marginTop: 8 }}><code>{coverMsg}</code></div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
