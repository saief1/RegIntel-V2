import { expect, test, type Page } from '@playwright/test'

/**
 * Minimal reusable smoke suite for every sprint.
 * Extend this file (or add sibling specs under e2e/) — do not replace it.
 */

const CORE_ROUTES = [
  { path: '/', mustInclude: /How can RegIntel help today|Today’s Priorities|Good (morning|afternoon|evening)/i },
  { path: '/knowledge', mustInclude: /Library|Policy Workspace/i },
  { path: '/knowledge/library', mustInclude: /Regulation Library/i },
  { path: '/knowledge/policies', mustInclude: /Policy Workspace|AML Policy/i },
  { path: '/knowledge/policies/pol-aml', mustInclude: /Version control|Approval workflow|AI Policy Assistant/i },
  { path: '/work', mustInclude: /Action Center|My Tasks|Board/i },
  { path: '/work/tasks/task-02', mustInclude: /Counsel review|Checklist|Activity/i },
  { path: '/work/workflows', mustInclude: /Workflow Builder|Templates/i },
  { path: '/work/calendar', mustInclude: /Compliance Calendar/i },
  { path: '/work/cases', mustInclude: /Cases/i },
  { path: '/reports', mustInclude: /Executive Dashboard|Compliance Health|Reporting Engine|Analytics Center/i },
  { path: '/reports/analytics', mustInclude: /Executive Analytics Center|Risk heatmap|Saved dashboard views/i },
  { path: '/reports/kpis', mustInclude: /KPI Builder|Open High-Risk Findings|Formula builder/i },
  { path: '/reports/predictive', mustInclude: /Predictive Compliance|Upcoming regulatory workload|Suggested mitigation/i },
  { path: '/reports/board', mustInclude: /Board Reporting Studio|Executive summary|Generate board package/i },
  { path: '/reports/benchmark', mustInclude: /Enterprise Benchmarking|Leaderboard|Accessible metrics table/i },
  { path: '/settings', mustInclude: /Organization|RBAC|Audit Trail|Automation|Integrations|Admin Console/i },
  { path: '/settings/integrations', mustInclude: /Integrations|Microsoft 365|Background sync queue/i },
  { path: '/integrations', mustInclude: /Integrations|Microsoft 365|Sync queue/i },
  { path: '/settings/api', mustInclude: /API Platform|API Keys|Test Console/i },
  { path: '/settings/admin', mustInclude: /Admin Console|Tenant Settings|SSO/i },
  { path: '/settings/collaboration', mustInclude: /Collaboration|Watchlists|Team channels/i },
  { path: '/settings/data', mustInclude: /Data Management Center|Data sources|Failed import queue/i },
  { path: '/settings/security', mustInclude: /Enterprise Security Center|Security alerts|Trusted devices/i },
  { path: '/audit', mustInclude: /Audit & Compliance Center|Audit lifecycle|External auditor portal/i },
  { path: '/automation', mustInclude: /Enterprise Automation Studio|Publish automation|Run history/i },
  { path: '/system', mustInclude: /System Health Center|Service health|Release notes viewer/i },
  { path: '/integrations/marketplace', mustInclude: /Enterprise Integration Marketplace|Microsoft 365|Sync history/i },
  { path: '/integrations/builder', mustInclude: /Integration Builder|Builder pipeline|Publish integration/i },
  { path: '/automation/canvas', mustInclude: /Enterprise Workflow Studio 2.0|Validate|Version history/i },
  { path: '/data/lineage', mustInclude: /Enterprise Data Lineage|Impact analysis|AML Policy/i },
  { path: '/reports/digital-twin', mustInclude: /Executive Digital Twin|Organization map|Simulations/i },
  { path: '/developer', mustInclude: /Developer Portal|Requests Today|API Explorer/i },
  { path: '/developer/api', mustInclude: /Public API Explorer|Interactive request playground|Authentication/i },
  { path: '/developer/apps', mustInclude: /API Keys & OAuth Apps|Create key|OAuth Applications/i },
  { path: '/developer/webhooks', mustInclude: /Webhooks Center|Policy Updated|Payload viewer/i },
  { path: '/developer/sdk', mustInclude: /SDK & Developer Resources|regintel login|Postman/i },
  { path: '/operations', mustInclude: /Operations Center|Platform Health|Service dependency map/i },
  { path: '/operations/incidents', mustInclude: /Incident Management|Status page preview|AI summary/i },
  { path: '/operations/backups', mustInclude: /Backup & Disaster Recovery|Restore simulation|RPO/i },
  { path: '/operations/deployments', mustInclude: /Deployment Center|Feature flags|Rollback/i },
  { path: '/operations/observability', mustInclude: /Observability|Live stream|Tracing|Alerts/i },
  { path: '/solutions', mustInclude: /Solution Marketplace|Wealth Management|Flagship/i },
  { path: '/solutions/wealth', mustInclude: /Wealth Management Pack|KYC|CIRO|Compliance Memo/i },
  { path: '/solutions/banking', mustInclude: /Banking Pack|Risk heatmap|Regulatory Health/i },
  { path: '/solutions/insurance', mustInclude: /Insurance Pack|Agent supervision|Review calendar/i },
  { path: '/solutions/grc', mustInclude: /Enterprise GRC Pack|Risk matrix|Audit universe/i },
  { path: '/onboarding', mustInclude: /Guided Workspace Onboarding|Organization Setup|Onboarding checklist/i },
  { path: '/help', mustInclude: /Learning Center|Documentation|Recently viewed/i },
  { path: '/customer-success', mustInclude: /Customer Success Center|Adoption Score|Success checklist/i },
  { path: '/settings/tours', mustInclude: /Product Tours|First Login Tour|coach marks/i },
  { path: '/community', mustInclude: /Feedback & Community|Feature Requests|Submit feedback/i },
  { path: '/settings/billing', mustInclude: /Billing & Subscription Center|Plan comparison|Invoice history/i },
  { path: '/customer', mustInclude: /Customer Portal|Health score|Renewal readiness|Success manager/i },
  { path: '/partners', mustInclude: /Partner Portal|Partner directory|Registered deals/i },
  { path: '/settings/usage', mustInclude: /Usage & Consumption Analytics|AI requests|Export CSV/i },
  { path: '/settings/licensing', mustInclude: /Enterprise Licensing|Seat allocation|Feature entitlements/i },
  { path: '/ai', mustInclude: /AI Workspace|Prompt library|Chat|Research|Create Task|AI Agents/i },
  { path: '/ai/prompts', mustInclude: /Prompt library/i },
  { path: '/ai/memory', mustInclude: /AI memory|Memory/i },
  { path: '/ai/agents', mustInclude: /Continuous AI Monitoring|FINTRAC|Agent health/i },
  { path: '/agents', mustInclude: /AI Agents|Regulatory Monitor|Policy Writer|Agent activity timeline/i },
  { path: '/agents/builder', mustInclude: /Agent Builder|Visual workflow|Publish agent/i },
  { path: '/agents/queue', mustInclude: /Autonomous Work Queue|Bulk approve|pending approval/i },
  { path: '/knowledge/graph', mustInclude: /Knowledge Graph|FINTRAC|List/i },
  { path: '/reports/command', mustInclude: /Executive AI Command Center|Daily Summary|Organization Risk Score/i },
  { path: '/investigations', mustInclude: /Investigations/i },
  { path: '/investigations/inv-01', mustInclude: /Cross-border transfer|Overview|Timeline/i },
  { path: '/regulatory-changes', mustInclude: /Regulatory change/i },
  { path: '/regulatory-changes/rc-01', mustInclude: /Impact assessment|Cross-border transfer/i },
] as const

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

