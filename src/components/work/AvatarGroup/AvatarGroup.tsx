import { clsx as cx } from 'clsx'
import type { WorkUser } from '../../../types/work'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import styles from './AvatarGroup.module.css'

interface AvatarGroupProps {
  users: WorkUser[]
  max?: number
  size?: 'sm' | 'md'
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max)
  const overflow = users.length - visible.length

  return (
    <ul className={cx(styles.group, styles[size])} aria-label={`${users.length} people`}>
      {visible.map((user) => (
        <li key={user.id}>
          <Tooltip content={`${user.name} · ${user.role}`} side="top">
            <span className={styles.avatar} aria-label={user.name}>
              {user.initials}
            </span>
          </Tooltip>
        </li>
      ))}
      {overflow > 0 && (
        <li>
          <span className={cx(styles.avatar, styles.overflow)} aria-label={`${overflow} more`}>
            +{overflow}
          </span>
        </li>
      )}
    </ul>
  )
}
