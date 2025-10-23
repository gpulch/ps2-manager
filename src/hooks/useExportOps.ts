import { useState } from 'react'
import { save } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import type { GameInfo } from '../types'

export const useExportOps = ({ games }: { games: GameInfo[] }) => {
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)

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

  return { exporting, exportMsg, exportCatalog }
}
