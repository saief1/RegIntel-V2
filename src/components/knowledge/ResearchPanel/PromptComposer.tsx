import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './ResearchPanel.module.css'

interface PromptComposerProps {
  onSubmit: (content: string) => void
  disabled?: boolean
}

/** Message input for the AI Research panel — a single-line composer with Enter-to-send. */
export function PromptComposer({ onSubmit, disabled = false }: PromptComposerProps) {
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit} aria-label="Ask the research assistant">
      <input
        type="text"
        className={styles.composerInput}
        placeholder="Ask about a regulation, jurisdiction, or topic..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        aria-label="Research prompt"
      />
      <IconButton label="Send message" type="submit" disabled={disabled || value.trim().length === 0}>
        <Send size={16} />
      </IconButton>
    </form>
  )
}
