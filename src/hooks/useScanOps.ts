import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { load as loadStore } from '@tauri-apps/plugin-store'
import type { GameInfo } from '../types'

export const useScanOps = ({
  setGames,
  storeReady,
  currentRoot,
  activeSource,
}: {
  setGames: (val: GameInfo[] | ((prev: GameInfo[]) => GameInfo[])) => void
  storeReady: boolean
  currentRoot: () => string | null
  activeSource: 'disk' | 'library'
}) => {
  const [scanning, setScanning] = useState(false)

  const scanGames = async (root: string) => {
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

  const scanLibrary = async (root: string) => {
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

  const scanCurrent = async () => {
    const root = currentRoot()
    if (!root) return
    if (activeSource === 'disk') await scanGames(root)
    else await scanLibrary(root)
  }

  return { scanning, scanGames, scanLibrary, scanCurrent }
}
