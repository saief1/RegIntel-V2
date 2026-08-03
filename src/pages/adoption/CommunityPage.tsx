import { useMemo, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { ContextualHelpIcon } from '../../components/adoption/ContextualHelpIcon'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useAdoption } from '../../hooks/useAdoption'
import { formatRelativeTime } from '../../utils/date'
import { AdoptionHubNav } from './AdoptionHubNav'
import styles from './adoption.module.css'

type CommunityFilter =
  | 'all'
  | 'feature_request'
  | 'feedback'
  | 'discussion'
  | 'roadmap'
  | 'known_issue'
  | 'highlight'

export function CommunityPage() {
  const {
    communityPosts,
    votePost,
    toggleBookmarkPost,
    toggleFollowPost,
    submitFeedback,
    whatsNew,
    reopenWhatsNew,
  } = useAdoption()
  const [filter, setFilter] = useState<CommunityFilter>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')

  const filtered = useMemo(
    () => communityPosts.filter((post) => (filter === 'all' ? true : post.kind === filter)),
    [communityPosts, filter],
  )

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Feedback & Community"
        description="Feature requests, feedback, discussions, public roadmap, known issues, and release highlights."
        icon={<MessagesSquare size={20} />}
        actions={<ContextualHelpIcon label="Community help" to="/help" />}
      />

      <AdoptionHubNav current="/community" />

      <div className={g.tabs} role="tablist" aria-label="Community sections">
        {(
          [
            ['all', 'All'],
            ['feature_request', 'Feature Requests'],
            ['feedback', 'Product Feedback'],
            ['discussion', 'Discussions'],
            ['roadmap', 'Roadmap'],
            ['known_issue', 'Known Issues'],
            ['highlight', 'Release Highlights'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={filter === id ? g.tabActive : g.tab}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.split}>
        <section aria-label="Community posts">
          <div className={g.toolbar}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(communityPosts, null, 2)],
                  { type: 'application/json' },
                )
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'regintel-feedback-export.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Export feedback
            </Button>
          </div>
          <div className={g.grid}>
            {filtered.map((post) => (
              <article key={post.id} className={g.card} style={{ cursor: 'default' }}>
                <div className={g.meta}>
                  <Badge variant="neutral">{post.kind.replace(/_/g, ' ')}</Badge>
                  {post.status && <Badge variant="accent">{post.status}</Badge>}
                </div>
                <h3>{post.title}</h3>
                <p className={g.muted}>{post.body}</p>
                <p className={g.muted}>{formatRelativeTime(post.updatedAt)}</p>
                <div className={g.toolbar}>
                  <Button size="sm" variant="secondary" onClick={() => votePost(post.id)}>
                    Vote · {post.votes}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleBookmarkPost(post.id)}>
                    {post.bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleFollowPost(post.id)}>
                    {post.following ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {(filter === 'all' || filter === 'highlight') && (
            <section className={g.panel} style={{ marginTop: 16 }}>
              <h2>Changelog / release highlights</h2>
              <div className={g.toolbar}>
                <Button size="sm" variant="secondary" onClick={() => reopenWhatsNew()}>
                  Open What&apos;s New modal
                </Button>
              </div>
              <ul className={g.list}>
                {whatsNew.map((entry) => (
                  <li key={entry.id} className={g.listItem}>
                    <span>
                      <Badge variant="accent">{entry.version}</Badge> <strong>{entry.title}</strong>
                      <br />
                      <span className={g.muted}>{entry.summary}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <aside className={g.panel}>
          <h2>Submit feedback</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <label>
              Title
              <Input aria-label="Feedback title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Details
              <Textarea aria-label="Feedback body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            </label>
            <Button
              variant="primary"
              disabled={!title.trim() || !body.trim()}
              onClick={() => {
                submitFeedback(title, body)
                setTitle('')
                setBody('')
                setMessage('Feedback submitted.')
              }}
            >
              Submit feedback
            </Button>
            {message && <p className={g.muted} role="status">{message}</p>}
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
