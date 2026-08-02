import styles from './Divider.module.css'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <hr
      className={[styles.divider, styles[orientation], className].filter(Boolean).join(' ')}
      aria-orientation={orientation}
    />
  )
}
