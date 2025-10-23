import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { GameInfo } from '../types'

export const useCoverOps = ({
  games,
  setGames,
  currentRoot,
}: {
  games: GameInfo[]
  setGames: (updater: (prev: GameInfo[]) => GameInfo[]) => void
  currentRoot: () => string | null
}) => {
  const [fetchingCovers, setFetchingCovers] = useState(false)
  const [fetchProgress, setFetchProgress] = useState<string | null>(null)

  const deleteCover = async (id?: string) => {
    const root = currentRoot()
    if (!root || !id) return
    await invoke<boolean>('delete_cover', { opl_root: root, game_id: id })
    setGames(prev => prev.map(g => g.id === id ? { ...g, has_cover: false, cover_path: null } : g))
  }

  const autoFetchCoverFor = async (id?: string, title?: string) => {
    const root = currentRoot()
    if (!root || !id) return
    const dest = await invoke<string>('auto_fetch_cover', { opl_root: root, game_id: id, title_guess: title ?? null, force: true })
    setGames(prev => prev.map(g => g.id === id ? { ...g, has_cover: true, cover_path: dest } : g))
  }

  const autoFetchMissingCovers = async () => {
    const root = currentRoot()
    if (!root) return
    setFetchingCovers(true)
    setFetchProgress('')
    try {
      const missing = games.filter(g => !g.has_cover && g.id)
      let done = 0
      for (const g of missing) {
        setFetchProgress(`${done}/${missing.length}: ${g.id}`)
        try { await autoFetchCoverFor(g.id, g.title_guess) } catch {}
        done++
      }
      setFetchProgress(`${done}/${missing.length} done`)
    } finally {
      setFetchingCovers(false)
    }
  }

  return { deleteCover, autoFetchCoverFor, autoFetchMissingCovers, fetchingCovers, fetchProgress }
}
