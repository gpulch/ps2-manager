import { useState } from 'react'
import type { GameInfo } from '../types'

export const useCatalogState = () => {
  const [games, setGames] = useState<GameInfo[]>([])
  const [previewCover, setPreviewCover] = useState<string | null>(null)
  return { games, setGames, previewCover, setPreviewCover }
}
