import { useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, BookOpen, Clock, FolderOpen, Scale, Search, Sparkles } from 'lucide-react'
import { NAV_ITEMS } from '../../config/navigation'
import { useKnowledge } from '../../hooks/useKnowledge'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { useShellLayout } from '../../hooks/useShellLayout'
import { searchKnowledge } from '../../utils/knowledgeSearch'
import { SearchResult } from '../knowledge/SearchResult/SearchResult'
import { Modal } from '../ui/Modal/Modal'
import styles from './CommandPalette.module.css'

const LIST_ID = 'ri-global-search-list'
const MAX_RECENT = 8
const MAX_PER_GROUP = 5

const DEFAULT_SAVED_SEARCHES = [
  'data privacy',
  'AML beneficial ownership',
  'cybersecurity incident reporting',
  'financial services disclosure',
]

const EMPTY_QUERY_SUGGESTIONS = [
  'Browse Regulation Library',
  'Open Collections',
  'Continue reading',
  'Ask the research assistant',
]

interface FlatResult {
  id: string
  group: string
  title: string
  subtitle?: string
  meta?: string
  path: string
  icon: 'regulation' | 'document' | 'collection' | 'destination' | 'recent' | 'saved' | 'suggestion'
}

/**
 * Global Search (Cmd/Ctrl+K). Extends the shell command palette into an
 * enterprise knowledge search: recent/saved searches, suggestions, and
 * grouped results across regulations, documents, collections, and destinations.
 */
export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette } = useShellLayout()

  return (
    <Modal
      open={isCommandPaletteOpen}
      onClose={closeCommandPalette}
      hideCloseButton
      ariaLabel="Global search"
      size="md"
      bodyClassName={styles.body}
    >
      {isCommandPaletteOpen && <GlobalSearchBody onNavigate={closeCommandPalette} />}
    </Modal>
  )
}

