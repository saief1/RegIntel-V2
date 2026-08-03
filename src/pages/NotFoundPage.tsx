import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../components/ui/PageContainer/PageContainer'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.wrapper}>
      <PageContainer>
        <EmptyState
          icon={<Compass size={22} />}
          title="Page not found"
          description="The page you're looking for doesn't exist or has moved."
          action={
            <Link to="/" className={styles.link}>
              Go to Home
            </Link>
          }
        />
      </PageContainer>
    </div>
  )
}
