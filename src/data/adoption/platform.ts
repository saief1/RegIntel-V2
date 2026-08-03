import type {
  AdoptionMilestone,
  CommunityPost,
  HelpArticle,
  OnboardingStep,
  ProductTour,
  SuccessChecklistItem,
  SuccessMetric,
  SuccessRecommendation,
  WhatsNewEntry,
} from '../../types/adoption'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome', description: 'Meet RegIntel and set expectations for your workspace.', estimatedMinutes: 2 },
  { id: 'organization', title: 'Organization Setup', description: 'Name, region, and primary compliance contact.', estimatedMinutes: 3 },
  { id: 'industry', title: 'Industry Selection', description: 'Choose a solution pack such as Wealth Management.', estimatedMinutes: 2 },
  { id: 'policies', title: 'Import Existing Policies', description: 'Upload or map policy documents (mock).', estimatedMinutes: 5, optional: true },
  { id: 'integrations', title: 'Connect Integrations', description: 'Link Slack, Microsoft 365, or ticketing (mock).', estimatedMinutes: 4, optional: true },
  { id: 'ai', title: 'Configure AI Workspace', description: 'Enable agents and set confidence thresholds.', estimatedMinutes: 3 },
  { id: 'team', title: 'Invite Team Members', description: 'Add reviewers, CCO, and admins.', estimatedMinutes: 3 },
  { id: 'complete', title: 'Complete', description: 'Review checklist and enter the workspace.', estimatedMinutes: 1 },
]

export const HELP_ARTICLES: HelpArticle[] = [
  { id: 'h-doc-1', title: 'Getting started with RegIntel', category: 'documentation', summary: 'Core concepts for knowledge, work, and AI.', body: 'RegIntel connects regulatory knowledge to execution. Start with Library, Policy Workspace, and Action Center.' },
  { id: 'h-vid-1', title: 'Workspace overview (video)', category: 'videos', summary: '6-minute product overview.', body: 'Mock video tutorial covering navigation, search, and AI panel.', durationLabel: '6:12' },
  { id: 'h-tour-1', title: 'First login product tour', category: 'tours', summary: 'Guided coach marks for new users.', body: 'Launch from Settings → Tours or the welcome banner.' },
  { id: 'h-walk-1', title: 'Create your first policy', category: 'walkthroughs', summary: 'Interactive walkthrough for Policy Workspace.', body: 'Step through drafting, AI assist, and approval.' },
  { id: 'h-ai-1', title: 'AI Academy: prompt patterns', category: 'ai_academy', summary: 'How to write effective compliance prompts.', body: 'Use role, regulation, and evidence constraints in every prompt.' },
  { id: 'h-comp-1', title: 'Compliance Academy: KYC refresh', category: 'compliance_academy', summary: 'Wealth KYC refresh campaign playbook.', body: 'Aligns with the Wealth Management solution pack.' },
  { id: 'h-admin-1', title: 'Administrator Guide: RBAC', category: 'admin', summary: 'Roles, SSO, and tenant settings.', body: 'Configure Admin Console roles before inviting the full team.' },
  { id: 'h-api-1', title: 'API Documentation overview', category: 'api', summary: 'Public API explorer and keys.', body: 'Open /developer/api for interactive docs.' },
  { id: 'h-rel-1', title: 'Release notes v1.7.0-beta', category: 'release_notes', summary: 'Industry solution packs.', body: 'Wealth flagship, banking, insurance, and GRC marketplace.' },
  { id: 'h-faq-1', title: 'FAQ: How is data hosted?', category: 'faq', summary: 'Hosting and residency basics.', body: 'Mock answer: choose region during organization setup; details in Security Center.' },
  { id: 'h-faq-2', title: 'FAQ: Can I skip onboarding?', category: 'faq', summary: 'Skip and resume later.', body: 'Yes — progress is saved and checklist remains in the workspace.' },
]

export const SUCCESS_METRICS: SuccessMetric[] = [
  { id: 'm1', label: 'Adoption Score', value: '72', hint: 'Good — invite reviewers next' },
  { id: 'm2', label: 'Workspace Completion', value: '64%', hint: 'Onboarding + checklist' },
  { id: 'm3', label: 'Team Engagement', value: '58%', hint: 'Weekly active users' },
  { id: 'm4', label: 'AI Usage', value: '41%', hint: 'Seats with AI actions' },
  { id: 'm5', label: 'Automation Usage', value: '33%', hint: 'Published automations' },
  { id: 'm6', label: 'Regulatory Coverage', value: '79%', hint: 'Mapped obligations' },
  { id: 'm7', label: 'Open Recommendations', value: '5', hint: 'Success coaching' },
  { id: 'm8', label: 'Health Score', value: '81', hint: 'Customer success' },
]

export const SUCCESS_CHECKLIST: SuccessChecklistItem[] = [
  { id: 'sc-1', label: 'Finish guided onboarding', done: false, href: '/onboarding' },
  { id: 'sc-2', label: 'Install Wealth Management pack', done: true, href: '/solutions/wealth' },
  { id: 'sc-3', label: 'Invite at least 3 teammates', done: false, href: '/onboarding' },
  { id: 'sc-4', label: 'Complete First Login Tour', done: false, href: '/settings/tours' },
  { id: 'sc-5', label: 'Connect one integration', done: false, href: '/integrations/marketplace' },
  { id: 'sc-6', label: 'Publish one automation', done: false, href: '/automation' },
]

