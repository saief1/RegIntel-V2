import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { clsx as cx } from 'clsx'
import { useClickOutside } from '../../../hooks/useClickOutside'
import styles from './Dropdown.module.css'

interface TriggerProps {
  onClick?: (event: React.MouseEvent) => void
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup']
  'aria-expanded'?: boolean
}

interface DropdownProps {
  /** The element that opens the menu on click. Receives injected click/aria props via `cloneElement`. */
  trigger: ReactElement<TriggerProps>
  /** Menu content — either static nodes or a render function receiving a `close` callback. */
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'start' | 'end'
  width?: number
  className?: string
}

/** Generic floating menu: user profile, notifications, help, organization switcher. */
export function Dropdown({ trigger, children, align = 'start', width, className }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = () => setOpen(false)

  useClickOutside(rootRef, close, open)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open || !menuRef.current) return
    const firstItem = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]')
    firstItem?.focus()
  }, [open])

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    if (items.length === 0) return
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)
    const nextIndex =
      event.key === 'ArrowDown'
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length
    items[nextIndex]?.focus()
  }

  const triggerElement = isValidElement<TriggerProps>(trigger)
    ? cloneElement(trigger, {
        onClick: (event: React.MouseEvent) => {
          trigger.props.onClick?.(event)
          setOpen((value) => !value)
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })
    : trigger

  return (
    <div className={cx(styles.root, className)} ref={rootRef}>
      {triggerElement}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cx(styles.menu, styles[align])}
          style={width ? { width } : undefined}
          onKeyDown={onMenuKeyDown}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}
