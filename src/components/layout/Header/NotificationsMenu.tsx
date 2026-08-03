import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useConnected } from '../../../hooks/useConnected'
import { useInvestigations } from '../../../hooks/useInvestigations'
import { useWork } from '../../../hooks/useWork'
import { formatRelativeTime } from '../../../utils/date'
import { Button } from '../../ui/Button/Button'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './NotificationsMenu.module.css'

interface UnifiedNotification {
  id: string
  source: 'work' | 'investigations' | 'collaboration'
  title: string
  body: string
  href?: string
  read: boolean
  createdAt: string
  group: string
}

export function NotificationsMenu() {
  const navigate = useNavigate()
  const work = useWork()
  const investigations = useInvestigations()
  const connected = useConnected()

  const notifications = useMemo<UnifiedNotification[]>(() => {
    const workItems: UnifiedNotification[] = work.notifications.map((item) => ({
      id: `work-${item.id}`,
      source: 'work',
      title: item.title,
      body: item.body,
      href:
        item.href ??
        (item.taskId ? `/work/tasks/${item.taskId}` : item.caseId ? `/work/cases/${item.caseId}` : undefined),
      read: item.read,
      createdAt: item.createdAt,
      group: item.group,
    }))
    const investigationItems: UnifiedNotification[] = investigations.notifications.map((item) => ({
      id: `inv-${item.id}`,
      source: 'investigations',
      title: item.title,
      body: item.body,
      href: item.href,
      read: item.read,
      createdAt: item.createdAt,
      group: item.group,
    }))
    const mentionItems: UnifiedNotification[] = connected.mentionFeed.map((item) => ({
      id: `mention-${item.id}`,
      source: 'collaboration',
      title: '@Mention',
      body: item.body,
      href: item.href,
      read: false,
      createdAt: item.at,
      group: 'Mentions',
    }))
    const digestItems: UnifiedNotification[] = connected.digests
      .filter((item) => item.enabled)
      .map((item) => ({
        id: `digest-${item.id}`,
        source: 'collaboration' as const,
        title: 'Digest',
        body: `${item.label} · ${item.cadence}`,
        href: '/settings/collaboration',
        read: true,
        createdAt: new Date().toISOString(),
        group: 'Digests',
      }))
    const approvalReminders: UnifiedNotification[] = connected.watchlist
      .filter((item) => item.following)
      .slice(0, 2)
      .map((item) => ({
        id: `watch-${item.id}`,
        source: 'collaboration' as const,
        title: 'Approval reminder',
        body: `Following ${item.title}`,
        href: item.href,
        read: false,
        createdAt: new Date().toISOString(),
        group: 'Watchlists',
      }))

    return [...workItems, ...investigationItems, ...mentionItems, ...digestItems, ...approvalReminders].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    )
  }, [
    connected.digests,
    connected.mentionFeed,
    connected.watchlist,
    investigations.notifications,
    work.notifications,
  ])

  const unreadNotificationCount =
    work.unreadNotificationCount +
    investigations.unreadNotificationCount +
    notifications.filter((item) => item.source === 'collaboration' && !item.read).length

  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, UnifiedNotification[]>()
    for (const item of notifications) {
      if (!map.has(item.group)) {
        map.set(item.group, [])
        order.push(item.group)
      }
      map.get(item.group)!.push(item)
    }
    return order.map((label) => ({ label, items: map.get(label)! }))
  }, [notifications])

  function markRead(item: UnifiedNotification) {
    if (item.source === 'work') work.markNotificationRead(item.id.replace(/^work-/, ''))
    else if (item.source === 'investigations') investigations.markNotificationRead(item.id.replace(/^inv-/, ''))
  }

  function dismiss(item: UnifiedNotification) {
    if (item.source === 'work') work.dismissNotification(item.id.replace(/^work-/, ''))
    else if (item.source === 'investigations') investigations.dismissNotification(item.id.replace(/^inv-/, ''))
  }

  function markAllRead() {
    work.markAllNotificationsRead()
    investigations.markAllNotificationsRead()
  }

  function clearAll() {
    work.clearAllNotifications()
    investigations.clearAllNotifications()
  }

  return (
    <Dropdown
      align="end"
      width={360}
      trigger={
        <span className={styles.triggerWrap}>
          <IconButton label="Notifications" aria-haspopup="menu">
            <Bell size={18} />
          </IconButton>
          {unreadNotificationCount > 0 && (
            <span className={styles.badge} aria-label={`${unreadNotificationCount} unread`}>
              {unreadNotificationCount}
            </span>
          )}
        </span>
      }
    >
      {(close) => (
        <div className={styles.panel}>
          <header className={styles.header}>
            <p className={styles.title}>Notifications</p>
            <div className={styles.headerActions}>
              <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadNotificationCount === 0}>
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
                Clear all
              </Button>
            </div>
          </header>

          {connected.announcements[0] && (
            <div className={styles.group} style={{ padding: '0 12px 8px' }}>
              <p className={styles.itemTitle}>{connected.announcements[0].title}</p>
              <p className={styles.itemBody}>{connected.announcements[0].body}</p>
              <Link
                to="/settings/collaboration"
                className={styles.itemBody}
                onClick={close}
                style={{ display: 'inline-block', marginTop: 4, color: 'var(--ri-color-accent)' }}
              >
                Collaboration center
              </Link>
            </div>
          )}

          {notifications.length === 0 ? (
            <p className={styles.empty}>You're all caught up. No notifications.</p>
          ) : (
            <div className={styles.groups}>
              {groups.map((group) => (
                <section key={group.label} className={styles.group} aria-label={group.label}>
                  <h3 className={styles.groupLabel}>{group.label}</h3>
                  <ul className={styles.list}>
                    {group.items.map((item) => (
                      <li key={item.id} className={styles.item} data-unread={!item.read || undefined}>
                        <button
                          type="button"
                          className={styles.itemButton}
                          onClick={() => {
                            markRead(item)
                            close()
                            if (item.href) navigate(item.href)
                          }}
                        >
                          <span className={styles.itemTitle}>{item.title}</span>
                          <span className={styles.itemBody}>{item.body}</span>
                          <time className={styles.itemTime} dateTime={item.createdAt}>
                            {formatRelativeTime(item.createdAt)}
                          </time>
                        </button>
                        {item.source !== 'collaboration' && (
                          <button
                            type="button"
                            className={styles.dismiss}
                            aria-label={`Dismiss ${item.title}`}
                            onClick={() => dismiss(item)}
                          >
                            Dismiss
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </Dropdown>
  )
}
