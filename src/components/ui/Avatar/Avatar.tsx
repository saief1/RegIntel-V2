import { User } from 'lucide-react'
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
      {name ? getInitials(name) : <User size={16} />}
    </div>
  )
}
