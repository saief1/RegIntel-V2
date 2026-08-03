import { useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContextualHelpIcon } from '../../components/adoption/ContextualHelpIcon'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useAdoption } from '../../hooks/useAdoption'
import type { HelpCategory } from '../../types/adoption'
import { AdoptionHubNav } from './AdoptionHubNav'
import styles from './adoption.module.css'

export function LearningCenterPage() {
  const {
    helpArticles,
    helpCategories,
    helpBookmarks,
    helpRecent,
    toggleHelpBookmark,
    viewHelpArticle,
  } = useAdoption()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | HelpCategory>('all')
  const [selectedId, setSelectedId] = useState(helpArticles[0]?.id ?? '')

  const filtered = useMemo(
    () =>
      helpArticles.filter((article) => {
        if (category !== 'all' && article.category !== category) return false
        if (!query) return true
        return `${article.title} ${article.summary} ${article.body}`.toLowerCase().includes(query.toLowerCase())
      }),
    [category, helpArticles, query],
  )

  const selected = filtered.find((article) => article.id === selectedId) ?? filtered[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Learning Center"
        description="Documentation, tutorials, tours, academies, API docs, release notes, and FAQ."
        icon={<BookOpen size={20} />}
        actions={<ContextualHelpIcon label="Learning Center tips" to="/help" />}
      />

      <AdoptionHubNav current="/help" />

      <div className={g.toolbar}>
        <Input aria-label="Search help" placeholder="Search help" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select aria-label="Help category" value={category} onChange={(e) => setCategory(e.target.value as 'all' | HelpCategory)}>
          <option value="all">All categories</option>
          {helpCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.split}>
        <section aria-label="Help articles">
          {filtered.length === 0 ? (
            <EmptyState
              title="No articles match"
              description="Try another category or clear search. Empty-state guidance keeps learners unblocked."
              action={
                <Button size="sm" variant="secondary" onClick={() => { setQuery(''); setCategory('all') }}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className={g.grid}>
              {filtered.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  className={g.card}
                  aria-pressed={selected?.id === article.id}
                  onClick={() => {
                    setSelectedId(article.id)
                    viewHelpArticle(article.id)
                  }}
                >
                  <div className={g.meta}>
                    <Badge variant="neutral">{article.category.replace(/_/g, ' ')}</Badge>
                    {article.durationLabel && <Badge variant="accent">{article.durationLabel}</Badge>}
                  </div>
                  <h3>{article.title}</h3>
                  <p className={g.muted}>{article.summary}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className={g.stack}>
          {selected && (
            <section className={g.panel}>
              <header className={g.row}>
                <h2>{selected.title}</h2>
                <Button size="sm" variant="ghost" onClick={() => toggleHelpBookmark(selected.id)}>
                  {helpBookmarks.includes(selected.id) ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </header>
              <p className={g.muted}>{selected.body}</p>
              {selected.category === 'api' && (
                <Link className={styles.hubLink} to="/developer/api">
                  Open API Explorer
                </Link>
              )}
              {selected.category === 'tours' && (
                <Link className={styles.hubLink} to="/settings/tours">
                  Open Product Tours
                </Link>
              )}
            </section>
          )}
          <section className={g.panel}>
            <h2>Bookmarks</h2>
            <ul className={g.list}>
              {helpBookmarks.length === 0 ? (
                <li className={g.listItem}><span className={g.muted}>No bookmarks yet.</span></li>
              ) : (
                helpBookmarks.map((id) => {
                  const article = helpArticles.find((item) => item.id === id)
                  return (
                    <li key={id} className={g.listItem}>
                      <button type="button" className={styles.hubLink} onClick={() => setSelectedId(id)}>
                        {article?.title ?? id}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
            <h3>Recently viewed</h3>
            <ul className={g.list}>
              {helpRecent.map((id) => {
                const article = helpArticles.find((item) => item.id === id)
                return (
                  <li key={id} className={g.listItem}>
                    <button type="button" className={styles.hubLink} onClick={() => setSelectedId(id)}>
                      {article?.title ?? id}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
