import { createContext } from 'react'
import type {
  BankingPackData,
  GrcPackData,
  InsurancePackData,
  SolutionId,
  SolutionPackCard,
  WealthPackData,
} from '../types/solutions'

export interface SolutionsContextValue {
  packs: SolutionPackCard[]
  activeSolutionId: SolutionId | null
  setActiveSolutionId: (id: SolutionId | null) => void
  installPack: (id: SolutionId) => void
  previewPack: (id: SolutionId) => void
  wealth: WealthPackData
  banking: BankingPackData
  insurance: InsurancePackData
  grc: GrcPackData
  selectedTemplateId: string | null
  selectTemplate: (id: string | null) => void
}

export const SolutionsContext = createContext<SolutionsContextValue | null>(null)
