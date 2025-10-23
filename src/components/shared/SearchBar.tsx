import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onToggleSort?: (field: 'name' | 'size' | 'id') => void
  totalCount?: number
  filteredCount?: number
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search games...',
  sortBy,
  sortOrder,
  onToggleSort,
  totalCount,
  filteredCount
}: Props) => (
  <div className="search-bar">
    <div className="search-input-wrapper">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1 }}
      />
      {value && (
        <button 
          className="search-clear"
          onClick={() => onChange('')}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>

    {onToggleSort && (
      <div className="search-sort">
        <Button
          size="sm"
          onClick={() => onToggleSort('name')}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          size="sm"
          onClick={() => onToggleSort('size')}
        >
          Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          size="sm"
          onClick={() => onToggleSort('id')}
        >
          ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>
    )}

    {typeof filteredCount !== 'undefined' && typeof totalCount !== 'undefined' && (
      <div className="search-results-count">
        {filteredCount === totalCount ? (
          <span>{totalCount} game{totalCount !== 1 ? 's' : ''}</span>
        ) : (
          <span>
            {filteredCount} / {totalCount} game{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )}
  </div>
)
