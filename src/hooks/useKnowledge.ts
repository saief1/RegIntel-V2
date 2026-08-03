import { useContext } from 'react'
import { KnowledgeContext, type KnowledgeContextValue } from '../context/KnowledgeContext'

export function useKnowledge(): KnowledgeContextValue {
  const context = useContext(KnowledgeContext)
  if (!context) throw new Error('useKnowledge must be used within a KnowledgeProvider')
  return context
}
