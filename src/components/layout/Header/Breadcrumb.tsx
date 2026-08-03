import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx as cx } from 'clsx'
import { findNavItemByPath } from '../../../config/navigation'
import { useKnowledge } from '../../../hooks/useKnowledge'
import { useInvestigations } from '../../../hooks/useInvestigations'
import { useShellLayout } from '../../../hooks/useShellLayout'
import { useWork } from '../../../hooks/useWork'
import styles from './Breadcrumb.module.css'

interface Crumb {
  label: string
  path?: string
}

function useBreadcrumbTrail(): Crumb[] {
  const location = useLocation()
  const { getDocument, collections } = useKnowledge()
  const { getCase } = useWork()
  const { getInvestigation, getChange } = useInvestigations()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments[0] === 'knowledge') {
    const trail: Crumb[] = [{ label: 'Knowledge', path: '/knowledge' }]

    if (segments[1] === 'library') {
      trail.push({ label: 'Library', path: '/knowledge/library' })
      if (segments[2]) {
        const document = getDocument(segments[2])
        trail.push({ label: document?.title ?? 'Document' })
      }
    } else if (segments[1] === 'collections') {
      trail.push({ label: 'Collections', path: '/knowledge/collections' })
      if (segments[2]) {
        const collection = collections.find((candidate) => candidate.id === segments[2])
        trail.push({ label: collection?.name ?? 'Collection' })
      }
    }

    return trail
  }

  if (segments[0] === 'work') {
    const trail: Crumb[] = [{ label: 'Work', path: '/work' }]
    if (segments[1] === 'cases') {
      trail.push({ label: 'Cases', path: '/work/cases' })
      if (segments[2]) {
        const workCase = getCase(segments[2])
        trail.push({ label: workCase?.caseNumber ?? 'Case' })
      }
    }
    return trail
  }

  if (segments[0] === 'ai') {
    const trail: Crumb[] = [{ label: 'AI Workspace', path: '/ai' }]
    if (segments[1] === 'prompts') trail.push({ label: 'Prompt library' })
    if (segments[1] === 'memory') trail.push({ label: 'Memory' })
    return trail
  }

  if (segments[0] === 'investigations') {
    const trail: Crumb[] = [{ label: 'Investigations', path: '/investigations' }]
    if (segments[1]) {
      const investigation = getInvestigation(segments[1])
      trail.push({ label: investigation?.caseId ?? 'Investigation' })
    }
    return trail
  }

  if (segments[0] === 'regulatory-changes') {
    const trail: Crumb[] = [{ label: 'Regulatory Changes', path: '/regulatory-changes' }]
    if (segments[1]) {
      const change = getChange(segments[1])
      trail.push({ label: change?.title ?? 'Change' })
    }
    return trail
  }

  const navItem = findNavItemByPath(location.pathname)
  if (!navItem || navItem.path === '/') return [{ label: 'Home' }]
  return [{ label: navItem.label }]
}

export function Breadcrumb() {
  const location = useLocation()
  const { isMobile } = useShellLayout()
  const trail = useBreadcrumbTrail()
  const isHome = location.pathname === '/'

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      {(!isMobile || isHome) && (
        <span className={isHome ? styles.current : styles.workspace} aria-current={isHome ? 'page' : undefined}>
          RegIntel Professional
        </span>
      )}
      {!isHome &&
        (isMobile ? (
          <span className={styles.current} aria-current="page">
            {trail[trail.length - 1]?.label}
          </span>
        ) : (
          trail.map((crumb, index) => {
            const isLast = index === trail.length - 1
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
                {crumb.path && !isLast ? (
                  <Link to={crumb.path} className={cx(styles.workspace, styles.link)}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            )
          })
        ))}
    </nav>
  )
}
