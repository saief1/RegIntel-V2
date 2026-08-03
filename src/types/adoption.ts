/**
 * Customer Experience / Adoption domain (Sprint 18).
 * Local/mock only — onboarding, help, success, tours, community.
 */

export type OnboardingStepId =
  | 'welcome'
  | 'organization'
  | 'industry'
  | 'policies'
  | 'integrations'
  | 'ai'
  | 'team'
  | 'complete'

export interface OnboardingStep {
  id: OnboardingStepId
  title: string
  description: string
  estimatedMinutes: number
  optional?: boolean
}

export interface OnboardingProgress {
  currentStepId: OnboardingStepId
  completedStepIds: OnboardingStepId[]
  skippedStepIds: OnboardingStepId[]
  orgName: string
  industry: string
  savedAt: string | null
}

export type HelpCategory =
  | 'documentation'
  | 'videos'
  | 'tours'
  | 'walkthroughs'
  | 'ai_academy'
  | 'compliance_academy'
  | 'admin'
  | 'api'
  | 'release_notes'
  | 'faq'

export interface HelpArticle {
  id: string
  title: string
  category: HelpCategory
  summary: string
  body: string
  durationLabel?: string
}

export interface SuccessMetric {
  id: string
  label: string
  value: string
  hint: string
}

export interface SuccessRecommendation {
  id: string
  title: string
  detail: string
  href: string
}

export interface SuccessChecklistItem {
  id: string
  label: string
  done: boolean
  href?: string
}

export type TourId =
  | 'first_login'
  | 'ai_workspace'
  | 'knowledge'
  | 'work'
  | 'reporting'
  | 'admin'
  | 'developer'

export interface ProductTour {
  id: TourId
  title: string
  description: string
  steps: number
  recommended?: boolean
  coachMarks: string[]
}

export interface CommunityPost {
  id: string
  kind: 'feature_request' | 'feedback' | 'discussion' | 'known_issue' | 'roadmap' | 'highlight'
  title: string
  body: string
  votes: number
  bookmarked: boolean
  following: boolean
  status?: string
  updatedAt: string
}

export interface AdoptionMilestone {
  id: string
  title: string
  detail: string
  achieved: boolean
}

export interface WhatsNewEntry {
  id: string
  version: string
  title: string
  summary: string
}
