import { CodeBlock } from './CodeBlock'

export function JsonViewer({ value, label = 'JSON' }: { value: string | object; label?: string }) {
  const code = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return <CodeBlock code={code} label={label} language="json" />
}
