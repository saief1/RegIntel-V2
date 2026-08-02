import { UserIcon } from '../../icons'
import styles from './Avatar.module.css'

interface AvatarProps {
  name?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return initials.join('')
}

export function Avatar({ name }: AvatarProps) {
  return (
    <div className={styles.avatar}>
      {name ? getInitials(name) : <UserIcon width={16} height={16} />}
    </div>
  )
}
