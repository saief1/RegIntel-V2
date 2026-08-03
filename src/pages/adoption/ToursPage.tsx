import { Route } from 'lucide-react'
import { ContextualHelpIcon } from '../../components/adoption/ContextualHelpIcon'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useAdoption } from '../../hooks/useAdoption'
import { AdoptionHubNav } from './AdoptionHubNav'
import styles from './adoption.module.css'

export function ToursPage() {
  const { tours, completedTours, activeTourId, startTour, completeTour, restartTour } = useAdoption()
  const active = tours.find((tour) => tour.id === activeTourId)
  const recommended = tours.filter((tour) => tour.recommended && !completedTours.includes(tour.id))

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Product Tours & Walkthroughs"
        description="First-login and area tours with restart, completion tracking, and mock coach marks."
        icon={<Route size={20} />}
        actions={<ContextualHelpIcon label="Tours help" to="/help" />}
      />

      <AdoptionHubNav current="/settings/tours" />

      {recommended.length > 0 && (
        <section className={g.panel}>
          <h2>Recommended tours</h2>
          <div className={g.toolbar}>
            {recommended.map((tour) => (
              <Button key={tour.id} size="sm" variant="primary" onClick={() => startTour(tour.id)}>
                {tour.title}
              </Button>
            ))}
          </div>
        </section>
      )}

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>All tours</h2>
          <div className={g.grid}>
            {tours.map((tour) => {
              const done = completedTours.includes(tour.id)
              return (
                <article key={tour.id} className={g.card} style={{ cursor: 'default' }}>
                  <div className={g.meta}>
                    <Badge variant={done ? 'success' : 'neutral'}>{done ? 'completed' : 'available'}</Badge>
                    {tour.recommended && <Badge variant="accent">recommended</Badge>}
                    <Badge variant="neutral">{tour.steps} steps</Badge>
                  </div>
                  <h3>{tour.title}</h3>
                  <p className={g.muted}>{tour.description}</p>
                  <div className={g.toolbar}>
                    <Button size="sm" variant="secondary" onClick={() => startTour(tour.id)}>
                      {done ? 'Replay' : 'Start'}
                    </Button>
                    {done && (
                      <Button size="sm" variant="ghost" onClick={() => restartTour(tour.id)}>
                        Restart tour
                      </Button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Active tour / coach marks</h2>
            {active ? (
              <>
                <p>
                  <strong>{active.title}</strong>
                </p>
                <p className={g.muted}>Contextual help coach marks (mock).</p>
                <div className={styles.coachList} role="list">
                  {active.coachMarks.map((mark) => (
                    <span key={mark} className={styles.coachMark} role="listitem">
                      {mark}
                    </span>
                  ))}
                </div>
                <div className={g.toolbar}>
                  <Button size="sm" variant="primary" onClick={() => completeTour(active.id)}>
                    Mark complete
                  </Button>
                </div>
              </>
            ) : (
              <p className={g.muted}>Start a tour to preview coach marks.</p>
            )}
          </section>
          <section className={g.panel}>
            <h2>Completed tours</h2>
            {completedTours.length === 0 ? (
              <p className={g.muted}>No tours completed yet.</p>
            ) : (
              <ul className={g.list}>
                {completedTours.map((id) => {
                  const tour = tours.find((item) => item.id === id)
                  return (
                    <li key={id} className={g.listItem}>
                      <span>{tour?.title ?? id}</span>
                      <Badge variant="success">done</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
