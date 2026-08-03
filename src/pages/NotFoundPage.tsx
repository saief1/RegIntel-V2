import { Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button/Button'
import { EmptyState } from '../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../components/ui/PageContainer/PageContainer'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.wrapper}>
      <PageContainer>
        <EmptyState
          icon={<Compass size={22} />}
          title="Page not found"
          description="The page you're looking for doesn't exist or has moved."
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          }
        />
      </PageContainer>
    </div>
  )
}
