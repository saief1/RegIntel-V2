import { memo, useMemo } from 'react'
import { Folder, Plus } from 'lucide-react'
import type { Conversation, ConversationFolder } from '../../../types/ai'
import { Button } from '../../ui/Button/Button'
import { SearchField } from '../../ui/SearchField/SearchField'
import { VirtualConversationList } from '../VirtualConversationList/VirtualConversationList'
import styles from './ConversationHistoryPanel.module.css'

interface ConversationHistoryPanelProps {
  conversations: Conversation[]
  folders: ConversationFolder[]
  activeId: string | null
  query: string
  onQueryChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
}

function ConversationHistoryPanelComponent({
  conversations,
  folders,
  activeId,
  query,
  onQueryChange,
  onSelect,
  onCreate,
}: ConversationHistoryPanelProps) {
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return conversations
    return conversations.filter((item) => item.title.toLowerCase().includes(normalized))
  }, [conversations, query])

  const pinned = filtered.filter((item) => item.isPinned)
  const favorites = filtered.filter((item) => item.isFavorite && !item.isPinned)
  const saved = filtered.filter((item) => item.isSaved && !item.isPinned && !item.isFavorite)
  const recent = filtered.filter((item) => !item.isPinned && !item.isFavorite && !item.isSaved)

  return (
    <aside className={styles.panel} aria-label="Conversation history">
      <div className={styles.toolbar}>
        <SearchField
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
        />
        <Button size="sm" onClick={onCreate} leadingIcon={<Plus size={14} aria-hidden="true" />}>
          New
        </Button>
      </div>

      <div className={styles.scroll}>
        <Section title="Pinned chats" items={pinned} activeId={activeId} onSelect={onSelect} />
        <Section title="Favorites" items={favorites} activeId={activeId} onSelect={onSelect} />
        <Section title="Saved sessions" items={saved} activeId={activeId} onSelect={onSelect} />
        <Section title="Recent sessions" items={recent} activeId={activeId} onSelect={onSelect} />

        <div className={styles.folders}>
          <h3 className={styles.sectionTitle}>
            <Folder size={12} aria-hidden="true" />
            Folders
          </h3>
          <ul className={styles.folderList}>
            {folders.map((folder) => {
              const count = conversations.filter((item) => item.folderId === folder.id).length
              return (
                <li key={folder.id} className={styles.folderRow}>
                  <span>{folder.name}</span>
                  <span className={styles.count}>{count}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}

function Section({
  title,
  items,
  activeId,
  onSelect,
}: {
  title: string
  items: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <section className={styles.section} aria-label={title}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.list}>
        <VirtualConversationList items={items} activeId={activeId} onSelect={onSelect} />
      </div>
    </section>
  )
}

export const ConversationHistoryPanel = memo(ConversationHistoryPanelComponent)
