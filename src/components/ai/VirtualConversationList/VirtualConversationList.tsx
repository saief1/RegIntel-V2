import { useMemo, useState, type UIEvent } from 'react'
import type { Conversation } from '../../../types/ai'
import { ConversationCard } from '../ConversationCard/ConversationCard'
import styles from './VirtualConversationList.module.css'

const ITEM_HEIGHT = 64
const OVERSCAN = 4

interface VirtualConversationListProps {
  items: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}

/** Lightweight windowed list for long conversation history — no extra dependencies. */
export function VirtualConversationList({ items, activeId, onSelect }: VirtualConversationListProps) {
  const [scrollTop, setScrollTop] = useState(0)

  const { start, end, offsetY, totalHeight } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
    const visibleCount = Math.ceil(320 / ITEM_HEIGHT) + OVERSCAN * 2
    const endIndex = Math.min(items.length, startIndex + visibleCount)
    return {
      start: startIndex,
      end: endIndex,
      offsetY: startIndex * ITEM_HEIGHT,
      totalHeight: items.length * ITEM_HEIGHT,
    }
  }, [items.length, scrollTop])

  if (items.length <= 12) {
    return (
      <div>
        {items.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
      </div>
    )
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    setScrollTop(event.currentTarget.scrollTop)
  }

  return (
    <div className={styles.viewport} onScroll={onScroll}>
      <div className={styles.spacer} style={{ height: totalHeight }}>
        <div className={styles.window} style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(start, end).map((conversation) => (
            <div key={conversation.id} className={styles.row}>
              <ConversationCard
                conversation={conversation}
                active={conversation.id === activeId}
                onSelect={() => onSelect(conversation.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
