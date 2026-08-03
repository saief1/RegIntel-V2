import { CopyButton } from './CopyButton'
import styles from './developerWidgets.module.css'

/** Lightweight CSS-tokenized code block (no highlighter dependency). */
export function CodeBlock({
  code,
  label,
  language = 'text',
}: {
  code: string
  label?: string
  language?: string
}) {
  return (
    <div className={styles.codeShell}>
      <header className={styles.codeHeader}>
        <span>
          {label ?? language}
          <span className={styles.versionBadge} aria-hidden="true">
            {language}
          </span>
        </span>
        <CopyButton value={code} />
      </header>
      <pre className={styles.code} tabIndex={0} aria-label={label ?? 'Code sample'}>
        <code className={language === 'json' ? styles.tokJson : undefined}>{code}</code>
      </pre>
    </div>
  )
}
