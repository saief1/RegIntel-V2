import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx as cx } from 'clsx'
import { findNavItemByPath } from '../../../config/navigation'
import { useKnowledge } from '../../../hooks/useKnowledge'
import { useShellLayout } from '../../../hooks/useShellLayout'
import styles from './Breadcrumb.module.css'

interface Crumb {
  label: string
  path?: string
}

function useBreadcrumbTrail(): Crumb[] {
  const location = useLocation()
  const { getDocument, collections } = useKnowledge()
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
