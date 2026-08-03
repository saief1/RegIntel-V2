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
  { path: '/reports', mustInclude: /Executive Dashboard|Compliance Health|Reporting Engine/i },
  { path: '/settings', mustInclude: /Organization|RBAC|Audit Trail|Automation|Integrations|Admin Console/i },
  { path: '/settings/integrations', mustInclude: /Integrations|Microsoft 365|Background sync queue/i },
  { path: '/integrations', mustInclude: /Integrations|Microsoft 365|Sync queue/i },
  { path: '/settings/api', mustInclude: /API Platform|API Keys|Test Console/i },
  { path: '/settings/admin', mustInclude: /Admin Console|Tenant Settings|SSO/i },
  { path: '/settings/collaboration', mustInclude: /Collaboration|Watchlists|Team channels/i },
  { path: '/ai', mustInclude: /AI Workspace|Prompt library|Chat|Research|Create Task|AI Agents/i },
  { path: '/ai/prompts', mustInclude: /Prompt library/i },
  { path: '/ai/memory', mustInclude: /AI memory|Memory/i },
  { path: '/ai/agents', mustInclude: /Continuous AI Monitoring|FINTRAC|Agent health/i },
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
  test('shell loads and core routes render', async ({ page }) => {
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
        '/settings',
        '/settings/integrations',
        '/settings/api',
        '/settings/admin',
        '/ai',
        '/ai/agents',
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
})
