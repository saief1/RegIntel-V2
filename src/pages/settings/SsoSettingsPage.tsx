import { KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { featureFlags } from '../../config/featureFlags'
import { OperationsHubNav } from '../operations/OperationsHubNav'
import styles from '../operations/operations.module.css'

const MOCK_PROVIDERS = [
  {
    id: 'oidc-okta',
    name: 'Mock Okta OIDC',
    type: 'OIDC',
    issuer: 'https://mock-okta.regintel.local',
    enabled: false,
  },
  {
    id: 'saml-azure',
    name: 'Mock Azure AD SAML',
    type: 'SAML',
    issuer: 'https://auth.regintel.local/saml/metadata',
    enabled: false,
  },
] as const

/**
 * Minimal SSO settings surface for B008.
 * Uses existing Settings / Security Center patterns — no redesign.
 * Real API wiring is gated by VITE_USE_REAL_SSO.
 */
export function SsoSettingsPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="SSO Configuration"
        description="Enterprise OpenID Connect and SAML provider settings."
        icon={<KeyRound size={20} />}
      />

      <OperationsHubNav current="/settings/security/sso" />

      <nav className={styles.hubLinks} aria-label="Security settings">
        <Link className={styles.hubLink} to="/settings/security">
          Security Center
        </Link>
        <Link className={styles.hubLink} to="/settings/admin">
          Admin Console
        </Link>
        <Link className={styles.hubLink} to="/settings">
          Settings
        </Link>
      </nav>

      <section className={g.panel}>
        <header className={g.row}>
          <div>
            <h2>Identity providers</h2>
            <p className={g.muted}>
              {featureFlags.useRealSso
                ? 'Connected to the RegIntel SSO API (mock IdP interfaces).'
                : 'Showing local mock provider configuration. Enable VITE_USE_REAL_SSO to use the API.'}
            </p>
          </div>
          <Badge variant={featureFlags.useRealSso ? 'success' : 'neutral'}>
            {featureFlags.useRealSso ? 'API mode' : 'Mock mode'}
          </Badge>
        </header>

        <ul className={g.list}>
          {MOCK_PROVIDERS.map((provider) => (
            <li key={provider.id} className={g.listItem}>
              <span>
                <strong>{provider.name}</strong>
                <br />
                <span className={g.muted}>
                  {provider.type} · {provider.issuer}
                </span>
              </span>
              <Badge variant={provider.enabled ? 'success' : 'neutral'}>
                {provider.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
