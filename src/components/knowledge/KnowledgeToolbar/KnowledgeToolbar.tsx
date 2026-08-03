import { LayoutGrid, List } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from '../../ui/IconButton/IconButton'
import { SearchField } from '../../ui/SearchField/SearchField'
import { Select } from '../../ui/Select/Select'
import { Toolbar } from '../../ui/Toolbar/Toolbar'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import styles from './KnowledgeToolbar.module.css'

export type KnowledgeViewMode = 'grid' | 'list'

interface SortOption {
  value: string
  label: string
}

interface KnowledgeToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  sortValue: string
  onSortChange: (value: string) => void
  sortOptions: SortOption[]
  viewMode: KnowledgeViewMode
  onViewModeChange: (mode: KnowledgeViewMode) => void
  resultCount?: number
  actions?: ReactNode
}

/** Search + sort + grid/list toggle toolbar shared by the Regulation Library and Collections pages. */
export function KnowledgeToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  sortValue,
  onSortChange,
  sortOptions,
  viewMode,
  onViewModeChange,
  resultCount,
  actions,
}: KnowledgeToolbarProps) {
  return (
    <Toolbar justify="between" className={styles.toolbar}>
      <div className={styles.leading}>
        <SearchField
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className={styles.search}
        />
        {typeof resultCount === 'number' && (
          <span className={styles.count} aria-live="polite">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>

      <div className={styles.trailing}>
        <Select
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
          aria-label="Sort by"
          className={styles.sort}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <div className={styles.viewToggle} role="group" aria-label="Change view">
          <Tooltip content="Grid view" side="bottom">
            <IconButton
              label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={viewMode === 'grid' ? styles.viewButtonActive : undefined}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip content="List view" side="bottom">
            <IconButton
              label="List view"
              aria-pressed={viewMode === 'list'}
              className={viewMode === 'list' ? styles.viewButtonActive : undefined}
              onClick={() => onViewModeChange('list')}
            >
              <List size={16} />
            </IconButton>
          </Tooltip>
        </div>

        {actions}
      </div>
    </Toolbar>
  )
}
