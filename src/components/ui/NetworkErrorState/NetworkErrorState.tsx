import { WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'

interface NetworkErrorStateProps {
  title?: string
  description?: string
  /** Primary recover action (e.g. retry fetch). */
  onRetry?: () => void
  retryLabel?: string
  /** Optional secondary action (e.g. open docs). */
  secondaryAction?: ReactNode
}

/**
 * Reusable offline / network-failure placeholder for future API integration.
 * Composes EmptyState so loading/empty/error surfaces share one visual pattern.
 */
export function NetworkErrorState({
  title = 'Connection unavailable',
  description = 'RegIntel could not reach the network. Check your connection and try again.',
  onRetry,
  retryLabel = 'Retry',
  secondaryAction,
}: NetworkErrorStateProps) {
  return (
    <EmptyState
      icon={<WifiOff size={22} aria-hidden="true" />}
      title={title}
      description={description}
      action={
        onRetry || secondaryAction ? (
          <>
            {onRetry ? (
              <Button variant="primary" size="sm" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null}
            {secondaryAction}
          </>
        ) : undefined
      }
    />
  )
}
