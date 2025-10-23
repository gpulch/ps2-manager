import { useMemo, useState } from 'react'
import type { GameInfo } from '../types'

export const useSearch = (games: GameInfo[]) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'id'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games

    const query = searchQuery.toLowerCase().trim()
    return games.filter((game) => {
      const titleMatch = game.title_guess?.toLowerCase().includes(query)
      if (titleMatch) return true
      
      const idMatch = game.id?.toLowerCase().includes(query)
      if (idMatch) return true
      
      const kindMatch = game.kind?.toLowerCase().includes(query)
      if (kindMatch) return true
      
      return game.file_name.toLowerCase().includes(query)
    })
  }, [games, searchQuery])

  const sortedGames = useMemo(() => {
    if (filteredGames.length === 0) return filteredGames
    
    const sorted = [...filteredGames]
    const multiplier = sortOrder === 'asc' ? 1 : -1

    sorted.sort((a, b) => {
      let comparison: number

      switch (sortBy) {
        case 'name':
          comparison = (a.title_guess || a.file_name).localeCompare(b.title_guess || b.file_name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'id':
          comparison = (a.id || '').localeCompare(b.id || '')
          break
        default:
          comparison = 0
      }

      return comparison * multiplier
    })

    return sorted
  }, [filteredGames, sortBy, sortOrder])

  const toggleSort = (field: 'name' | 'size' | 'id') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    toggleSort,
    filteredGames: sortedGames,
    totalGames: games.length,
    filteredCount: sortedGames.length
  }
}
