/**
 * MFA / SSO readiness stubs for B006+.
 * Password provider is the only active implementation in B1.
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthProvider {
  readonly name: string;
  validateCredentials(credentials: AuthCredentials): Promise<boolean>;
}

export interface OidcProvider {
  readonly name: 'oidc';
  getAuthorizationUrl(state: string): Promise<string>;
  exchangeCode(code: string): Promise<{ email: string; externalId: string }>;
}

export interface SamlProvider {
  readonly name: 'saml';
  getLoginRedirectUrl(): Promise<string>;
  validateAssertion(
    assertion: string,
  ): Promise<{ email: string; externalId: string }>;
}

export class StubOidcProvider implements OidcProvider {
  readonly name = 'oidc' as const;

  getAuthorizationUrl(state: string): Promise<string> {
    void state;
    return Promise.reject(
      new Error('OIDC provider is not implemented in Milestone B1.'),
    );
  }

  exchangeCode(code: string): Promise<{ email: string; externalId: string }> {
    void code;
    return Promise.reject(
      new Error('OIDC provider is not implemented in Milestone B1.'),
    );
  }
}

export class StubSamlProvider implements SamlProvider {
  readonly name = 'saml' as const;

  getLoginRedirectUrl(): Promise<string> {
    return Promise.reject(
      new Error('SAML provider is not implemented in Milestone B1.'),
    );
  }

  validateAssertion(
    assertion: string,
  ): Promise<{ email: string; externalId: string }> {
    void assertion;
    return Promise.reject(
      new Error('SAML provider is not implemented in Milestone B1.'),
    );
  }
}
