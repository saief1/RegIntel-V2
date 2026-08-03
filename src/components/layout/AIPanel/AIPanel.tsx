import { useEffect, useState } from 'react'
import { clsx as cx } from 'clsx'
import { Sparkles, X } from 'lucide-react'
import { useShellLayout } from '../../../hooks/useShellLayout'
import { useResizablePanel } from '../../../hooks/useResizablePanel'
import { ResearchHistoryMenu } from '../../knowledge/ResearchPanel/ResearchHistoryMenu'
import { ResearchPanel } from '../../knowledge/ResearchPanel/ResearchPanel'
import { IconButton } from '../../ui/IconButton/IconButton'
import { Panel } from '../../ui/Panel/Panel'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import styles from './AIPanel.module.css'

/** Brief, honest loading transition shown once while the panel mounts — not tied to any backend. */
const INITIAL_LOAD_MS = 550

export function AIPanel() {
  const { isTablet, isAIPanelOpen, toggleAIPanel } = useShellLayout()
  const [loading, setLoading] = useState(true)
  const { width, onPointerDown } = useResizablePanel({
    initialWidth: 380,
    minWidth: 320,
    maxWidth: 560,
    edge: 'left',
  })

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), INITIAL_LOAD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!isAIPanelOpen) return null

  return (
    <>
      {isTablet && <div className={styles.backdrop} onClick={toggleAIPanel} aria-hidden="true" />}
      <div className={cx(styles.wrapper, isTablet && styles.overlay)} style={isTablet ? undefined : { width }}>
        {!isTablet && (
          <div
            className={styles.resizeHandle}
            onPointerDown={onPointerDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize AI panel"
          />
        )}

        <Panel
          variant="flush"
          className={styles.panel}
          headerClassName={styles.header}
          bodyClassName={styles.body}
          title="AI Research"
          icon={<Sparkles size={18} />}
          role="complementary"
          aria-label="AI Research"
          actions={
            <>
              <ResearchHistoryMenu />
              <IconButton label="Close AI panel" onClick={toggleAIPanel}>
                <X size={16} />
              </IconButton>
            </>
          }
        >
          {loading ? (
            <div className={styles.loading}>
              <Skeleton height={72} radius="lg" />
              <Skeleton height={14} width="70%" />
              <Skeleton height={14} width="45%" />
            </div>
          ) : (
            <ResearchPanel />
          )}
        </Panel>
      </div>
    </>
  )
}
