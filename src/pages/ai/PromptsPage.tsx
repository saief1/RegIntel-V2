import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library, Sparkles } from 'lucide-react'
import { PromptCard } from '../../components/ai/PromptCard/PromptCard'
import { PromptCategory } from '../../components/ai/PromptCategory/PromptCategory'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SearchField } from '../../components/ui/SearchField/SearchField'
import { PROMPT_CATEGORIES } from '../../data/ai/prompts'
import { useCopilot } from '../../hooks/useCopilot'
import type { PromptCategoryId } from '../../types/ai'
import styles from './PromptsPage.module.css'

export function PromptsPage() {
  const navigate = useNavigate()
  const { prompts, togglePromptFavorite, duplicatePrompt, runPrompt } = useCopilot()
  const [category, setCategory] = useState<PromptCategoryId | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return prompts.filter((prompt) => {
      if (category !== 'all' && prompt.category !== category) return false
      if (!normalized) return true
      return `${prompt.title} ${prompt.description} ${prompt.prompt}`.toLowerCase().includes(normalized)
    })
  }, [prompts, category, query])

  return (
    <PageContainer>
      <PageHeader
        icon={<Library size={20} />}
        title="Prompt library"
        description="Reusable investigation, research, risk, compliance, policy, reporting, and drafting prompts."
        actions={
          <button type="button" className={styles.backLink} onClick={() => navigate('/ai')}>
            <Sparkles size={14} aria-hidden="true" />
            Open Copilot
          </button>
        }
      />

      <div className={styles.toolbar}>
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search prompts"
          aria-label="Search prompts"
        />
        <PromptCategory categories={PROMPT_CATEGORIES} value={category} onChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No prompts match this filter.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onRun={() => {
                runPrompt(prompt.id)
                navigate('/ai')
              }}
              onDuplicate={() => duplicatePrompt(prompt.id)}
              onToggleFavorite={() => togglePromptFavorite(prompt.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
