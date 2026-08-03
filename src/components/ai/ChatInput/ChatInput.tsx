import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './ChatInput.module.css'

interface ChatInputProps {
  onSubmit: (value: string) => void
  disabled?: boolean
  placeholder?: string
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
  /** Previous user prompts for ↑ history cycling. */
  history?: string[]
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = 'Ask about regulations, cases, evidence, or drafting…',
  inputRef,
  history = [],
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const historyIndex = useRef(-1)
  const id = useId()

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
    historyIndex.current = -1
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
      return
    }
    if (event.key === 'Tab' && !value.trim()) {
      event.preventDefault()
      setValue('Summarize the key obligations for ')
      return
    }
    if (event.key === 'ArrowUp' && history.length > 0 && (value === '' || historyIndex.current >= 0)) {
      event.preventDefault()
      const nextIndex =
        historyIndex.current < 0 ? history.length - 1 : Math.max(0, historyIndex.current - 1)
      historyIndex.current = nextIndex
      setValue(history[nextIndex] ?? '')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor={id} className={styles.srOnly}>
        Message Copilot
      </label>
      <textarea
        id={id}
        ref={inputRef}
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
      />
      <IconButton label="Send message" type="submit" disabled={disabled || !value.trim()}>
        <Send size={16} />
      </IconButton>
    </form>
  )
}
