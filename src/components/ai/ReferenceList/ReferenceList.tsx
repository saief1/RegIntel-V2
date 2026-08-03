import type { AiCitation } from '../../../types/ai'
import { CitationCard } from '../CitationCard/CitationCard'
import styles from './ReferenceList.module.css'

interface ReferenceListProps {
  title: string
  items: AiCitation[]
  emptyLabel?: string
}

export function ReferenceList({ title, items, emptyLabel = 'None yet' }: ReferenceListProps) {
  return (
    <section className={styles.section} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <CitationCard citation={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
