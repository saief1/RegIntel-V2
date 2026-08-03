import type { AiWorkspaceSettings } from '../../../types/ai'
import { Select } from '../../ui/Select/Select'
import styles from './AiSettingsPanel.module.css'

interface AiSettingsPanelProps {
  settings: AiWorkspaceSettings
  onChange: (patch: Partial<AiWorkspaceSettings>) => void
  onClose: () => void
}

export function AiSettingsPanel({ settings, onChange, onClose }: AiSettingsPanelProps) {
  return (
    <div className={styles.root} role="dialog" aria-label="AI workspace settings">
      <header className={styles.header}>
        <h2 className={styles.title}>AI settings</h2>
        <button type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </header>

      <label className={styles.field}>
        <span>Temperature</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={settings.temperature}
          onChange={(event) => onChange({ temperature: Number(event.target.value) })}
          aria-valuetext={`${settings.temperature}`}
        />
        <span className={styles.hint}>{settings.temperature.toFixed(1)} · UI only</span>
      </label>

      <label className={styles.field}>
        <span>Response length</span>
        <Select
          value={settings.responseLength}
          onChange={(event) =>
            onChange({ responseLength: event.target.value as AiWorkspaceSettings['responseLength'] })
          }
        >
          <option value="concise">Concise</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed</option>
        </Select>
      </label>

      <label className={styles.field}>
        <span>Citation mode</span>
        <Select
          value={settings.citationMode}
          onChange={(event) => onChange({ citationMode: event.target.value as AiWorkspaceSettings['citationMode'] })}
        >
          <option value="inline">Inline</option>
          <option value="footnote">Footnote</option>
          <option value="panel">Panel</option>
        </Select>
      </label>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={settings.autoReferences}
          onChange={(event) => onChange({ autoReferences: event.target.checked })}
        />
        Auto references
      </label>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={settings.autoSuggestions}
          onChange={(event) => onChange({ autoSuggestions: event.target.checked })}
        />
        Auto suggestions
      </label>

      <label className={styles.field}>
        <span>Theme</span>
        <Select
          value={settings.theme}
          onChange={(event) => onChange({ theme: event.target.value as AiWorkspaceSettings['theme'] })}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
        <span className={styles.hint}>Stored locally. Shell theme still follows workspace tokens.</span>
      </label>
    </div>
  )
}
