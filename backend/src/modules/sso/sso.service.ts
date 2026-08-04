import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, SsoProviderType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import {
  decryptSecret,
  encryptSecret,
} from '../../common/crypto/secret-box.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpsertSsoConfigurationDto } from './dto/sso.dto';
import {
  MockOidcProvider,
  MockSamlProvider,
} from './providers/enterprise-auth.providers';

@Injectable()
export class SsoService {
  private readonly oidc = new MockOidcProvider();
  private readonly saml = new MockSamlProvider();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async listConfigurations(organizationId: string) {
    const rows = await this.prisma.ssoConfiguration.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toView(row));
  }

  async upsertConfiguration(
    organizationId: string,
    actorUserId: string,
    dto: UpsertSsoConfigurationDto,
    req: Request,
  ) {
    const existing = await this.prisma.ssoConfiguration.findFirst({
      where: {
        organizationId,
        providerType: dto.providerType,
        name: dto.name,
      },
    });

    const clientSecretEncrypted =
      dto.clientSecret !== undefined
        ? encryptSecret(dto.clientSecret, this.encryptionKey())
        : (existing?.clientSecretEncrypted ?? null);

    const configJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      dto.configJson !== undefined
        ? (dto.configJson as Prisma.InputJsonValue)
        : existing?.configJson !== undefined && existing?.configJson !== null
          ? existing.configJson
          : Prisma.JsonNull;

    const data: Prisma.SsoConfigurationUncheckedUpdateInput = {
      enabled: dto.enabled ?? existing?.enabled ?? false,
      issuer: dto.issuer ?? existing?.issuer ?? null,
      clientId: dto.clientId ?? existing?.clientId ?? null,
      clientSecretEncrypted,
      authorizationUrl:
        dto.authorizationUrl ?? existing?.authorizationUrl ?? null,
      tokenUrl: dto.tokenUrl ?? existing?.tokenUrl ?? null,
      jwksUrl: dto.jwksUrl ?? existing?.jwksUrl ?? null,
      scopes: dto.scopes ?? existing?.scopes ?? 'openid profile email',
      entityId: dto.entityId ?? existing?.entityId ?? null,
      acsUrl: dto.acsUrl ?? existing?.acsUrl ?? null,
      metadataUrl: dto.metadataUrl ?? existing?.metadataUrl ?? null,
      certificate: dto.certificate ?? existing?.certificate ?? null,
      configJson,
    };

    const row = existing
      ? await this.prisma.ssoConfiguration.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.ssoConfiguration.create({
          data: {
            organizationId,
            providerType: dto.providerType,
            name: dto.name,
            enabled: Boolean(data.enabled),
            issuer: (data.issuer as string | null) ?? null,
            clientId: (data.clientId as string | null) ?? null,
            clientSecretEncrypted:
              (data.clientSecretEncrypted as string | null) ?? null,
            authorizationUrl: (data.authorizationUrl as string | null) ?? null,
            tokenUrl: (data.tokenUrl as string | null) ?? null,
            jwksUrl: (data.jwksUrl as string | null) ?? null,
            scopes: (data.scopes as string | null) ?? null,
            entityId: (data.entityId as string | null) ?? null,
            acsUrl: (data.acsUrl as string | null) ?? null,
            metadataUrl: (data.metadataUrl as string | null) ?? null,
            certificate: (data.certificate as string | null) ?? null,
            configJson,
          },
        });

    await this.auditService.record({
      action: existing ? 'sso.config_updated' : 'sso.config_created',
      resource: `sso_configuration:${row.id}`,
      userId: actorUserId,
      organizationId,
      request: req,
      after: { providerType: row.providerType, name: row.name },
    });

    return this.toView(row);
  }

  async setEnabled(
    organizationId: string,
    configurationId: string,
    enabled: boolean,
    actorUserId: string,
    req: Request,
  ) {
    const row = await this.prisma.ssoConfiguration.findFirst({
      where: { id: configurationId, organizationId },
    });
    if (!row) {
      throw new NotFoundException({
        code: 'SSO_CONFIG_NOT_FOUND',
        message: 'SSO configuration not found.',
      });
    }
    const updated = await this.prisma.ssoConfiguration.update({
      where: { id: row.id },
      data: { enabled },
    });
    await this.auditService.record({
      action: enabled ? 'sso.enabled' : 'sso.disabled',
      resource: `sso_configuration:${row.id}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });
    return this.toView(updated);
  }

  async getAuthorizeUrl(
    organizationId: string,
    configurationId: string,
    redirectUri: string,
  ) {
    const row = await this.requireEnabledConfig(
      organizationId,
      configurationId,
    );
    const state = randomBytes(16).toString('hex');

    if (row.providerType === SsoProviderType.OIDC) {
      if (!row.authorizationUrl || !row.clientId) {
        throw new UnauthorizedException({
          code: 'SSO_CONFIG_INCOMPLETE',
          message: 'OIDC authorizationUrl and clientId are required.',
        });
      }
      const url = await this.oidc.getAuthorizationUrl({
        state,
        redirectUri,
        clientId: row.clientId,
        authorizationUrl: row.authorizationUrl,
        scopes: row.scopes ?? undefined,
      });
      return { url, state, providerType: row.providerType };
    }

    const ssoUrl =
      row.metadataUrl ??
      (typeof row.configJson === 'object' &&
      row.configJson &&
      'ssoUrl' in row.configJson
        ? String((row.configJson as { ssoUrl?: string }).ssoUrl)
        : null);
    if (!row.entityId || !ssoUrl) {
      throw new UnauthorizedException({
        code: 'SSO_CONFIG_INCOMPLETE',
        message: 'SAML entityId and SSO URL are required.',
      });
    }
    const url = await this.saml.getLoginRedirectUrl({
      entityId: row.entityId,
      ssoUrl,
    });
    return { url, state, providerType: row.providerType };
  }

  async mockCallback(
    organizationId: string,
    configurationId: string,
    codeOrAssertion: string,
  ) {
    const row = await this.requireEnabledConfig(
      organizationId,
      configurationId,
    );

    if (row.providerType === SsoProviderType.OIDC) {
      const clientSecret = row.clientSecretEncrypted
        ? decryptSecret(row.clientSecretEncrypted, this.encryptionKey())
        : 'mock-secret';
      const result = await this.oidc.exchangeCode({
        code: codeOrAssertion,
        tokenUrl: row.tokenUrl ?? 'https://mock-idp.local/token',
        clientId: row.clientId ?? 'mock-client',
        clientSecret,
        redirectUri: 'https://app.regintel.local/sso/callback',
      });
      return { providerType: row.providerType, ...result, mock: true };
    }

    const result = await this.saml.validateAssertion(codeOrAssertion);
    return { providerType: row.providerType, ...result, mock: true };
  }

  async ensureMockDefaults(organizationId: string) {
    const count = await this.prisma.ssoConfiguration.count({
      where: { organizationId },
    });
    if (count > 0) {
      return this.listConfigurations(organizationId);
    }

    await this.prisma.ssoConfiguration.createMany({
      data: [
        {
          organizationId,
          providerType: 'OIDC',
          name: 'Mock Okta OIDC',
          enabled: false,
          issuer: 'https://mock-okta.regintel.local',
          clientId: 'regintel-mock-oidc',
          authorizationUrl:
            'https://mock-okta.regintel.local/oauth2/v1/authorize',
          tokenUrl: 'https://mock-okta.regintel.local/oauth2/v1/token',
          jwksUrl: 'https://mock-okta.regintel.local/oauth2/v1/keys',
          scopes: 'openid profile email',
          configJson: { provider: 'okta', mode: 'mock' },
        },
        {
          organizationId,
          providerType: 'SAML',
          name: 'Mock Azure AD SAML',
          enabled: false,
          entityId: 'https://auth.regintel.local/saml/metadata',
          acsUrl: 'https://app.regintel.local/sso/saml/acs',
          metadataUrl: 'https://mock-azure.regintel.local/saml/sso',
          certificate: 'MOCK-CERTIFICATE',
          configJson: {
            provider: 'azuread',
            mode: 'mock',
            ssoUrl: 'https://mock-azure.regintel.local/saml/sso',
          },
        },
      ],
    });
    return this.listConfigurations(organizationId);
  }

  private async requireEnabledConfig(
    organizationId: string,
    configurationId: string,
  ) {
    const row = await this.prisma.ssoConfiguration.findFirst({
      where: { id: configurationId, organizationId },
    });
    if (!row) {
      throw new NotFoundException({
        code: 'SSO_CONFIG_NOT_FOUND',
        message: 'SSO configuration not found.',
      });
    }
    if (!row.enabled) {
      throw new UnauthorizedException({
        code: 'SSO_DISABLED',
        message: 'SSO configuration is disabled.',
      });
    }
    return row;
  }

  private toView(row: {
    id: string;
    organizationId: string;
    providerType: SsoProviderType;
    name: string;
    enabled: boolean;
    issuer: string | null;
    clientId: string | null;
    clientSecretEncrypted: string | null;
    authorizationUrl: string | null;
    tokenUrl: string | null;
    jwksUrl: string | null;
    scopes: string | null;
    entityId: string | null;
    acsUrl: string | null;
    metadataUrl: string | null;
    certificate: string | null;
    configJson: unknown;
  }) {
    return {
      id: row.id,
      organizationId: row.organizationId,
      providerType: row.providerType,
      name: row.name,
      enabled: row.enabled,
      issuer: row.issuer,
      clientId: row.clientId,
      clientSecretConfigured: !!row.clientSecretEncrypted,
      authorizationUrl: row.authorizationUrl,
      tokenUrl: row.tokenUrl,
      jwksUrl: row.jwksUrl,
      scopes: row.scopes,
      entityId: row.entityId,
      acsUrl: row.acsUrl,
      metadataUrl: row.metadataUrl,
      certificateConfigured: !!row.certificate,
      configJson: row.configJson,
    };
  }

  private encryptionKey(): string {
    return this.configService.getOrThrow<string>('mfaEncryptionKey');
  }
}
