import type { LucideIcon } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../components/ui/PageHeader/PageHeader'
import { EmptyState } from '../components/ui/EmptyState/EmptyState'
import styles from './ComingSoonPage.module.css'

interface ComingSoonPageProps {
  title: string
  description: string
  icon: LucideIcon
}

/**
 * Shared page shell for every navigation destination that doesn't have
 * feature content yet. Renders an honest "coming soon" state rather than
 * fabricated data or business logic.
 */
export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} icon={<Icon size={20} />} />
      <div className={styles.body}>
        <EmptyState icon={<Icon size={22} />} title={`${title} is coming soon.`} description="This area of the workspace is being built next." />
      </div>
    </PageContainer>
  )
}
