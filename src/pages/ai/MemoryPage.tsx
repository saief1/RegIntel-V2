import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Sparkles } from 'lucide-react'
import { MemoryCard } from '../../components/ai/MemoryCard/MemoryCard'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SectionHeader } from '../../components/ui/SectionHeader/SectionHeader'
import { useCopilot } from '../../hooks/useCopilot'
import type { MemoryItem } from '../../types/ai'
import styles from './MemoryPage.module.css'

const SECTIONS: { title: string; kinds: MemoryItem['kind'][] }[] = [
  { title: 'Recent conversations', kinds: ['conversation'] },
  { title: 'Pinned knowledge', kinds: ['knowledge'] },
  { title: 'Saved evidence', kinds: ['evidence'] },
  { title: 'Bookmarks', kinds: ['bookmark'] },
  { title: 'Favorite regulations', kinds: ['regulation'] },
  { title: 'Recent searches', kinds: ['search'] },
]

export function MemoryPage() {
  const navigate = useNavigate()
  const { memory, conversations } = useCopilot()

  const items = useMemo(() => {
    const conversationItems: MemoryItem[] = conversations
      .filter((item) => item.isPinned || item.isSaved || item.isFavorite)
      .slice(0, 6)
      .map((item) => ({
        id: `live-${item.id}`,
        kind: 'conversation' as const,
        title: item.title,
        detail: `${item.messages.length} messages · local session`,
        href: '/ai',
        createdAt: item.updatedAt,
        pinned: item.isPinned,
      }))
    return [...conversationItems, ...memory]
  }, [conversations, memory])

  return (
    <PageContainer>
      <PageHeader
        icon={<BookMarked size={20} />}
        title="AI memory"
        description="Pinned knowledge, saved evidence, bookmarks, and recent local sessions. Everything stays on this device."
        actions={
          <button type="button" className={styles.backLink} onClick={() => navigate('/ai')}>
            <Sparkles size={14} aria-hidden="true" />
            Open Copilot
          </button>
        }
      />

      <div className={styles.sections}>
        {SECTIONS.map((section) => {
          const sectionItems = items.filter((item) => section.kinds.includes(item.kind))
          return (
            <section key={section.title} className={styles.section}>
              <SectionHeader title={section.title} as="h2" size="lg" />
              {sectionItems.length === 0 ? (
                <p className={styles.empty}>Nothing saved here yet.</p>
              ) : (
                <div className={styles.grid}>
                  {sectionItems.map((item) => (
                    <MemoryCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </PageContainer>
  )
}