export const SUCCESS_RECOMMENDATIONS: SuccessRecommendation[] = [
  { id: 'r1', title: 'Complete organization setup', detail: 'Add primary CCO contact and region.', href: '/onboarding' },
  { id: 'r2', title: 'Run the AI Workspace tour', detail: 'Unlock AI Academy shortcuts.', href: '/settings/tours' },
  { id: 'r3', title: 'Map top 5 policies', detail: 'Improve regulatory coverage score.', href: '/knowledge/policies' },
  { id: 'r4', title: 'Review Customer Success checklist', detail: 'Close remaining adoption gaps.', href: '/customer-success' },
]

export const PRODUCT_TOURS: ProductTour[] = [
  { id: 'first_login', title: 'First Login Tour', description: 'Shell, search, and primary destinations.', steps: 5, recommended: true, coachMarks: ['Sidebar sections', 'Global search ⌘K', 'AI panel', 'Notifications', 'Help menu'] },
  { id: 'ai_workspace', title: 'AI Workspace Tour', description: 'Chat, research, and create-task modes.', steps: 4, recommended: true, coachMarks: ['Mode tabs', 'Prompt library', 'Citations', 'Create Task'] },
  { id: 'knowledge', title: 'Knowledge Tour', description: 'Library, collections, and policies.', steps: 4, coachMarks: ['Regulation Library', 'Collections', 'Policy Workspace', 'Knowledge Graph'] },
  { id: 'work', title: 'Work Management Tour', description: 'Action Center, tasks, and cases.', steps: 4, coachMarks: ['My Tasks', 'Board', 'Workflows', 'Cases'] },
  { id: 'reporting', title: 'Reporting Tour', description: 'Executive dashboard and board studio.', steps: 3, coachMarks: ['Executive Dashboard', 'Analytics', 'Board Studio'] },
  { id: 'admin', title: 'Admin Tour', description: 'Tenant, RBAC, and security.', steps: 4, coachMarks: ['Admin Console', 'Security Center', 'Audit', 'System Health'] },
  { id: 'developer', title: 'Developer Tour', description: 'API explorer, keys, and webhooks.', steps: 4, coachMarks: ['Developer Portal', 'API Explorer', 'Apps', 'Webhooks'] },
]

export const COMMUNITY_POSTS: CommunityPost[] = [
  { id: 'c1', kind: 'feature_request', title: 'Native OBSI case export', body: 'Export complaint packs in OBSI-ready format for wealth dealers.', votes: 48, bookmarked: false, following: true, status: 'Under review', updatedAt: '2026-08-02T12:00:00.000Z' },
  { id: 'c2', kind: 'feedback', title: 'Onboarding length feels right', body: 'Optional steps for integrations helped us go live faster.', votes: 21, bookmarked: true, following: false, updatedAt: '2026-08-01T09:00:00.000Z' },
  { id: 'c3', kind: 'discussion', title: 'Best KYC refresh campaign tips?', body: 'Mock community thread for wealth compliance officers.', votes: 15, bookmarked: false, following: false, updatedAt: '2026-07-30T16:00:00.000Z' },
  { id: 'c4', kind: 'roadmap', title: 'Public roadmap: Billing & trials', body: 'Sprint 19 will add commercial platform capabilities.', votes: 62, bookmarked: false, following: true, status: 'Planned', updatedAt: '2026-08-03T08:00:00.000Z' },
  { id: 'c5', kind: 'known_issue', title: 'Safari: tour coach marks clip on zoom', body: 'Workaround: reset browser zoom to 100%.', votes: 7, bookmarked: false, following: false, status: 'Open', updatedAt: '2026-07-28T11:00:00.000Z' },
  { id: 'c6', kind: 'highlight', title: 'Release highlight: Industry packs', body: 'Wealth flagship plus banking, insurance, and GRC packs.', votes: 90, bookmarked: true, following: false, updatedAt: '2026-08-03T10:00:00.000Z' },
]

export const MILESTONES: AdoptionMilestone[] = [
  { id: 'ms-1', title: 'Workspace created', detail: 'Organization profile started', achieved: true },
  { id: 'ms-2', title: 'Industry selected', detail: 'Wealth Management pack installed', achieved: true },
  { id: 'ms-3', title: 'First teammate invited', detail: 'Pending', achieved: false },
  { id: 'ms-4', title: 'First AI action', detail: 'Pending', achieved: false },
  { id: 'ms-5', title: 'First automation published', detail: 'Pending', achieved: false },
]

export const WHATS_NEW: WhatsNewEntry[] = [
  { id: 'wn-1', version: 'v1.7.0-beta', title: 'Industry Solution Packs', summary: 'Marketplace with Wealth flagship, Banking, Insurance, and GRC.' },
  { id: 'wn-2', version: 'v1.6.0-beta', title: 'Production Operations', summary: 'Ops center, incidents, backups, deployments, observability.' },
  { id: 'wn-3', version: 'v1.5.0-beta', title: 'Developer Platform', summary: 'Portal, API explorer, apps, webhooks, and SDKs.' },
]

export const NEXT_SUGGESTIONS = [
  { id: 'ns-1', title: 'Finish onboarding', detail: 'You are partway through workspace setup.', href: '/onboarding' },
  { id: 'ns-2', title: 'Explore Learning Center', detail: 'Bookmark the Administrator Guide.', href: '/help' },
  { id: 'ns-3', title: 'Check adoption score', detail: 'See open recommendations in Customer Success.', href: '/customer-success' },
]
