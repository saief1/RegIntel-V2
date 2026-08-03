import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileSearch, GitCompare, PenLine, Search } from 'lucide-react'
import styles from './AiModePanels.module.css'

/** Local mock mode panels for Research, Document Analysis, Compare, and Drafting. */

export function ResearchModePanel() {
  const navigate = useNavigate()
  return (
    <div className={styles.mode}>
      <header className={styles.modeHeader}>
        <Search size={18} aria-hidden="true" />
        <div>
          <h2>Research</h2>
          <p>Evidence-backed answers with confidence, impact, and sources.</p>
        </div>
      </header>
      <article className={styles.report}>
        <h3>Executive summary</h3>
        <p>
          Cross-border transfer updates materially affect Q3 renewals. Residual risk remains until TOM schedules are
          attached and counsel confirms annex language.
        </p>
        <h3>Key findings</h3>
        <ul>
          <li>Clause revisions apply to subprocessors and renewal packs.</li>
          <li>Documentation retention expectations increased.</li>
          <li>Open investigation INV-2026-014 tracks residual exposure.</li>
        </ul>
        <h3>Business impact</h3>
        <div className={styles.impactRow}>
          <div className={styles.impactCard} data-tone="high">
            <strong>High</strong>
            <span>Process updates required before signature</span>
          </div>
          <div className={styles.impactCard} data-tone="medium">
            <strong>Resource</strong>
            <span>Counsel + procurement review cycle</span>
          </div>
          <div className={styles.impactCard} data-tone="low">
            <strong>Timeline</strong>
            <span>60–90 day remediation window</span>
          </div>
        </div>
        <button type="button" className={styles.link} onClick={() => navigate('/knowledge/library/d-01')}>
          View primary regulation <ArrowRight size={14} />
        </button>
      </article>
    </div>
  )
}

export function DocumentAnalysisModePanel() {
  return (
    <div className={styles.mode}>
      <header className={styles.modeHeader}>
        <FileSearch size={18} aria-hidden="true" />
        <div>
          <h2>Document Analysis</h2>
          <p>Highlights, gaps, and referenced regulations for uploaded policies.</p>
        </div>
      </header>
      <div className={styles.split}>
        <section className={styles.docPane}>
          <h3>Cybersecurity Policy v3.2</h3>
          <p>
            <mark data-kind="gap">5.1 Reporting</mark> — Incident notification requirements should specify internal
            escalation windows.
          </p>
          <p>
            <mark data-kind="risk">5.3 Retention</mark> — Data retention period is not defined for investigation
            records.
          </p>
          <p>
            <mark data-kind="ok">6.2 Access</mark> — Access reviews align with current control expectations.
          </p>
        </section>
        <section className={styles.analysisPane}>
          <div className={styles.metrics}>
            <div>
              <strong>82%</strong>
              <span>Coverage</span>
            </div>
            <div>
              <strong>6</strong>
              <span>Gaps</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Risks</span>
            </div>
          </div>
          <h3>Key findings</h3>
          <ul>
            <li>Missing data retention period</li>
            <li>Incident reporting window needs clarification</li>
            <li>Vendor due diligence clause outdated</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export function CompareModePanel() {
  return (
    <div className={styles.mode}>
      <header className={styles.modeHeader}>
        <GitCompare size={18} aria-hidden="true" />
        <div>
          <h2>Compare</h2>
          <p>Side-by-side regulatory differences with alignment score.</p>
        </div>
      </header>
      <div className={styles.compareMeta}>
        <span>CSA Notice 31-360</span>
        <span>vs</span>
        <span>NIST CSF 2.0</span>
        <span className={styles.score}>68% aligned</span>
      </div>
      <div className={styles.split}>
        <section className={styles.docPane}>
          <h3>Incident reporting</h3>
          <p>
            Notify within <mark data-kind="risk">24 hours</mark> of confirmation.
          </p>
        </section>
        <section className={styles.docPane}>
          <h3>Respond (RS)</h3>
          <p>
            Communicate according to <mark data-kind="ok">organizational policy</mark> and legal requirements.
          </p>
        </section>
      </div>
      <ul className={styles.diffList}>
        <li>
          <span className={styles.diffTag}>Difference</span> Notification timeline
        </li>
        <li>
          <span className={styles.partialTag}>Partial</span> Access management expectations
        </li>
        <li>
          <span className={styles.matchTag}>Match</span> Governance accountability
        </li>
      </ul>
    </div>
  )
}

export function DraftingModePanel() {
  return (
    <div className={styles.mode}>
      <header className={styles.modeHeader}>
        <PenLine size={18} aria-hidden="true" />
        <div>
          <h2>Drafting</h2>
          <p>Minimal editor with AI clause suggestions and alignment checks.</p>
        </div>
      </header>
      <div className={styles.split}>
        <section className={styles.editor}>
          <h3>Third-Party Risk Policy · v1.0</h3>
          <p>
            1. Purpose — This policy establishes requirements for assessing and monitoring third-party risk across the
            enterprise.
          </p>
          <p>
            2. Scope — Applies to vendors, subprocessors, and service providers with access to confidential data.
          </p>
          <aside className={styles.suggestion}>
            Consider adding a requirement for ongoing cybersecurity certification.
            <div className={styles.suggestionActions}>
              <button type="button">Apply</button>
              <button type="button">Dismiss</button>
            </div>
          </aside>
        </section>
        <section className={styles.analysisPane}>
          <h3>Compliance alignment</h3>
          <p className={styles.bigStat}>82%</p>
          <ul>
            <li>CSA Notice 31-360 · 90%</li>
            <li>NIST CSF 2.0 · 78%</li>
            <li>ISO/IEC 27001 · 74%</li>
          </ul>
          <h3>Next steps</h3>
          <ul>
            <li>Add ongoing monitoring requirements</li>
            <li>Check regulatory alignment on retention</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
