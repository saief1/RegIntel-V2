import { clsx as cx } from 'clsx'
import type { DocumentSection } from '../../../types/knowledge'
import styles from './StickyTOC.module.css'

interface StickyTOCProps {
  sections: DocumentSection[]
  activeId: string | null
  onSelect: (id: string) => void
  className?: string
}

/** Sticky in-page navigation for the Document Viewer's table of contents. */
export function StickyTOC({ sections, activeId, onSelect, className }: StickyTOCProps) {
  return (
    <nav className={cx(styles.toc, className)} aria-label="Table of contents">
      <span className={styles.heading}>On this page</span>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={cx(
                styles.link,
                section.level === 2 && styles.linkNested,
                section.id === activeId && styles.linkActive,
              )}
              aria-current={section.id === activeId ? 'true' : undefined}
              onClick={() => onSelect(section.id)}
            >
              {section.heading}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
