import { useMemo, useState } from 'react'
import type { GameInfo, RenameProposal } from '../types'
import { GamesTable } from '../components/shared/GamesTable'
import { PageLayout } from '../components/layout/PageLayout'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useSourceContext } from '../contexts/SourceContext'

type Props = {
  activeSource: 'disk' | 'library'
  libraryRoot: string | null
  cheatsRoot: string | null
  setSource: (m: 'disk' | 'library') => Promise<void>
  chooseLibraryRoot: () => Promise<void>
  chooseCheatsRoot: () => Promise<void>
  useLibraryForCheats: () => Promise<void>
  scanning: boolean
  scanLibrary: (root: string) => Promise<void>

  games: GameInfo[]
  fetchProgress: string | null
  exporting: boolean
  exportMsg: string | null
  onRescan: () => void
  onAutoFetchMissing: () => void
  onExport: () => void
  onDeleteCover: (id?: string) => void
  onFetchCover: (id?: string, title?: string) => void
  renamePreview: RenameProposal[] | null
  onPreviewRenames: () => void
  onApplyRenames: () => void
  renaming: boolean
  root: string | null
  onCoverSaved: (id: string, path: string) => void
}

export const LibraryView = (props: Props) => {
  const { selectedRoot } = useSourceContext()
  type SortField = 'id' | 'name' | 'region' | 'type' | 'size' | 'warnings'
  type SortOrder = 'asc' | 'desc'

  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const regionKey = (id?: string): string => (id ? id.slice(0, 4).toUpperCase() : '')
  const warningCount = (g: GameInfo): number => g.warnings?.length ?? 0

  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = (props.games || []).filter(g => {
      if (!q) return true
      const id = g.id?.toLowerCase() || ''
      const title = g.title_guess?.toLowerCase() || ''
      return id.includes(q) || title.includes(q)
    })

    const compare = (a: GameInfo, b: GameInfo): number => {
      let cmp = 0
      switch (sortField) {
        case 'id':
          cmp = (a.id || '').localeCompare(b.id || '')
          break
        case 'name':
          cmp = (a.title_guess || '').localeCompare(b.title_guess || '')
          break
        case 'region':
          cmp = regionKey(a.id).localeCompare(regionKey(b.id))
          break
        case 'type':
          cmp = (a.kind || '').localeCompare(b.kind || '')
          break
        case 'size':
          cmp = (a.size || 0) - (b.size || 0)
          break
        case 'warnings':
          cmp = warningCount(a) - warningCount(b)
          break
      }
      return sortOrder === 'asc' ? cmp : -cmp
    }

    return filtered.sort(compare)
  }, [props.games, searchQuery, sortField, sortOrder])

  return (
    <PageLayout title="Library">
      <div className="row toolbar" style={{ gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Search by ID or Title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 280px', minWidth: 220 }}
        />
        <Select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)} uiSize="md">
          <option value="name">Sort by Name</option>
          <option value="id">Sort by ID</option>
          <option value="region">Sort by Region</option>
          <option value="type">Sort by Type</option>
          <option value="size">Sort by Size</option>
          <option value="warnings">Sort by Warnings</option>
        </Select>
        <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} uiSize="md">
          <option value="asc">↑ Asc</option>
          <option value="desc">↓ Desc</option>
        </Select>
      </div>

      <div className="table-wrap">
        <GamesTable
          games={filteredSorted}
          onDelete={props.onDeleteCover}
          onFetch={props.onFetchCover}
          oplRoot={selectedRoot || undefined}
        />
      </div>
    </PageLayout>
  )
}
