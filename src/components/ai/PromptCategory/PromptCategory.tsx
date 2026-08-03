import { clsx as cx } from 'clsx'
import type { PromptCategoryId } from '../../../types/ai'
import styles from './PromptCategory.module.css'

interface PromptCategoryProps {
  categories: { id: PromptCategoryId; label: string }[]
  value: PromptCategoryId | 'all'
  onChange: (value: PromptCategoryId | 'all') => void
}

export function PromptCategory({ categories, value, onChange }: PromptCategoryProps) {
  return (
    <div className={styles.row} role="tablist" aria-label="Prompt categories">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'all'}
        className={cx(styles.chip, value === 'all' && styles.active)}
        onClick={() => onChange('all')}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={value === category.id}
          className={cx(styles.chip, value === category.id && styles.active)}
          onClick={() => onChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
