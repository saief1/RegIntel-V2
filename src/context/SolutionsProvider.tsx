import { useMemo, useState, type ReactNode } from 'react'
import {
  BANKING_PACK,
  GRC_PACK,
  INSURANCE_PACK,
  SOLUTION_PACKS,
  WEALTH_PACK,
} from '../data/solutions/platform'
import type { SolutionId, SolutionPackCard } from '../types/solutions'
import { SolutionsContext, type SolutionsContextValue } from './SolutionsContext'

export function SolutionsProvider({ children }: { children: ReactNode }) {
  const [packs, setPacks] = useState<SolutionPackCard[]>(SOLUTION_PACKS)
  const [activeSolutionId, setActiveSolutionId] = useState<SolutionId | null>('wealth')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(WEALTH_PACK.aiTemplates[0]?.id ?? null)

  const value = useMemo<SolutionsContextValue>(
    () => ({
      packs,
      activeSolutionId,
      setActiveSolutionId,
      installPack: (id) =>
        setPacks((current) =>
          current.map((pack) => (pack.id === id ? { ...pack, state: 'installed' } : pack)),
        ),
      previewPack: (id) =>
        setPacks((current) =>
          current.map((pack) =>
            pack.id === id && pack.state === 'available' ? { ...pack, state: 'preview' } : pack,
          ),
        ),
      wealth: WEALTH_PACK,
      banking: BANKING_PACK,
      insurance: INSURANCE_PACK,
      grc: GRC_PACK,
      selectedTemplateId,
      selectTemplate: setSelectedTemplateId,
    }),
    [activeSolutionId, packs, selectedTemplateId],
  )

  return <SolutionsContext.Provider value={value}>{children}</SolutionsContext.Provider>
}
