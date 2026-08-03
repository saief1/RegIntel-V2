import { BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '../../ui/EmptyState/EmptyState'

interface EmptyKnowledgeStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

/** EmptyState preset for knowledge surfaces (library, collections, recents) with a consistent default icon. */
export function EmptyKnowledgeState({ icon, title, description, action }: EmptyKnowledgeStateProps) {
  return <EmptyState icon={icon ?? <BookOpen size={20} />} title={title} description={description} action={action} />
}
