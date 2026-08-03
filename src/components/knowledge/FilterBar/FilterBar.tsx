import { Check, Tag as TagIcon, X } from 'lucide-react'
import type { DocumentStatus } from '../../../types/knowledge'
import type { DocumentFilters } from '../../../utils/knowledgeSearch'
import { Button } from '../../ui/Button/Button'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem } from '../../ui/Dropdown/DropdownItem'
import { Select } from '../../ui/Select/Select'
import { Toolbar } from '../../ui/Toolbar/Toolbar'
import { statusLabel } from '../statusBadge'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  filters: DocumentFilters
  categories: string[]
  jurisdictions: string[]
  statuses: DocumentStatus[]
  tags: string[]
  onCategoryChange: (value: string) => void
  onJurisdictionChange: (value: string) => void
  onStatusChange: (value: string) => void
  onToggleTag: (tag: string) => void
  onClear: () => void
}

/** Category / jurisdiction / status / tag filter row for the Regulation Library. */
export function FilterBar({
  filters,
  categories,
  jurisdictions,
  statuses,
  tags,
  onCategoryChange,
  onJurisdictionChange,
  onStatusChange,
  onToggleTag,
  onClear,
}: FilterBarProps) {
  const activeFilterCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.jurisdiction !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    filters.tags.length

  return (
    <Toolbar justify="start" className={styles.bar} aria-label="Filter regulations">
      <Select
        value={filters.category}
        onChange={(event) => onCategoryChange(event.target.value)}
        aria-label="Filter by category"
        className={styles.select}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <Select
        value={filters.jurisdiction}
        onChange={(event) => onJurisdictionChange(event.target.value)}
        aria-label="Filter by jurisdiction"
        className={styles.select}
      >
        <option value="all">All jurisdictions</option>
        {jurisdictions.map((jurisdiction) => (
          <option key={jurisdiction} value={jurisdiction}>
            {jurisdiction}
          </option>
        ))}
      </Select>

      <Select
        value={filters.status}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
        className={styles.select}
      >
        <option value="all">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status)}
          </option>
        ))}
      </Select>

      <Dropdown
        width={240}
        trigger={
          <Button variant="secondary" size="md" leadingIcon={<TagIcon size={14} />}>
            Tags{filters.tags.length > 0 ? ` (${filters.tags.length})` : ''}
          </Button>
        }
      >
        <div className={styles.tagMenu}>
          {tags.map((tag) => {
            const selected = filters.tags.includes(tag)
            return (
              <DropdownItem key={tag} icon={selected ? <Check size={14} /> : <span className={styles.tagIconSpacer} />} onClick={() => onToggleTag(tag)}>
                {tag}
              </DropdownItem>
            )
          })}
        </div>
      </Dropdown>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="md" leadingIcon={<X size={14} />} onClick={onClear}>
          Clear filters ({activeFilterCount})
        </Button>
      )}
    </Toolbar>
  )
}
