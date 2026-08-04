import {
  MockOidcProvider,
  MockSamlProvider,
} from './enterprise-auth.providers';

describe('enterprise auth mock providers', () => {
  it('builds OIDC authorize URLs', async () => {
    const oidc = new MockOidcProvider();
    const url = await oidc.getAuthorizationUrl({
      state: 'abc',
      redirectUri: 'https://app.local/callback',
      clientId: 'client',
      authorizationUrl: 'https://idp.local/authorize',
      scopes: 'openid email',
    });
    expect(url).toContain('client_id=client');
    expect(url).toContain('state=abc');
    expect(url).toContain('mock=true');
  });

  it('exchanges mock OIDC codes', async () => {
    const oidc = new MockOidcProvider();
    const result = await oidc.exchangeCode({
      code: 'mock:alice@example.com',
      tokenUrl: 'https://idp.local/token',
      clientId: 'client',
      clientSecret: 'secret',
      redirectUri: 'https://app.local/callback',
    });
    expect(result.email).toBe('alice@example.com');
    expect(result.externalId).toContain('oidc:');
  });

  it('validates mock SAML assertions', async () => {
    const saml = new MockSamlProvider();
    const result = await saml.validateAssertion('mock:bob@example.com');
    expect(result.email).toBe('bob@example.com');
    expect(result.externalId).toContain('saml:');
  });
});
