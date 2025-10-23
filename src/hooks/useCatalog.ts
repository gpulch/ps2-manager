import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { save } from '@tauri-apps/plugin-dialog'
import type { GameInfo, RenameProposal } from '../types'
import { useSourceContext } from '../contexts/SourceContext'

export const useCatalog = () => {
  const { activeSource, currentRoot } = useSourceContext()

  const [games, setGames] = useState<GameInfo[]>([])
  const [scanning, setScanning] = useState(false)
  const [renamePreview, setRenamePreview] = useState<RenameProposal[] | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  const scanGames = async (root: string) => {
    setScanning(true)
    try {
      const result = await invoke<GameInfo[]>('scan_opl_games', { opl_root: root })
      setGames(result)
      const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
      await store.set('lastRoot', root)
      await store.set(`catalog:${root}`, result)
    } finally {
      setScanning(false)
    }
  }

  const scanLibrary = async (root: string) => {
    setScanning(true)
    try {
      const result = await invoke<GameInfo[]>('scan_folder_games', { folder: root })
      setGames(result)
      const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
      await store.set('libraryRoot', root)
      await store.set(`libraryCatalog:${root}`, result)
    } finally {
      setScanning(false)
    }
  }

  const scanCurrent = async () => {
    const root = currentRoot()
    if (!root) return
    if (activeSource === 'disk') await scanGames(root)
    else await scanLibrary(root)
  }

  const previewRenames = async (root: string) => {
    const result = await invoke<RenameProposal[]>('preview_renames', { opl_root: root })
    setRenamePreview(result)
  }

  const applyRenames = async (root: string) => {
    setRenaming(true)
    try {
      const result = await invoke<RenameProposal[]>('apply_renames', { opl_root: root })
      setRenamePreview(result)
      await scanGames(root)
    } finally {
      setRenaming(false)
    }
  }

  const exportCatalog = async () => {
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

  return {
    games,
    setGames,
    scanning,
    renamePreview,
    renaming,
    previewCover,
    setPreviewCover,
    exporting,
    exportMsg,

    scanGames,
    scanLibrary,
    scanCurrent,
    previewRenames,
    applyRenames,
    exportCatalog,
  }
}
