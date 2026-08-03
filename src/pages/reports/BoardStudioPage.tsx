import { useMemo, useState } from 'react'
import { FileStack } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useAnalytics } from '../../hooks/useAnalytics'
import { formatRelativeTime } from '../../utils/date'
import styles from './analytics.module.css'
import { ReportsHubNav } from './ReportsHubNav'

export function BoardStudioPage() {
  const {
    boardSections,
    boardSectionOrder,
    moveBoardSection,
    boardTemplates,
    saveBoardTemplate,
    applyBoardTemplate,
    boardVersions,
    generateBoardPackage,
    queueExport,
  } = useAnalytics()
  const [templateName, setTemplateName] = useState('')

  const ordered = useMemo(
    () =>
      boardSectionOrder
        .map((id) => boardSections.find((section) => section.id === id))
        .filter((section): section is (typeof boardSections)[number] => Boolean(section)),
    [boardSectionOrder, boardSections],
  )

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Board Reporting Studio"
        description="Assemble executive board packages with rearrangeable sections, templates, and version history."
        icon={<FileStack size={20} />}
      />

      <ReportsHubNav current="/reports/board" />

      <div className={g.toolbar}>
        <Button size="sm" variant="primary" onClick={generateBoardPackage}>
          Generate board package
        </Button>
        <Button size="sm" variant="secondary" onClick={() => queueExport('Board package snapshot', 'pdf')}>
          Queue PDF export
        </Button>
        <Input
          aria-label="Template name"
          placeholder="Save layout as template…"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            saveBoardTemplate(templateName)
            setTemplateName('')
          }}
        >
          Save template
        </Button>
      </div>

      <div className={styles.split}>
        <section className={g.stack} aria-label="Board package sections">
          {ordered.map((section, index) => (
            <article key={section.id} className={g.panel}>
              <header className={g.row}>
                <div>
                  <Badge variant="neutral">Section {index + 1}</Badge>
                  <h2 style={{ marginTop: 8 }}>{section.title}</h2>
                </div>
                <div className={g.toolbar}>
                  <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => moveBoardSection(section.id, 'up')}>
                    Move up
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={index === ordered.length - 1}
                    onClick={() => moveBoardSection(section.id, 'down')}
                  >
                    Move down
                  </Button>
                </div>
              </header>
              <p className={g.muted}>{section.body}</p>
              <ul className={g.list}>
                {section.bullets.map((bullet) => (
                  <li key={bullet} className={g.listItem}>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Templates</h2>
            <ul className={g.list}>
              {boardTemplates.map((template) => (
                <li key={template.id} className={g.listItem}>
                  <span>
                    <strong>{template.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {template.sectionOrder.length} sections
                      {template.schedule ? ` · ${template.schedule}` : ''}
                    </span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => applyBoardTemplate(template.id)}>
                    Apply
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Report version history</h2>
            <ul className={g.list}>
              {boardVersions.map((version) => (
                <li key={version.id} className={g.listItem}>
                  <span>
                    <strong>{version.title}</strong>
                    <br />
                    <span className={g.muted}>{version.format.toUpperCase()}</span>
                  </span>
                  <div className={g.toolbar}>
                    <Badge variant={version.status === 'ready' ? 'success' : version.status === 'failed' ? 'error' : 'accent'}>
                      {version.status}
                    </Badge>
                    <time dateTime={version.createdAt}>{formatRelativeTime(version.createdAt)}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
