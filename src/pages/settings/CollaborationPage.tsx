import { MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useConnected } from '../../hooks/useConnected'
import { useWork } from '../../hooks/useWork'
import { formatRelativeTime } from '../../utils/date'
import styles from '../connected/connected.module.css'

export function CollaborationPage() {
  const {
    channels,
    announcements,
    dismissAnnouncement,
    watchlist,
    toggleWatch,
    digests,
    toggleDigest,
    mentionFeed,
    globalActivity,
  } = useConnected()
  const { getUser } = useWork()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Notifications & Collaboration"
        description="Team channels, mentions, digests, watchlists, and announcement banners."
        icon={<MessagesSquare size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Connected enterprise areas">
        <Link className={styles.hubLink} to="/settings/integrations">
          Integrations
        </Link>
        <Link className={styles.hubLink} to="/settings">
          Settings
        </Link>
      </nav>

      {announcements.length > 0 && (
        <div className={g.stack} aria-label="Announcement banners">
          {announcements.map((banner) => (
            <div key={banner.id} className={styles.banner} data-tone={banner.tone}>
              <div>
                <strong>{banner.title}</strong>
                <p className={g.muted}>{banner.body}</p>
              </div>
              {banner.dismissible && (
                <Button size="sm" variant="ghost" onClick={() => dismissAnnouncement(banner.id)}>
                  Dismiss
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Real-time notification feed</h2>
          <ul className={g.list}>
            {globalActivity
              .filter((item) => item.source === 'collaboration' || item.source === 'agent')
              .concat(globalActivity.filter((item) => item.source !== 'collaboration' && item.source !== 'agent'))
              .slice(0, 10)
              .map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>{item.detail}</span>
                  </span>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </li>
              ))}
          </ul>
        </section>

        <section className={g.panel}>
          <h2>@Mentions</h2>
          <ul className={g.list}>
            {mentionFeed.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  {item.body}
                  <br />
                  <Link to={item.href} className={styles.hubLink} style={{ marginTop: 8, display: 'inline-flex' }}>
                    Open
                  </Link>
                </span>
                <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
              </li>
            ))}
          </ul>
          <p className={g.muted}>Approval reminders appear here when reviewers are mentioned on policies.</p>
        </section>
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Team channels</h2>
          <ul className={g.list}>
            {channels.map((channel) => (
              <li key={channel.id} className={g.listItem}>
                <span>
                  <strong>{channel.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {channel.description} ·{' '}
                    {channel.memberIds.map((id) => getUser(id)?.name ?? id).join(', ')}
                  </span>
                </span>
                {channel.unread > 0 && <Badge variant="accent">{channel.unread} unread</Badge>}
              </li>
            ))}
          </ul>
        </section>

        <section className={g.panel}>
          <h2>Digest notifications</h2>
          <ul className={g.list}>
            {digests.map((digest) => (
              <li key={digest.id} className={g.listItem}>
                <span>
                  <strong>{digest.label}</strong>
                  <br />
                  <span className={g.muted}>{digest.cadence}</span>
                </span>
                <Button size="sm" variant="secondary" onClick={() => toggleDigest(digest.id)}>
                  {digest.enabled ? 'Disable' : 'Enable'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={g.panel}>
        <h2>Watchlists</h2>
        <p className={g.muted}>Follow policies or regulations to receive change and approval reminders.</p>
        <ul className={g.list}>
          {watchlist.map((item) => (
            <li key={item.id} className={g.listItem}>
              <span>
                <Badge variant="neutral">{item.kind}</Badge>{' '}
                <strong>{item.title}</strong>
              </span>
              <div className={g.toolbar}>
                <Link to={item.href} className={styles.hubLink}>
                  Open
                </Link>
                <Button size="sm" variant="secondary" onClick={() => toggleWatch(item.id)}>
                  {item.following ? 'Unfollow' : 'Follow'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
