import type { CSSProperties } from 'react'
import { clsx as cx } from 'clsx'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: 'sm' | 'md' | 'lg' | 'pill'
  className?: string
}

/** Loading placeholder for content that hasn't resolved yet. Purely decorative — always `aria-hidden`. */
export function Skeleton({ width, height = '1em', radius = 'sm', className }: SkeletonProps) {
  const style: CSSProperties = { width, height }
  return <span aria-hidden="true" className={cx(styles.skeleton, styles[radius], className)} style={style} />
}
