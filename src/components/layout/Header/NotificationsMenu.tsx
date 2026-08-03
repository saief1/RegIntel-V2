import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useWork } from '../../../hooks/useWork'
import { formatRelativeTime } from '../../../utils/date'
import { Button } from '../../ui/Button/Button'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './NotificationsMenu.module.css'

export function NotificationsMenu() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    clearAllNotifications,
  } = useWork()

  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, typeof notifications>()
    for (const item of notifications) {
      if (!map.has(item.group)) {
        map.set(item.group, [])
        order.push(item.group)
      }
      map.get(item.group)!.push(item)
    }
    return order.map((label) => ({ label, items: map.get(label)! }))
  }, [notifications])

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllNotificationsRead()}
                disabled={unreadNotificationCount === 0}
              >
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={() => clearAllNotifications()} disabled={notifications.length === 0}>
                Clear all
              </Button>
            </div>
          </header>

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
                            markNotificationRead(item.id)
                            close()
                            if (item.caseId) navigate(`/work/cases/${item.caseId}`)
                          }}
                        >
                          <span className={styles.itemTitle}>{item.title}</span>
                          <span className={styles.itemBody}>{item.body}</span>
                          <time className={styles.itemTime} dateTime={item.createdAt}>
                            {formatRelativeTime(item.createdAt)}
                          </time>
                        </button>
                        <button
                          type="button"
                          className={styles.dismiss}
                          aria-label={`Dismiss ${item.title}`}
                          onClick={() => dismissNotification(item.id)}
                        >
                          Dismiss
                        </button>
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
