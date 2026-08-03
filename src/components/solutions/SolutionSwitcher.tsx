import { useNavigate } from 'react-router-dom'
import { useSolutions } from '../../hooks/useSolutions'
import type { SolutionId } from '../../types/solutions'
import styles from '../../pages/solutions/solutions.module.css'

const ROUTES: Partial<Record<SolutionId, string>> = {
  wealth: '/solutions/wealth',
  banking: '/solutions/banking',
  insurance: '/solutions/insurance',
  grc: '/solutions/grc',
}

/** Compact solution switcher for the shell header. */
export function SolutionSwitcher() {
  const navigate = useNavigate()
  const { packs, activeSolutionId, setActiveSolutionId } = useSolutions()
  const installed = packs.filter((pack) => pack.state === 'installed' || pack.href)

  return (
    <label className={styles.switcher}>
      <span className={styles.industryBadge}>Industry</span>
      <select
        aria-label="Solution switcher"
        value={activeSolutionId ?? ''}
        onChange={(e) => {
          const id = (e.target.value || null) as SolutionId | null
          setActiveSolutionId(id)
          if (id && ROUTES[id]) navigate(ROUTES[id]!)
          else if (!id) navigate('/solutions')
        }}
      >
        <option value="">Marketplace</option>
        {installed.map((pack) => (
          <option key={pack.id} value={pack.id}>
            {pack.name}
            {pack.flagship ? ' ★' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
