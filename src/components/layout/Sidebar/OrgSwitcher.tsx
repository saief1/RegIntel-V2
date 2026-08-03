import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel } from '../../ui/Dropdown/DropdownItem'
import styles from './OrgSwitcher.module.css'

const CURRENT_WORKSPACE = 'RegIntel Professional'

export function OrgSwitcher() {
  return (
    <Dropdown
      align="start"
      width={240}
      trigger={
        <button type="button" className={styles.trigger}>
          <span className={styles.mark} aria-hidden="true">
            <Building2 size={14} />
          </span>
          <span className={styles.name}>{CURRENT_WORKSPACE}</span>
          <ChevronsUpDown size={14} className={styles.chevron} aria-hidden="true" />
        </button>
      }
    >
      <DropdownLabel>Workspace</DropdownLabel>
      <DropdownItem icon={<Check size={16} />}>{CURRENT_WORKSPACE}</DropdownItem>
      <DropdownItem disabled>More workspaces coming soon</DropdownItem>
    </Dropdown>
  )
}
