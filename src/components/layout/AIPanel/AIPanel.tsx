import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { clsx as cx } from 'clsx'
import { Sparkles, X } from 'lucide-react'
import { useShellLayout } from '../../../hooks/useShellLayout'
import { useResizablePanel } from '../../../hooks/useResizablePanel'
import { ResearchHistoryMenu } from '../../knowledge/ResearchPanel/ResearchHistoryMenu'
import { ResearchPanel } from '../../knowledge/ResearchPanel/ResearchPanel'
import { WorkAssistant } from '../../work/WorkAssistant/WorkAssistant'
import { IconButton } from '../../ui/IconButton/IconButton'
import { Panel } from '../../ui/Panel/Panel'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import styles from './AIPanel.module.css'

/** Brief, honest loading transition shown once while the panel mounts — not tied to any backend. */
const INITIAL_LOAD_MS = 550

export function AIPanel() {
  const location = useLocation()
  const { isTablet, isAIPanelOpen, toggleAIPanel } = useShellLayout()
  const [loading, setLoading] = useState(true)
  const { width, onPointerDown } = useResizablePanel({
    initialWidth: 380,
    minWidth: 320,
    maxWidth: 560,
    edge: 'left',
  })

  const isWorkWorkspace = location.pathname.startsWith('/work')
  const title = isWorkWorkspace ? 'AI Assistant' : 'AI Research'
  const ariaLabel = isWorkWorkspace ? 'AI Assistant' : 'AI Research'

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
          title={title}
          icon={<Sparkles size={18} />}
          role="complementary"
          aria-label={ariaLabel}
          actions={
            <>
              {!isWorkWorkspace && <ResearchHistoryMenu />}
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
          ) : isWorkWorkspace ? (
            <WorkAssistant />
          ) : (
            <ResearchPanel />
          )}
        </Panel>
      </div>
    </>
  )
}
