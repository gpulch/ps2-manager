import type { GameInfo } from '../types'

export type DashboardStats = {
  total: number
  withCover: number
  missingCover: number
  warnings: number
}

export const calculateDashboardStats = (games: GameInfo[]): DashboardStats => {
  const total = games.length
  const withCover = games.filter(game => game.has_cover).length
  const missingCover = total - withCover
  const warnings = games.reduce((acc, game) => acc + (game.warnings?.length || 0), 0)

  return {
    total,
    withCover,
    missingCover,
    warnings,
  }
}