async function waitForShell(page: Page) {
  await expect(page.getByRole('main', { name: 'Workspace' })).toBeVisible()
  // Desktop keeps the section nav visible; tablet/mobile use a drawer.
  const sections = page.getByRole('navigation', { name: 'Sections' })
  const openNavigation = page.getByRole('button', { name: 'Open navigation' })
  await expect(sections.or(openNavigation).first()).toBeVisible()
}

async function assertNoHorizontalOverflow(page: Page) {
  const { clientWidth, scrollWidth } = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(scrollWidth, `horizontal overflow: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`).toBeLessThanOrEqual(
    clientWidth + 1,
  )
}

test.describe('RegIntel smoke suite', () => {
  // Route catalog grows each sprint; keep this suite sequential but give it room.
  test('shell loads and core routes render', async ({ page }) => {
    test.setTimeout(180_000)
    for (const route of CORE_ROUTES) {
      await page.goto(route.path)
      await waitForShell(page)
      await expect(page.getByRole('main', { name: 'Workspace' })).toContainText(route.mustInclude)
      await assertNoHorizontalOverflow(page)
    }
  })

  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} layout has no horizontal overflow on key routes`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      for (const path of [
        '/',
        '/knowledge',
        '/knowledge/policies',
        '/work',
        '/reports',
        '/reports/analytics',
        '/reports/board',
        '/reports/benchmark',
        '/settings',
        '/settings/integrations',
        '/settings/api',
        '/settings/admin',
        '/settings/data',
        '/settings/security',
        '/audit',
        '/automation',
        '/system',
        '/integrations/marketplace',
        '/automation/canvas',
        '/data/lineage',
        '/reports/digital-twin',
        '/developer',
        '/developer/api',
        '/developer/webhooks',
        '/operations',
        '/operations/incidents',
        '/operations/observability',
        '/solutions',
        '/solutions/wealth',
        '/solutions/banking',
        '/onboarding',
        '/help',
        '/customer-success',
        '/settings/billing',
        '/customer',
        '/partners',
        '/settings/usage',
        '/settings/licensing',
        '/ai',
        '/ai/agents',
        '/agents',
        '/agents/queue',
        '/knowledge/graph',
        '/reports/command',
        '/investigations',
        '/regulatory-changes',
      ] as const) {
        await page.goto(path)
        await waitForShell(page)
        await assertNoHorizontalOverflow(page)
      }
    })
  }

  test('command palette opens with meta+k', async ({ page }) => {
    await page.goto('/')
    await waitForShell(page)
    await page.keyboard.press('Meta+k')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('unknown route shows not-found recovery', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await waitForShell(page)
    await expect(page.getByRole('main', { name: 'Workspace' })).toContainText(/Page not found/i)
    await expect(page.getByRole('button', { name: 'Go to Home' })).toBeVisible()
    await assertNoHorizontalOverflow(page)
  })
})
