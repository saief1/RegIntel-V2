import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  COMMUNITY_POSTS,
  HELP_ARTICLES,
  MILESTONES,
  NEXT_SUGGESTIONS,
  ONBOARDING_STEPS,
  PRODUCT_TOURS,
  SUCCESS_CHECKLIST,
  SUCCESS_METRICS,
  SUCCESS_RECOMMENDATIONS,
  WHATS_NEW,
} from '../data/adoption/platform'
import { createId } from '../utils/id'
import type {
  CommunityPost,
  HelpCategory,
  OnboardingProgress,
  SuccessChecklistItem,
  TourId,
} from '../types/adoption'
import { AdoptionContext, type AdoptionContextValue } from './AdoptionContext'

const HELP_CATEGORIES: ReadonlyArray<{ id: HelpCategory; label: string }> = [
  { id: 'documentation', label: 'Documentation' },
  { id: 'videos', label: 'Video Tutorials' },
  { id: 'tours', label: 'Product Tours' },
  { id: 'walkthroughs', label: 'Interactive Walkthroughs' },
  { id: 'ai_academy', label: 'AI Academy' },
  { id: 'compliance_academy', label: 'Compliance Academy' },
  { id: 'admin', label: 'Administrator Guide' },
  { id: 'api', label: 'API Documentation' },
  { id: 'release_notes', label: 'Release Notes' },
  { id: 'faq', label: 'FAQ' },
]

const INITIAL_PROGRESS: OnboardingProgress = {
  currentStepId: 'welcome',
  completedStepIds: [],
  skippedStepIds: [],
  orgName: '',
  industry: 'wealth',
  savedAt: null,
}

export function AdoptionProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<OnboardingProgress>(INITIAL_PROGRESS)
  const [checklist, setChecklist] = useState<SuccessChecklistItem[]>(SUCCESS_CHECKLIST)
  const [helpBookmarks, setHelpBookmarks] = useState<string[]>(['h-doc-1'])
  const [helpRecent, setHelpRecent] = useState<string[]>(['h-rel-1', 'h-faq-1'])
  const [completedTours, setCompletedTours] = useState<TourId[]>([])
  const [activeTourId, setActiveTourId] = useState<TourId | null>(null)
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)

  const workspaceCompletionPct = useMemo(() => {
    const onboardingDone = progress.completedStepIds.length + progress.skippedStepIds.length
    const onboardingPct = Math.round((onboardingDone / ONBOARDING_STEPS.length) * 50)
    const checklistPct = Math.round((checklist.filter((item) => item.done).length / Math.max(checklist.length, 1)) * 50)
    return Math.min(100, onboardingPct + checklistPct)
  }, [checklist, progress.completedStepIds.length, progress.skippedStepIds.length])

  const saveProgress = useCallback(() => {
    setProgress((current) => ({ ...current, savedAt: new Date().toISOString() }))
  }, [])

  const value = useMemo<AdoptionContextValue>(
    () => ({
      steps: ONBOARDING_STEPS,
      progress,
      setOrgName: (name) => setProgress((current) => ({ ...current, orgName: name })),
      setIndustry: (industry) => setProgress((current) => ({ ...current, industry })),
      goToStep: (id) => setProgress((current) => ({ ...current, currentStepId: id })),
      completeStep: (id) =>
        setProgress((current) => {
          const completed = current.completedStepIds.includes(id)
            ? current.completedStepIds
            : [...current.completedStepIds, id]
          const order = ONBOARDING_STEPS.map((step) => step.id)
          const index = order.indexOf(id)
          const next = order[index + 1] ?? 'complete'
          return {
            ...current,
            completedStepIds: completed,
            skippedStepIds: current.skippedStepIds.filter((stepId) => stepId !== id),
            currentStepId: next,
          }
        }),
      skipStep: (id) =>
        setProgress((current) => {
          const skipped = current.skippedStepIds.includes(id)
            ? current.skippedStepIds
            : [...current.skippedStepIds, id]
          const order = ONBOARDING_STEPS.map((step) => step.id)
          const index = order.indexOf(id)
          const next = order[index + 1] ?? 'complete'
          return { ...current, skippedStepIds: skipped, currentStepId: next }
        }),
      saveProgress,
      checklist,
      toggleChecklistItem: (id) =>
        setChecklist((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))),
      workspaceCompletionPct,
      helpArticles: HELP_ARTICLES,
      helpBookmarks,
      helpRecent,
      toggleHelpBookmark: (id) =>
        setHelpBookmarks((current) => (current.includes(id) ? current.filter((item) => item !== id) : [id, ...current])),
      viewHelpArticle: (id) =>
        setHelpRecent((current) => [id, ...current.filter((item) => item !== id)].slice(0, 8)),
      successMetrics: SUCCESS_METRICS,
      recommendations: SUCCESS_RECOMMENDATIONS,
      milestones: MILESTONES,
      tours: PRODUCT_TOURS,
      completedTours,
      activeTourId,
      startTour: (id) => setActiveTourId(id),
      completeTour: (id) => {
        setCompletedTours((current) => (current.includes(id) ? current : [...current, id]))
        setActiveTourId(null)
        setChecklist((current) =>
          current.map((item) => (item.id === 'sc-4' && id === 'first_login' ? { ...item, done: true } : item)),
        )
      },
      restartTour: (id) => {
        setCompletedTours((current) => current.filter((tourId) => tourId !== id))
        setActiveTourId(id)
      },
      communityPosts,
      votePost: (id) =>
        setCommunityPosts((current) =>
          current.map((post) => (post.id === id ? { ...post, votes: post.votes + 1 } : post)),
        ),
      toggleBookmarkPost: (id) =>
        setCommunityPosts((current) =>
          current.map((post) => (post.id === id ? { ...post, bookmarked: !post.bookmarked } : post)),
        ),
      toggleFollowPost: (id) =>
        setCommunityPosts((current) =>
          current.map((post) => (post.id === id ? { ...post, following: !post.following } : post)),
        ),
      submitFeedback: (title, body) =>
        setCommunityPosts((current) => [
          {
            id: createId('c'),
            kind: 'feedback',
            title: title.trim(),
            body: body.trim(),
            votes: 1,
            bookmarked: false,
            following: true,
            updatedAt: new Date().toISOString(),
          },
          ...current,
        ]),
      whatsNew: WHATS_NEW,
      showWhatsNew,
      dismissWhatsNew: () => setShowWhatsNew(false),
      reopenWhatsNew: () => setShowWhatsNew(true),
      showWelcomeBanner,
      dismissWelcomeBanner: () => setShowWelcomeBanner(false),
      nextSuggestions: NEXT_SUGGESTIONS,
      helpCategories: HELP_CATEGORIES,
    }),
    [
      activeTourId,
      checklist,
      communityPosts,
      completedTours,
      helpBookmarks,
      helpRecent,
      progress,
      saveProgress,
      showWelcomeBanner,
      showWhatsNew,
      workspaceCompletionPct,
    ],
  )

  return <AdoptionContext.Provider value={value}>{children}</AdoptionContext.Provider>
}
