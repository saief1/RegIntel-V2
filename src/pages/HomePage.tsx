import { PageContainer } from '../components/ui/PageContainer/PageContainer'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.hero}>
      <PageContainer>
        <SectionHeader
          size="xl"
          align="center"
          title="Welcome to RegIntel Professional"
          description="Enterprise Regulatory Intelligence Platform"
        />
      </PageContainer>
    </div>
  )
}
