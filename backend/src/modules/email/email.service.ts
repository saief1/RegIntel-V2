import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProviderType } from '@prisma/client';
import { IEmailRepository } from '../../common/repositories/email.repository';
import { EMAIL_REPOSITORY } from '../../common/repositories/tokens';
import { JobsService } from '../queue/jobs.service';
import {
  EMAIL_PROVIDER,
  EmailProvider,
  SYSTEM_EMAIL_TEMPLATES,
} from './email.types';
import { ConsoleEmailProvider } from './providers/console.provider';
import { ResendEmailProvider } from './providers/resend.provider';
import { SendgridEmailProvider } from './providers/sendgrid.provider';
import { SesEmailProvider } from './providers/ses.provider';
import { SmtpEmailProvider } from './providers/smtp.provider';
import { renderTemplate } from './template.engine';

export type SendTemplatedEmailInput = {
  to: string;
  templateKey: string;
  variables?: Record<string, string | number | boolean | undefined | null>;
  organizationId?: string | null;
  userId?: string | null;
  /** When false, skip queue and send immediately (tests / sync paths). */
  enqueue?: boolean;
};

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repo: IEmailRepository,
    @Inject(EMAIL_PROVIDER) private readonly defaultProvider: EmailProvider,
    private readonly consoleProvider: ConsoleEmailProvider,
    private readonly smtpProvider: SmtpEmailProvider,
    private readonly resendProvider: ResendEmailProvider,
    private readonly sendgridProvider: SendgridEmailProvider,
    private readonly sesProvider: SesEmailProvider,
    private readonly config: ConfigService,
    private readonly jobs: JobsService,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const tpl of SYSTEM_EMAIL_TEMPLATES) {
      await this.repo.upsertSystemTemplate({
        ...tpl,
        variables: [...tpl.variables],
      });
    }
    this.logger.log(
      `Seeded ${SYSTEM_EMAIL_TEMPLATES.length} system email templates`,
    );
  }

  isRealEmailEnabled(): boolean {
    return this.config.get<boolean>('featureFlags.useRealEmail') === true;
  }

  resolveProviderName(): EmailProviderType {
    const configured = (
      this.config.get<string>('email.provider') ?? 'console'
    ).toLowerCase();
    switch (configured) {
      case 'smtp':
        return 'SMTP';
      case 'resend':
        return 'RESEND';
      case 'sendgrid':
        return 'SENDGRID';
      case 'ses':
        return 'SES';
      default:
        return 'CONSOLE';
    }
  }

  private providerFor(name: EmailProviderType): EmailProvider {
    switch (name) {
      case 'SMTP':
        return this.smtpProvider;
      case 'RESEND':
        return this.resendProvider;
      case 'SENDGRID':
        return this.sendgridProvider;
      case 'SES':
        return this.sesProvider;
      default:
        return this.consoleProvider;
    }
  }

  async sendTemplated(input: SendTemplatedEmailInput) {
    const useReal = this.isRealEmailEnabled();
    const providerName = useReal ? this.resolveProviderName() : 'CONSOLE';
    const template = await this.repo.findTemplate(
      input.templateKey,
      input.organizationId,
    );
    const subjectTpl = template?.subject ?? String(input.templateKey);
    const htmlTpl = template?.htmlBody ?? '<p>{{body}}</p>';
    const textTpl = template?.textBody ?? '{{body}}';
    const vars = input.variables ?? {};
    const subject = renderTemplate(subjectTpl, vars);
    const html = renderTemplate(htmlTpl, vars);
    const text = renderTemplate(textTpl, vars);

    const delivery = await this.repo.createDelivery({
      organizationId: input.organizationId,
      userId: input.userId,
      toAddress: input.to,
      templateKey: input.templateKey,
      subject,
      provider: providerName,
      payload: { html, text, variables: vars },
    });

    if (input.enqueue !== false) {
      await this.jobs.enqueueEmail({
        organizationId: input.organizationId ?? '',
        userId: input.userId ?? '',
        subject,
        body: text,
        notificationId: delivery.id,
        deliveryId: delivery.id,
        to: input.to,
        templateKey: input.templateKey,
      });
      return { delivery, queued: true };
    }

    const result = await this.deliverById(delivery.id);
    return { delivery: result.delivery, queued: false, result };
  }

  async deliverById(deliveryId: string) {
    const delivery = await this.repo.findDelivery(deliveryId);
    if (!delivery) {
      return { ok: false, error: 'delivery_not_found', delivery: null };
    }

    const attempts = delivery.attempts + 1;
    await this.repo.updateDelivery(deliveryId, {
      status: 'SENDING',
      attempts,
    });

    const payload = (delivery.payload ?? {}) as {
      html?: string;
      text?: string;
    };
    const provider = this.providerFor(delivery.provider);
    const fromAddress =
      this.config.get<string>('email.fromAddress') ?? 'noreply@regintel.local';
    const fromName = this.config.get<string>('email.fromName') ?? 'RegIntel';

    const result = await provider.send({
      to: delivery.toAddress,
      subject: delivery.subject,
      html: payload.html ?? delivery.subject,
      text: payload.text ?? delivery.subject,
      fromAddress,
      fromName,
    });

    if (result.ok) {
      const updated = await this.repo.updateDelivery(deliveryId, {
        status: 'SENT',
        providerMessageId: result.messageId ?? null,
        sentAt: new Date(),
        lastError: null,
      });
      return { ok: true, delivery: updated, result };
    }

    const failed = attempts >= delivery.maxAttempts;
    const updated = await this.repo.updateDelivery(deliveryId, {
      status: failed ? 'FAILED' : 'QUEUED',
      lastError: result.error ?? 'send_failed',
    });
    return { ok: false, delivery: updated, result };
  }

  listTemplates(organizationId?: string | null) {
    return this.repo.listTemplates(organizationId);
  }

  listDeliveries(organizationId: string, page = 1, pageSize = 20) {
    return this.repo.listDeliveries(organizationId, page, pageSize);
  }

  async healthCheck() {
    const name = this.resolveProviderName();
    const status = await this.providerFor(name).healthCheck();
    return {
      provider: name.toLowerCase(),
      status,
      useRealEmail: this.isRealEmailEnabled(),
    };
  }

  /** Webhook placeholder for provider delivery events. */
  handleWebhook(provider: string, body: unknown) {
    this.logger.log(
      JSON.stringify({
        emailWebhook: true,
        provider,
        body,
      }),
    );
    return { received: true, provider };
  }
}
