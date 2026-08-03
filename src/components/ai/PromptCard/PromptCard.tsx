import { Copy, Play, Star } from 'lucide-react'
import { PROMPT_CATEGORIES } from '../../../data/ai/prompts'
import type { PromptTemplate } from '../../../types/ai'
import { Badge } from '../../ui/Badge/Badge'
import { Button } from '../../ui/Button/Button'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './PromptCard.module.css'

function categoryLabel(id: PromptTemplate['category']): string {
  return PROMPT_CATEGORIES.find((item) => item.id === id)?.label ?? id
}

interface PromptCardProps {
  prompt: PromptTemplate
  onRun: () => void
  onDuplicate: () => void
  onToggleFavorite: () => void
}

export function PromptCard({ prompt, onRun, onDuplicate, onToggleFavorite }: PromptCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{prompt.title}</h3>
          <Badge variant="neutral">{categoryLabel(prompt.category)}</Badge>
        </div>
        <IconButton
          label={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onToggleFavorite}
        >
          <Star size={14} fill={prompt.isFavorite ? 'currentColor' : 'none'} />
        </IconButton>
      </header>
      <p className={styles.description}>{prompt.description}</p>
      <div className={styles.actions}>
        <Button size="sm" onClick={onRun}>
          <Play size={14} aria-hidden="true" />
          Run Prompt
        </Button>
        <Button size="sm" variant="ghost" onClick={onDuplicate}>
          <Copy size={14} aria-hidden="true" />
          Duplicate
        </Button>
      </div>
    </article>
  )
}
