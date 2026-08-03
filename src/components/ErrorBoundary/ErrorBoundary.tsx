import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button/Button'
import { EmptyState } from '../ui/EmptyState/EmptyState'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional callback when the user chooses Recover. Defaults to a full reload. */
  onRecover?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Global React error boundary — catches render failures and shows a
 * consistent recovery UI. Does not invent backend diagnostics; this is a
 * frontend platform safety net for GA.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  private handleRecover = () => {
    if (this.props.onRecover) {
      this.props.onRecover()
      this.setState({ hasError: false, error: null })
      return
    }
    window.location.assign('/')
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className={styles.root} role="alert" aria-live="assertive">
        <EmptyState
          icon={<AlertTriangle size={22} aria-hidden="true" />}
          title="Something went wrong"
          description="An unexpected error stopped this view. You can try again or return to Home."
          action={
            <div className={styles.actions}>
              <Button variant="secondary" onClick={this.handleRetry}>
                Try again
              </Button>
              <Button variant="primary" onClick={this.handleRecover}>
                Go to Home
              </Button>
            </div>
          }
        />
      </div>
    )
  }
}