function GlobalSearchBody({ onNavigate }: { onNavigate: () => void }) {
  const navigate = useNavigate()
  const { documents, collections } = useKnowledge()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useLocalStorageState<string[]>('ri-recent-searches', [])
  const [savedSearches, setSavedSearches] = useLocalStorageState<string[]>('ri-saved-searches', DEFAULT_SAVED_SEARCHES)

  const grouped = useMemo(() => searchKnowledge(query, documents, collections), [query, documents, collections])

  const flatResults = useMemo((): FlatResult[] => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      const idle: FlatResult[] = []

      recentSearches.slice(0, MAX_RECENT).forEach((term, index) => {
        idle.push({
          id: `recent-${index}`,
          group: 'Recent searches',
          title: term,
          path: `__search__:${term}`,
          icon: 'recent',
        })
      })

      savedSearches.forEach((term, index) => {
        idle.push({
          id: `saved-${index}`,
          group: 'Saved searches',
          title: term,
          path: `__search__:${term}`,
          icon: 'saved',
        })
      })

      idle.push(
        {
          id: 'suggest-library',
          group: 'Suggestions',
          title: EMPTY_QUERY_SUGGESTIONS[0],
          subtitle: 'Search and filter the full regulation library',
          path: '/knowledge/library',
          icon: 'suggestion',
        },
        {
          id: 'suggest-collections',
          group: 'Suggestions',
          title: EMPTY_QUERY_SUGGESTIONS[1],
          subtitle: 'Organize regulations into working sets',
          path: '/knowledge/collections',
          icon: 'suggestion',
        },
        {
          id: 'suggest-knowledge',
          group: 'Suggestions',
          title: EMPTY_QUERY_SUGGESTIONS[2],
          subtitle: 'Return to Knowledge Home',
          path: '/knowledge',
          icon: 'suggestion',
        },
        {
          id: 'suggest-ai',
          group: 'Suggestions',
          title: EMPTY_QUERY_SUGGESTIONS[3],
          subtitle: 'Jump to AI Workspace',
          path: '/ai',
          icon: 'suggestion',
        },
      )

      NAV_ITEMS.forEach((item) => {
        idle.push({
          id: `nav-${item.id}`,
          group: 'Destinations',
          title: item.label,
          subtitle: item.description,
          path: item.path,
          icon: 'destination',
        })
      })

      return idle
    }

    const results: FlatResult[] = []

    grouped.regulations.slice(0, MAX_PER_GROUP).forEach((document) => {
      results.push({
        id: `reg-${document.id}`,
        group: 'Regulations',
        title: document.title,
        subtitle: `${document.jurisdiction} · ${document.category}`,
        meta: document.status,
        path: `/knowledge/library/${document.id}`,
        icon: 'regulation',
      })
    })

    grouped.guidanceAndBulletins.slice(0, MAX_PER_GROUP).forEach((document) => {
      results.push({
        id: `doc-${document.id}`,
        group: 'Documents',
        title: document.title,
        subtitle: `${document.kind} · ${document.jurisdiction}`,
        meta: document.status,
        path: `/knowledge/library/${document.id}`,
        icon: 'document',
      })
    })

    grouped.collections.slice(0, MAX_PER_GROUP).forEach((collection) => {
      results.push({
        id: `col-${collection.id}`,
        group: 'Collections',
        title: collection.name,
        subtitle: collection.description || `${collection.documentIds.length} documents`,
        meta: `${collection.documentIds.length}`,
        path: `/knowledge/collections/${collection.id}`,
        icon: 'collection',
      })
    })

    NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized),
    ).forEach((item) => {
      results.push({
        id: `nav-${item.id}`,
        group: 'Destinations',
        title: item.label,
        subtitle: item.description,
        path: item.path,
        icon: 'destination',
      })
    })

    return results
  }, [query, grouped, recentSearches, savedSearches])

  function onQueryChange(value: string) {
    setQuery(value)
    setActiveIndex(0)
  }

  function rememberSearch(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((current) => [trimmed, ...current.filter((entry) => entry !== trimmed)].slice(0, MAX_RECENT))
  }

  function toggleSaved(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    setSavedSearches((current) =>
      current.includes(trimmed) ? current.filter((entry) => entry !== trimmed) : [trimmed, ...current],
    )
  }

  function go(result: FlatResult) {
    if (result.path.startsWith('__search__:')) {
      const term = result.path.slice('__search__:'.length)
      onQueryChange(term)
      return
    }

    if (query.trim()) rememberSearch(query)
    onNavigate()
    navigate(result.path)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, Math.max(flatResults.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = flatResults[activeIndex]
      if (item) go(item)
      else if (query.trim()) rememberSearch(query)
    } else if (event.key === 's' && (event.metaKey || event.ctrlKey) && query.trim()) {
      event.preventDefault()
      toggleSaved(query)
    }
  }

  const activeItem = flatResults[activeIndex]
  const groups = groupResults(flatResults)
  const isQuerySaved = savedSearches.includes(query.trim())

  return (
    <>
      <div className={styles.searchRow}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search knowledge, collections, or jump to..."
          className={styles.input}
          aria-label="Search knowledge base"
          role="combobox"
          aria-expanded="true"
          aria-controls={LIST_ID}
          aria-autocomplete="list"
          aria-activedescendant={activeItem ? `ri-search-option-${activeItem.id}` : undefined}
        />
        {query.trim() && (
          <button
            type="button"
            className={styles.saveButton}
            onClick={() => toggleSaved(query)}
            aria-pressed={isQuerySaved}
            title={isQuerySaved ? 'Remove saved search' : 'Save search (⌘S)'}
          >
            <Bookmark size={14} fill={isQuerySaved ? 'currentColor' : 'none'} aria-hidden="true" />
            {isQuerySaved ? 'Saved' : 'Save'}
          </button>
        )}
        <span className={styles.hint}>Esc</span>
      </div>

      <ul id={LIST_ID} role="listbox" aria-label="Search results" className={styles.list}>
        {flatResults.length === 0 && (
          <li className={styles.empty}>No matching regulations, documents, or collections.</li>
        )}

        {groups.map((group) => (
          <li key={group.label} className={styles.group} role="presentation">
            <div className={styles.groupLabel} role="presentation">
              {group.label}
            </div>
            <ul className={styles.groupList} role="group" aria-label={group.label}>
              {group.items.map((item) => {
                const absoluteIndex = flatResults.findIndex((candidate) => candidate.id === item.id)
                return (
                  <SearchResult
                    key={item.id}
                    id={`ri-search-option-${item.id}`}
                    icon={<ResultIcon kind={item.icon} />}
                    title={item.title}
                    subtitle={item.subtitle}
                    meta={item.meta}
                    active={absoluteIndex === activeIndex}
                    onMouseEnter={() => setActiveIndex(absoluteIndex)}
                    onClick={() => go(item)}
                  />
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}

function groupResults(results: FlatResult[]): { label: string; items: FlatResult[] }[] {
  const order: string[] = []
  const map = new Map<string, FlatResult[]>()

  for (const result of results) {
    if (!map.has(result.group)) {
      map.set(result.group, [])
      order.push(result.group)
    }
    map.get(result.group)!.push(result)
  }

  return order.map((label) => ({ label, items: map.get(label)! }))
}

function ResultIcon({ kind }: { kind: FlatResult['icon'] }) {
  switch (kind) {
    case 'regulation':
      return <Scale size={16} />
    case 'document':
      return <BookOpen size={16} />
    case 'collection':
      return <FolderOpen size={16} />
    case 'recent':
      return <Clock size={16} />
    case 'saved':
      return <Bookmark size={16} />
    case 'suggestion':
      return <Sparkles size={16} />
    case 'destination':
    default:
      return <Search size={16} />
  }
}
