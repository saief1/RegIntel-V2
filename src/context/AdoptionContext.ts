import { createContext } from 'react'
import type {
  AdoptionMilestone,
  CommunityPost,
  HelpArticle,
  HelpCategory,
  OnboardingProgress,
  OnboardingStep,
  OnboardingStepId,
  ProductTour,
  SuccessChecklistItem,
  SuccessMetric,
  SuccessRecommendation,
  TourId,
  WhatsNewEntry,
} from '../types/adoption'

export interface AdoptionContextValue {
  steps: OnboardingStep[]
  progress: OnboardingProgress
  setOrgName: (name: string) => void
  setIndustry: (industry: string) => void
  goToStep: (id: OnboardingStepId) => void
  completeStep: (id: OnboardingStepId) => void
  skipStep: (id: OnboardingStepId) => void
  saveProgress: () => void
  checklist: SuccessChecklistItem[]
  toggleChecklistItem: (id: string) => void
  workspaceCompletionPct: number
  helpArticles: HelpArticle[]
  helpBookmarks: string[]
  helpRecent: string[]
  toggleHelpBookmark: (id: string) => void
  viewHelpArticle: (id: string) => void
  successMetrics: SuccessMetric[]
  recommendations: SuccessRecommendation[]
  milestones: AdoptionMilestone[]
  tours: ProductTour[]
  completedTours: TourId[]
  activeTourId: TourId | null
  startTour: (id: TourId) => void
  completeTour: (id: TourId) => void
  restartTour: (id: TourId) => void
  communityPosts: CommunityPost[]
  votePost: (id: string) => void
  toggleBookmarkPost: (id: string) => void
  toggleFollowPost: (id: string) => void
  submitFeedback: (title: string, body: string) => void
  whatsNew: WhatsNewEntry[]
  showWhatsNew: boolean
  dismissWhatsNew: () => void
  reopenWhatsNew: () => void
  showWelcomeBanner: boolean
  dismissWelcomeBanner: () => void
  nextSuggestions: Array<{ id: string; title: string; detail: string; href: string }>
  helpCategories: ReadonlyArray<{ id: HelpCategory; label: string }>
}

export const AdoptionContext = createContext<AdoptionContextValue | null>(null)
