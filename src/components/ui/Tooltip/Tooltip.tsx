import { cloneElement, isValidElement, useId, useState, type ReactElement } from 'react'
import { clsx as cx } from 'clsx'
import styles from './Tooltip.module.css'

interface TooltipChildProps {
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: (event: React.MouseEvent) => void
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
  'aria-describedby'?: string
}

interface TooltipProps {
  content: React.ReactNode
  children: ReactElement<TooltipChildProps>
  side?: 'top' | 'bottom' | 'left' | 'right'
}

/** Hover/focus label for icon-only controls. Attaches via `aria-describedby`, never blocks keyboard focus. */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()

  if (!isValidElement<TooltipChildProps>(children)) return children

  const child = cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent) => {
      children.props.onMouseEnter?.(event)
      setVisible(true)
    },
    onMouseLeave: (event: React.MouseEvent) => {
      children.props.onMouseLeave?.(event)
      setVisible(false)
    },
    onFocus: (event: React.FocusEvent) => {
      children.props.onFocus?.(event)
      setVisible(true)
    },
    onBlur: (event: React.FocusEvent) => {
      children.props.onBlur?.(event)
      setVisible(false)
    },
    'aria-describedby': visible ? tooltipId : undefined,
  })

  return (
    <span className={styles.wrapper}>
      {child}
      {visible && (
        <span role="tooltip" id={tooltipId} className={cx(styles.tooltip, styles[side])}>
          {content}
        </span>
      )}
    </span>
  )
}
