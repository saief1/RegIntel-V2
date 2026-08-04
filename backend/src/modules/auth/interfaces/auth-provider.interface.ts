/**
 * Password auth provider interface (B003).
 * Enterprise OIDC/SAML interfaces live in `modules/sso/providers` (B008).
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthProvider {
  readonly name: string;
  validateCredentials(credentials: AuthCredentials): Promise<boolean>;
}

export {
  MockOidcProvider as StubOidcProvider,
  MockSamlProvider as StubSamlProvider,
  type OidcProvider,
  type SamlProvider,
} from '../../sso/providers/enterprise-auth.providers';
