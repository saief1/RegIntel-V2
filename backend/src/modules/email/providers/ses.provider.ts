import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailMessage, EmailProvider, EmailSendResult } from '../email.types';

/**
 * AWS SES stub — interface-ready. Real SigV4 signing lands when AWS SDK
 * dependency is approved. Logs intent and returns a deterministic stub id.
 */
@Injectable()
export class SesEmailProvider implements EmailProvider {
  readonly name = 'ses';
  private readonly logger = new Logger(SesEmailProvider.name);

  constructor(private readonly config: ConfigService) {}

  send(message: EmailMessage): Promise<EmailSendResult> {
    const region = this.config.get<string>('email.sesRegion') ?? 'us-east-1';
    this.logger.warn(
      `SES provider stub: would send to=${message.to} region=${region} subject="${message.subject}"`,
    );
    return Promise.resolve({
      ok: false,
      provider: this.name,
      error:
        'SES provider is stubbed; configure Resend/SendGrid/SMTP or approve AWS SDK',
    });
  }

  healthCheck(): Promise<'up' | 'down' | 'unconfigured'> {
    return Promise.resolve('unconfigured');
  }
}
