import { useState, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { GameInfo } from '../types'

const updateGameCoverStatus = (
  games: GameInfo[],
  gameId: string,
  hasCover: boolean,
  coverPath: string | null
): GameInfo[] =>
  games.map(game =>
    game.id === gameId
      ? { ...game, has_cover: hasCover, cover_path: coverPath }
      : game
  )

const getGamesWithoutCovers = (games: GameInfo[]): GameInfo[] =>
  games.filter(game => !game.has_cover && game.id)

const formatFetchProgress = (current: number, total: number, currentId?: string): string =>
  currentId ? `${current}/${total}: ${currentId}` : `${current}/${total} done`

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

  const deleteCover = useCallback(async (id?: string): Promise<void> => {
    const root = currentRoot()
    if (!root || !id) return
    await invoke<boolean>('delete_cover', { opl_root: root, game_id: id })
    setGames(prev => updateGameCoverStatus(prev, id, false, null))
  }, [currentRoot, setGames])

  const autoFetchCoverFor = useCallback(async (id?: string, title?: string): Promise<void> => {
    const root = currentRoot()
    if (!root || !id) return
    const dest = await invoke<string>('auto_fetch_cover', { opl_root: root, game_id: id, title_guess: title ?? null, force: true })
    setGames(prev => updateGameCoverStatus(prev, id, true, dest))
  }, [currentRoot, setGames])

  // Memoize games without covers to avoid recalculation
  const missingCovers = useMemo(() => getGamesWithoutCovers(games), [games])

  const autoFetchMissingCovers = useCallback(async (): Promise<void> => {
    const root = currentRoot()
    if (!root) return
    
    setFetchingCovers(true)
    setFetchProgress('')
    
    try {
      let completedCount = 0
      
      for (const game of missingCovers) {
        setFetchProgress(formatFetchProgress(completedCount, missingCovers.length, game.id))
        try {
          await autoFetchCoverFor(game.id, game.title_guess)
        } catch (error) {
          console.warn(`Failed to fetch cover for ${game.id}:`, error)
        }
        completedCount++
      }
      
      setFetchProgress(formatFetchProgress(completedCount, missingCovers.length))
    } finally {
      setFetchingCovers(false)
    }
  }, [currentRoot, missingCovers, autoFetchCoverFor])

  return { deleteCover, autoFetchCoverFor, autoFetchMissingCovers, fetchingCovers, fetchProgress }
}
