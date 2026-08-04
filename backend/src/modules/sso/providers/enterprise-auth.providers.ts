/**
 * Enterprise authentication interfaces (B008).
 * Mock providers satisfy the contracts; real Okta/Azure wiring comes later.
 */

export interface OidcAuthResult {
  email: string;
  externalId: string;
  name?: string;
}

export interface SamlAuthResult {
  email: string;
  externalId: string;
  name?: string;
}

export interface OidcProvider {
  readonly name: 'oidc';
  getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
    clientId: string;
    authorizationUrl: string;
    scopes?: string;
  }): Promise<string>;
  exchangeCode(params: {
    code: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }): Promise<OidcAuthResult>;
}

export interface SamlProvider {
  readonly name: 'saml';
  getLoginRedirectUrl(params: {
    entityId: string;
    ssoUrl: string;
  }): Promise<string>;
  validateAssertion(assertion: string): Promise<SamlAuthResult>;
}

export class MockOidcProvider implements OidcProvider {
  readonly name = 'oidc' as const;

  getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
    clientId: string;
    authorizationUrl: string;
    scopes?: string;
  }): Promise<string> {
    const url = new URL(params.authorizationUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', params.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', params.scopes ?? 'openid profile email');
    url.searchParams.set('state', params.state);
    url.searchParams.set('mock', 'true');
    return Promise.resolve(url.toString());
  }

  exchangeCode(params: {
    code: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }): Promise<OidcAuthResult> {
    void params.tokenUrl;
    void params.clientId;
    void params.clientSecret;
    void params.redirectUri;
    // Mock codes look like: mock:<email>
    const email = params.code.startsWith('mock:')
      ? params.code.slice('mock:'.length)
      : `${params.code}@mock-oidc.local`;
    return Promise.resolve({
      email: email.toLowerCase(),
      externalId: `oidc:${email.toLowerCase()}`,
      name: email.split('@')[0],
    });
  }
}

export class MockSamlProvider implements SamlProvider {
  readonly name = 'saml' as const;

  getLoginRedirectUrl(params: {
    entityId: string;
    ssoUrl: string;
  }): Promise<string> {
    const url = new URL(params.ssoUrl);
    url.searchParams.set('SAMLRequest', 'mock-saml-request');
    url.searchParams.set('entityId', params.entityId);
    url.searchParams.set('mock', 'true');
    return Promise.resolve(url.toString());
  }

  validateAssertion(assertion: string): Promise<SamlAuthResult> {
    const email = assertion.startsWith('mock:')
      ? assertion.slice('mock:'.length)
      : `${assertion}@mock-saml.local`;
    return Promise.resolve({
      email: email.toLowerCase(),
      externalId: `saml:${email.toLowerCase()}`,
      name: email.split('@')[0],
    });
  }
}
