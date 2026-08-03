export interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
}

/** Lightweight word/sentence-ish line diff for policy version compare (local only). */
export function diffPolicyText(left: string, right: string): DiffLine[] {
  const a = left.split(/(\s+)/)
  const b = right.split(/(\s+)/)
  const lines: DiffLine[] = []

  let i = 0
  let j = 0
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      lines.push({ type: 'same', text: a[i] })
      i += 1
      j += 1
      continue
    }
    if (j < b.length && (i >= a.length || !a.slice(i, i + 3).includes(b[j]))) {
      lines.push({ type: 'add', text: b[j] })
      j += 1
      continue
    }
    if (i < a.length) {
      lines.push({ type: 'remove', text: a[i] })
      i += 1
    }
  }
  return lines
}

export function summarizeDiff(left: string, right: string): string {
  const diff = diffPolicyText(left, right)
  const added = diff.filter((item) => item.type === 'add' && item.text.trim()).length
  const removed = diff.filter((item) => item.type === 'remove' && item.text.trim()).length
  if (added === 0 && removed === 0) return 'No material textual changes detected.'
  return `AI summary: approximately ${added} additions and ${removed} removals versus the selected baseline.`
}
