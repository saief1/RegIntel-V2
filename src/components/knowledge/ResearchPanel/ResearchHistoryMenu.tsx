import { History, Plus, Trash2 } from 'lucide-react'
import { clsx as cx } from 'clsx'
import { useKnowledge } from '../../../hooks/useKnowledge'
import { formatRelativeTime } from '../../../utils/date'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel, DropdownSeparator } from '../../ui/Dropdown/DropdownItem'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './ResearchPanel.module.css'

/** Research history menu: switch between prior threads, start a new one, or delete a thread. */
export function ResearchHistoryMenu() {
  const { researchThreads, activeThreadId, setActiveThreadId, createThread, deleteThread } = useKnowledge()

  return (
    <Dropdown
      align="end"
      width={280}
      trigger={
        <IconButton label="Research history" aria-haspopup="menu">
          <History size={16} />
        </IconButton>
      }
    >
      {(close) => (
        <>
          <DropdownItem
            icon={<Plus size={14} />}
            onClick={() => {
              close()
              createThread()
            }}
          >
            New thread
          </DropdownItem>
          {researchThreads.length > 0 && (
            <>
              <DropdownSeparator />
              <DropdownLabel>Research history</DropdownLabel>
              <div className={styles.historyList}>
                {researchThreads.map((thread) => (
                  <div key={thread.id} className={styles.historyRow}>
                    <button
                      type="button"
                      role="menuitem"
                      className={cx(styles.historyItem, thread.id === activeThreadId && styles.historyItemActive)}
                      onClick={() => {
                        close()
                        setActiveThreadId(thread.id)
                      }}
                    >
                      <span className={styles.historyTitle}>{thread.title}</span>
                      <span className={styles.historyTime}>{formatRelativeTime(thread.updatedAt)}</span>
                    </button>
                    <button
                      type="button"
                      className={styles.historyDelete}
                      aria-label={`Delete thread: ${thread.title}`}
                      onClick={() => deleteThread(thread.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Dropdown>
  )
}
