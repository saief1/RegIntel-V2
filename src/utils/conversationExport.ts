import type { Conversation } from '../types/ai'

/** Serialize a conversation to Markdown for copy/download. */
export function conversationToMarkdown(conversation: Conversation): string {
  const lines = [`# ${conversation.title}`, '', `_Updated ${conversation.updatedAt}_`, '']
  for (const message of conversation.messages) {
    const label = message.role === 'user' ? 'User' : 'Assistant'
    lines.push(`## ${label}`, '', message.content, '')
  }
  return lines.join('\n')
}

export async function copyConversation(conversation: Conversation): Promise<void> {
  await navigator.clipboard.writeText(conversationToMarkdown(conversation))
}

export function downloadConversationMarkdown(conversation: Conversation): void {
  const blob = new Blob([conversationToMarkdown(conversation)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${slugify(conversation.title)}.md`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function printConversation(conversation: Conversation): void {
  const markup = conversationToMarkdown(conversation)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=720,height=900')
  if (!popup) return
  popup.document.write(`<!doctype html><html><head><title>${conversation.title}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;white-space:pre-wrap;line-height:1.5}</style>
</head><body>${markup}</body></html>`)
  popup.document.close()
  popup.focus()
  popup.print()
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'conversation'
}
