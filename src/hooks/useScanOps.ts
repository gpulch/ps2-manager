import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { GameInfo } from '../types'
import { setStoredValue } from '../utils/storage'

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

  const scanGames = async (root: string): Promise<void> => {
    setScanning(true)
    try {
      const result = await invoke<GameInfo[]>('scan_opl_games', { opl_root: root })
      setGames(result)
      if (storeReady) {
        await Promise.all([
          setStoredValue('lastRoot', root),
          setStoredValue(`catalog:${root}`, result),
        ])
      }
    } finally {
      setScanning(false)
    }
  }

  const scanLibrary = async (root: string): Promise<void> => {
    setScanning(true)
    try {
      const result = await invoke<GameInfo[]>('scan_folder_games', { folder: root })
      setGames(result)
      if (storeReady) {
        await Promise.all([
          setStoredValue('libraryRoot', root),
          setStoredValue(`libraryCatalog:${root}`, result),
        ])
      }
    } finally {
      setScanning(false)
    }
  }

  const scanCurrent = async (): Promise<void> => {
    const root = currentRoot()
    if (!root) return
    
    if (activeSource === 'disk') {
      await scanGames(root)
    } else {
      await scanLibrary(root)
    }
  }

  return { scanning, scanGames, scanLibrary, scanCurrent }
}
