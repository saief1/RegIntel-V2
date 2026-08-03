import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SectionHeader } from '../../components/ui/SectionHeader/SectionHeader'
import styles from './KnowledgeHomePage.module.css'

interface KnowledgeHomeSectionProps {
  title: string
  description?: string
  seeAllHref?: string
  seeAllLabel?: string
  children: ReactNode
}

/** Section shell for a Knowledge Home row: heading, optional "see all" link, and content/empty-state slot. */
export function KnowledgeHomeSection({
  title,
  description,
  seeAllHref,
  seeAllLabel = 'See all',
  children,
}: KnowledgeHomeSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={`${title}-heading`}>
      <SectionHeader
        as="h2"
        size="lg"
        title={<span id={`${title}-heading`}>{title}</span>}
        description={description}
        actions={
          seeAllHref && (
            <Link to={seeAllHref} className={styles.seeAll}>
              {seeAllLabel}
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          )
        }
      />
      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}
